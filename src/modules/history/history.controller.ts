import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateHistoryDto } from './dto/history.dto';
import { HistoryService } from './history.service';

@ApiTags('history')
@UseGuards(JwtAuthGuard)
@Controller('charging-history')
export class HistoryController {
  constructor(private readonly svc: HistoryService) {}

  @Get()
  list(@CurrentUser() u: JwtPayload, @Query('page') page = 1, @Query('perPage') perPage = 20) {
    return this.svc.list(u.sub, +page, +perPage);
  }

  @Post()
  create(@CurrentUser() u: JwtPayload, @Body() dto: CreateHistoryDto) {
    return this.svc.create(u.sub, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return this.svc.remove(id, u.sub);
  }
}
