import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('otp/send')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send OTP to a mobile number' })
  async sendOtp(@Body() dto: SendOtpDto) {
    await this.auth.sendOtp(dto.mobile);
    return { message: 'OTP sent' };
  }

  @Post('otp/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify OTP and receive JWT tokens' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const { accessToken, refreshToken, user, isNewUser } =
      await this.auth.verifyOtp(dto.mobile, dto.code);
    return {
      accessToken,
      refreshToken,
      isNewUser,
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        city: user.city,
        createdAt: user.createdAt,
      },
    };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate access token using refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Invalidate session (clears FCM token)' })
  async logout(@CurrentUser() user: JwtPayload) {
    await this.auth.logout(user.sub);
    return { message: 'Logged out' };
  }
}
