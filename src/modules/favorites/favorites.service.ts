import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChargersService } from '../chargers/chargers.service';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite) private readonly repo: Repository<Favorite>,
    private readonly chargers: ChargersService,
  ) {}

  async list(userId: string) {
    const favs = await this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    const stations = await Promise.all(
      favs.map((f) => this.chargers.findById(f.stationId).catch(() => null)),
    );
    return stations.filter(Boolean);
  }

  async add(userId: string, stationId: string) {
    await this.chargers.findById(stationId); // 404 if not found
    try {
      return await this.repo.save(this.repo.create({ userId, stationId }));
    } catch {
      throw new ConflictException('Already in favourites.');
    }
  }

  async remove(userId: string, stationId: string) {
    const fav = await this.repo.findOne({ where: { userId, stationId } });
    if (!fav) throw new NotFoundException('Favourite not found.');
    await this.repo.remove(fav);
  }
}
