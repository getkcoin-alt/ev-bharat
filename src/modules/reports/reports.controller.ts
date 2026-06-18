import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@UseGuards(JwtAuthGuard)
@Controller()
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Post('chargers/:id/reports')
  create(
    @Param('id') stationId: string,
    @CurrentUser() u: JwtPayload,
    @Body() dto: CreateReportDto,
  ) {
    return this.svc.create(stationId, u.sub, dto);
  }

  @Get('reports/:id')
  findOne(@Param('id') id: string) {
    return this.svc.findById(id);
  }
}
