import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(@InjectDataSource() private readonly db: DataSource) {}

  // Runs every hour — deletes OTPs that expired more than 1 hour ago.
  @Cron(CronExpression.EVERY_HOUR)
  async purgeExpiredOtps() {
    const result = await this.db.query(
      `DELETE FROM otp_codes WHERE expires_at < NOW() - INTERVAL '1 hour'`,
    );
    const deleted = result[1] ?? 0;
    if (deleted > 0) this.logger.log(`Purged ${deleted} expired OTP rows`);
  }
}
