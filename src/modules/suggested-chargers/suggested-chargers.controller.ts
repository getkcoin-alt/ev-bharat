import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { SuggestedChargersService } from './suggested-chargers.service';

@ApiTags('suggested-chargers')
@UseGuards(JwtAuthGuard)
@Controller('suggested-chargers')
export class SuggestedChargersController {
  constructor(private readonly svc: SuggestedChargersService) {}

  @Post()
  create(@CurrentUser() u: JwtPayload, @Body() dto: CreateSuggestionDto) {
    return this.svc.create(u.sub, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findById(id);
  }
}
