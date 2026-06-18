import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly svc: FavoritesService) {}

  @Get()
  list(@CurrentUser() u: JwtPayload) {
    return this.svc.list(u.sub);
  }

  @Post()
  add(@CurrentUser() u: JwtPayload, @Body('stationId') stationId: string) {
    return this.svc.add(u.sub, stationId);
  }

  @Delete(':stationId')
  @HttpCode(204)
  remove(@Param('stationId') stationId: string, @CurrentUser() u: JwtPayload) {
    return this.svc.remove(u.sub, stationId);
  }
}
