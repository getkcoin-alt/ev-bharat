import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargerReport } from './charger-report.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChargerReport])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
