import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChargerReport } from './charger-report.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(ChargerReport) private readonly repo: Repository<ChargerReport>) {}

  create(stationId: string, userId: string, dto: CreateReportDto) {
    return this.repo.save(this.repo.create({ ...dto, stationId, userId }));
  }

  async findById(id: string) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Report not found.');
    return r;
  }
}
