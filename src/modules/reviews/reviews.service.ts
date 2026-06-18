import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChargerStation } from '../chargers/charger-station.entity';
import { ChargerReview } from './charger-review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ChargerReview) private readonly repo: Repository<ChargerReview>,
    @InjectRepository(ChargerStation) private readonly stations: Repository<ChargerStation>,
  ) {}

  async create(stationId: string, userId: string, dto: CreateReviewDto) {
    const review = await this.repo.save(
      this.repo.create({ ...dto, stationId, userId, status: 'pending' }),
    );
    await this.refreshRating(stationId);
    return review;
  }

  async list(stationId: string, page = 1, perPage = 20) {
    const [items, total] = await this.repo.findAndCount({
      where: { stationId, status: 'approved' },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return { items, meta: { page, perPage, total } };
  }

  async listMine(userId: string, page = 1, perPage = 20) {
    const [items, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return { items, meta: { page, perPage, total } };
  }

  private async refreshRating(stationId: string) {
    const raw = await this.repo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.station_id = :stationId AND r.status = :s', { stationId, s: 'approved' })
      .getRawOne<{ avg: string | null; count: string }>();

    const avg = raw?.avg ? parseFloat(parseFloat(raw.avg).toFixed(2)) : undefined;
    const reviewCount = parseInt(raw?.count ?? '0', 10);
    await this.stations.update(stationId, { rating: avg, reviewCount });
  }
}
