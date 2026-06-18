import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@UseGuards(JwtAuthGuard)
@Controller()
export class ReviewsController {
  constructor(private readonly svc: ReviewsService) {}

  @Post('chargers/:id/reviews')
  create(
    @Param('id') stationId: string,
    @CurrentUser() u: JwtPayload,
    @Body() dto: CreateReviewDto,
  ) {
    return this.svc.create(stationId, u.sub, dto);
  }

  @Get('chargers/:id/reviews')
  list(
    @Param('id') stationId: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
  ) {
    return this.svc.list(stationId, +page, +perPage);
  }

  @Get('users/me/reviews')
  mine(@CurrentUser() u: JwtPayload, @Query('page') page = 1, @Query('perPage') perPage = 20) {
    return this.svc.listMine(u.sub, +page, +perPage);
  }
}
