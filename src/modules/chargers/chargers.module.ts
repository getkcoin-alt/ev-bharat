import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargerConnector } from './charger-connector.entity';
import { ChargerStation } from './charger-station.entity';
import { ChargersController } from './chargers.controller';
import { ChargersService } from './chargers.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChargerStation, ChargerConnector])],
  controllers: [ChargersController],
  providers: [ChargersService],
  exports: [ChargersService],
})
export class ChargersModule {}
