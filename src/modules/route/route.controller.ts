import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RouteService } from './route.service';

@ApiTags('route')
@UseGuards(JwtAuthGuard)
@Controller('route')
export class RouteController {
  constructor(private readonly svc: RouteService) {}

  @Get()
  @ApiOperation({ summary: 'Get route geometry (polyline + total distance)' })
  plan(
    @Query('source') source: string,      // "lat,lng"
    @Query('destination') dest: string,   // "lat,lng"
    @Query('connector') connector?: string,
  ) {
    return this.svc.plan(this.parse(source), this.parse(dest), connector);
  }

  @Get('chargers')
  @ApiOperation({ summary: 'Chargers along a route corridor' })
  chargers(
    @Query('source') source: string,
    @Query('destination') dest: string,
    @Query('connector') connector?: string,
  ) {
    return this.svc.chargersAlongRoute(this.parse(source), this.parse(dest), connector);
  }

  private parse(coord: string) {
    const [lat, lng] = coord.split(',').map(Number);
    return { lat, lng };
  }
}
