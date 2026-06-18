import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChargerConnector } from './charger-connector.entity';
import { ChargerStation } from './charger-station.entity';
import { ChargerFilterDto, ChargerSearchDto, NearbyQueryDto } from './dto/charger-query.dto';

export interface Page<T> {
  items: T[];
  meta: { page: number; perPage: number; total: number };
}

@Injectable()
export class ChargersService {
  constructor(
    @InjectRepository(ChargerStation) private readonly stations: Repository<ChargerStation>,
    @InjectRepository(ChargerConnector) private readonly connectors: Repository<ChargerConnector>,
  ) {}

  async getNearby(q: NearbyQueryDto): Promise<Page<ChargerStation & { distanceKm: number }>> {
    const { lat, lng, radius = 25, page = 1, perPage = 20 } = q;

    const haversine = `(6371 * acos(LEAST(1.0,
      cos(radians(:lat)) * cos(radians(CAST(s.latitude AS float))) *
      cos(radians(CAST(s.longitude AS float)) - radians(:lng)) +
      sin(radians(:lat)) * sin(radians(CAST(s.latitude AS float)))
    )))`;

    // Step 1: get station IDs + distances within radius (no join to avoid column groups)
    const rawRows = await this.stations
      .createQueryBuilder('s')
      .select('s.id', 'id')
      .addSelect(haversine, 'dist')
      .where(`s.status = 'active'`)
      .andWhere(`${haversine} <= :radius`)
      .orderBy('dist', 'ASC')
      .setParameters({ lat, lng, radius })
      .getRawMany<{ id: string; dist: string }>();

    if (!rawRows.length) return { items: [], meta: { page, perPage, total: 0 } };

    const distMap = new Map(rawRows.map((r) => [r.id, parseFloat(r.dist)]));
    const orderedIds = rawRows.map((r) => r.id);

    // Step 2: fetch full entities with connectors for the IDs on this page
    const pageIds = orderedIds.slice((page - 1) * perPage, page * perPage);
    const entities = await this.stations.find({
      where: pageIds.map((id) => ({ id })),
      relations: { connectors: true },
    });

    // Restore distance-sort order (find() doesn't guarantee it)
    entities.sort((a, b) => (distMap.get(a.id) ?? 0) - (distMap.get(b.id) ?? 0));

    const items = entities.map((e) => ({ ...e, distanceKm: distMap.get(e.id) ?? 0 }));

    return { items, meta: { page, perPage, total: rawRows.length } };
  }

  async search(q: ChargerSearchDto): Promise<Page<ChargerStation>> {
    const { q: query, page = 1, perPage = 20 } = q;
    const like = `%${query.toLowerCase()}%`;

    const [items, total] = await this.stations
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.connectors', 'c')
      .where(`s.status = 'active'`)
      .andWhere(
        `(LOWER(s.station_name) LIKE :like OR LOWER(s.city) LIKE :like OR
          LOWER(s.address) LIKE :like OR LOWER(s.operator_name) LIKE :like)`,
        { like },
      )
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return { items, meta: { page, perPage, total } };
  }

  async filter(q: ChargerFilterDto): Promise<Page<ChargerStation>> {
    const { connector, operator, chargerType, minRating, status = 'active', page = 1, perPage = 20 } = q;

    const qb = this.stations
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.connectors', 'c')
      .where(`s.status = :status`, { status });

    if (connector) qb.andWhere(`c.connector_type = :connector`, { connector });
    if (operator) qb.andWhere(`LOWER(s.operator_name) LIKE :op`, { op: `%${operator.toLowerCase()}%` });
    if (chargerType) qb.andWhere(`c.charger_type = :chargerType`, { chargerType });
    if (minRating) qb.andWhere(`s.rating >= :minRating`, { minRating });

    const [items, total] = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return { items, meta: { page, perPage, total } };
  }

  async findById(id: string): Promise<ChargerStation> {
    const station = await this.stations.findOne({
      where: { id },
      relations: { connectors: true },
    });
    if (!station) throw new NotFoundException('Charger station not found.');
    return station;
  }

  async findByCity(city: string, page = 1, perPage = 20): Promise<Page<ChargerStation>> {
    const [items, total] = await this.stations
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.connectors', 'c')
      .where(`s.status = 'active' AND LOWER(s.city) = :city`, { city: city.toLowerCase() })
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();
    return { items, meta: { page, perPage, total } };
  }

  async bulkUpsert(stations: Partial<ChargerStation>[]): Promise<{ upserted: number }> {
    await this.stations.save(stations.map((s) => this.stations.create(s)));
    return { upserted: stations.length };
  }

  private paginate<T>(items: T[], page: number, perPage: number): Page<T> {
    const total = items.length;
    const slice = items.slice((page - 1) * perPage, page * perPage);
    return { items: slice, meta: { page, perPage, total } };
  }
}
