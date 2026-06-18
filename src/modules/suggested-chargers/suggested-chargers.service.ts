import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { SuggestedCharger } from './suggested-charger.entity';

@Injectable()
export class SuggestedChargersService {
  constructor(@InjectRepository(SuggestedCharger) private readonly repo: Repository<SuggestedCharger>) {}

  create(userId: string, dto: CreateSuggestionDto) {
    return this.repo.save(this.repo.create({ ...dto, userId, status: 'pending' }));
  }

  async findById(id: string) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Suggestion not found.');
    return s;
  }
}
