import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChargersService } from './chargers.service';
import { ChargerFilterDto, ChargerSearchDto, NearbyQueryDto } from './dto/charger-query.dto';

@ApiTags('chargers')
@UseGuards(JwtAuthGuard)
@Controller()
export class ChargersController {
  constructor(private readonly svc: ChargersService) {}

  @Get('chargers/nearby')
  @ApiOperation({ summary: 'Get nearby chargers by lat/lng' })
  nearby(@Query() q: NearbyQueryDto) {
    return this.svc.getNearby(q);
  }

  @Get('chargers/search')
  @ApiOperation({ summary: 'Search chargers by city/area/name' })
  search(@Query() q: ChargerSearchDto) {
    return this.svc.search(q);
  }

  @Get('chargers')
  @ApiOperation({ summary: 'Filtered & paginated charger list' })
  filter(@Query() q: ChargerFilterDto) {
    return this.svc.filter(q);
  }

  @Get('chargers/:id')
  @ApiOperation({ summary: 'Charger detail' })
  findOne(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Get('cities/:city/chargers')
  @ApiOperation({ summary: 'Chargers by city' })
  byCity(
    @Param('city') city: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
  ) {
    return this.svc.findByCity(city, +page, +perPage);
  }

  // Admin-only bulk upload (no JWT scope enforcement yet — add role guard in production).
  @Post('admin/chargers/bulk')
  @ApiOperation({ summary: 'Admin: bulk upsert charger stations (JSON array)' })
  bulkUpsert(@Body() body: { stations: any[] }) {
    return this.svc.bulkUpsert(body.stations);
  }
}
