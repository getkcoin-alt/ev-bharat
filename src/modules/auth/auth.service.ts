import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { OtpCode } from './otp.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OtpCode) private readonly otps: Repository<OtpCode>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async sendOtp(mobile: string): Promise<void> {
    const bypass = this.config.get<boolean>('otp.bypass') ?? false;
    const code = bypass
      ? (this.config.get<string>('otp.demo') ?? '123456')
      : Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.otps.save(this.otps.create({ mobile, code, expiresAt }));

    if (!bypass) await this.sendSms(mobile, code);
  }

  async verifyOtp(mobile: string, code: string) {
    const bypass = this.config.get<boolean>('otp.bypass') ?? false;
    const demo = this.config.get<string>('otp.demo') ?? '123456';

    if (!bypass || code !== demo) {
      const record = await this.otps.findOne({
        where: { mobile, code, used: false, expiresAt: MoreThan(new Date()) },
        order: { createdAt: 'DESC' },
      });
      if (!record) throw new BadRequestException('OTP is incorrect or has expired.');
      await this.otps.update(record.id, { used: true });
    }

    let user = await this.users.findOne({ where: { mobile } });
    const isNewUser = !user;
    if (!user) user = await this.users.save(this.users.create({ mobile }));

    const tokens = await this.issueTokens(user);
    return { ...tokens, user, isNewUser };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret') ?? 'dev_refresh',
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user || user.status !== 'active') throw new UnauthorizedException('Account not found.');

    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.users.update(userId, { fcmToken: undefined });
  }

  private async issueTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, mobile: user.mobile };
    const jwtSecret = this.config.get<string>('jwt.secret') ?? 'dev_secret';
    const jwtExpiry = this.config.get<string>('jwt.expiresIn') ?? '15m';
    const refreshSecret = this.config.get<string>('jwt.refreshSecret') ?? 'dev_refresh';
    const refreshExpiry = this.config.get<string>('jwt.refreshExpiresIn') ?? '30d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: payload.sub, mobile: payload.mobile },
        { secret: jwtSecret, expiresIn: jwtExpiry as `${number}${'s'|'m'|'h'|'d'}` },
      ),
      this.jwtService.signAsync(
        { sub: payload.sub, mobile: payload.mobile },
        { secret: refreshSecret, expiresIn: refreshExpiry as `${number}${'s'|'m'|'h'|'d'}` },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async sendSms(mobile: string, code: string): Promise<void> {
    const sid = this.config.get<string>('twilio.accountSid') ?? '';
    const token = this.config.get<string>('twilio.authToken') ?? '';
    const from = this.config.get<string>('twilio.phone') ?? '';
    if (!sid || !token || !from) return;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const twilio = require('twilio') as (sid: string, token: string) => import('twilio').Twilio;
    const client = twilio(sid, token);
    await client.messages.create({
      body: `Your EV Bharat OTP is ${code}. Valid for 10 minutes.`,
      from,
      to: `+91${mobile}`,
    });
  }
}
