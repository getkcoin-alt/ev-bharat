import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargerStation } from '../chargers/charger-station.entity';
import { ChargerConnector } from '../chargers/charger-connector.entity';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChargerStation, ChargerConnector])],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
