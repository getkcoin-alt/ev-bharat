import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargingHistory } from './charging-history.entity';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChargingHistory])],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
