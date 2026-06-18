import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargerStation } from '../chargers/charger-station.entity';
import { ChargerReview } from './charger-review.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChargerReview, ChargerStation])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
