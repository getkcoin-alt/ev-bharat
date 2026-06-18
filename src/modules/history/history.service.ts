import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChargingHistory } from './charging-history.entity';
import { CreateHistoryDto } from './dto/history.dto';

@Injectable()
export class HistoryService {
  constructor(@InjectRepository(ChargingHistory) private readonly repo: Repository<ChargingHistory>) {}

  async list(userId: string, page = 1, perPage = 20) {
    const [items, total] = await this.repo.findAndCount({
      where: { userId },
      order: { chargingDate: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return { items, meta: { page, perPage, total } };
  }

  create(userId: string, dto: CreateHistoryDto) {
    return this.repo.save(this.repo.create({ ...dto, userId }));
  }

  async remove(id: string, userId: string) {
    const h = await this.repo.findOne({ where: { id } });
    if (!h) throw new NotFoundException('Entry not found.');
    if (h.userId !== userId) throw new ForbiddenException();
    await this.repo.remove(h);
  }
}
