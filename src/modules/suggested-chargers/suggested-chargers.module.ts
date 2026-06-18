import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuggestedCharger } from './suggested-charger.entity';
import { SuggestedChargersController } from './suggested-chargers.controller';
import { SuggestedChargersService } from './suggested-chargers.service';

@Module({
  imports: [TypeOrmModule.forFeature([SuggestedCharger])],
  controllers: [SuggestedChargersController],
  providers: [SuggestedChargersService],
})
export class SuggestedChargersModule {}
