import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    @InjectDataSource() private readonly db: DataSource,
  ) {}

  async getNearby(q: NearbyQueryDto): Promise<Page<ChargerStation & { distanceKm: number }>> {
    const { lat, lng, radius = 25, page = 1, perPage = 20 } = q;

    // Try PostGIS (production). Fall back to Haversine if PostGIS / location column unavailable (local dev).
    let rawRows: { id: string; dist_m: string }[];
    try {
      rawRows = await this.db.query(
        `SELECT s.id,
                ST_Distance(
                  s.location::geography,
                  ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
                ) AS dist_m
           FROM charger_stations s
          WHERE s.status = 'active'
            AND ST_DWithin(
                  s.location::geography,
                  ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
                  $3
                )
          ORDER BY dist_m ASC`,
        [lat, lng, radius * 1000],
      );
    } catch {
      // Haversine fallback — accurate enough for dev, not indexed for scale.
      rawRows = await this.db.query(
        `SELECT id, dist_m FROM (
           SELECT s.id,
                  (6371000 * acos(LEAST(1.0,
                    cos(radians($1)) * cos(radians(CAST(s.latitude AS float))) *
                    cos(radians(CAST(s.longitude AS float)) - radians($2)) +
                    sin(radians($1)) * sin(radians(CAST(s.latitude AS float)))
                  ))) AS dist_m
             FROM charger_stations s
            WHERE s.status = 'active'
         ) sub WHERE dist_m <= $3 ORDER BY dist_m ASC`,
        [lat, lng, radius * 1000],
      );
    }

    if (!rawRows.length) return { items: [], meta: { page, perPage, total: 0 } };

    const distMap = new Map(rawRows.map((r) => [r.id, parseFloat(r.dist_m) / 1000]));
    const orderedIds = rawRows.map((r) => r.id);
    const pageIds = orderedIds.slice((page - 1) * perPage, page * perPage);

    const entities = await this.stations.find({
      where: pageIds.map((id) => ({ id })),
      relations: { connectors: true },
    });
    entities.sort((a, b) => (distMap.get(a.id) ?? 0) - (distMap.get(b.id) ?? 0));

    const items = entities.map((e) => ({ ...e, distanceKm: distMap.get(e.id) ?? 0 }));
    return { items, meta: { page, perPage, total: rawRows.length } };
  }

  async search(q: ChargerSearchDto): Promise<Page<ChargerStation>> {
    const { q: query, page = 1, perPage = 20 } = q;

    // pg_trgm similarity — uses GIN index, avoids leading-wildcard full scan.
    const offset = (page - 1) * perPage;
    const [rows, countRows] = await Promise.all([
      this.db.query<{ id: string }[]>(
        `SELECT id FROM charger_stations
          WHERE status = 'active'
            AND (station_name % $1 OR city % $1 OR address % $1 OR operator_name % $1
                 OR station_name ILIKE $2 OR city ILIKE $2)
          ORDER BY GREATEST(
            similarity(station_name, $1), similarity(city, $1), similarity(address, $1)
          ) DESC
          LIMIT $3 OFFSET $4`,
        [query, `%${query}%`, perPage, offset],
      ),
      this.db.query<[{ count: string }]>(
        `SELECT COUNT(*) FROM charger_stations
          WHERE status = 'active'
            AND (station_name % $1 OR city % $1 OR address % $1 OR operator_name % $1
                 OR station_name ILIKE $2 OR city ILIKE $2)`,
        [query, `%${query}%`],
      ),
    ]);

    const total = parseInt(countRows[0].count, 10);
    if (!rows.length) return { items: [], meta: { page, perPage, total } };

    const items = await this.stations.find({
      where: rows.map(({ id }) => ({ id })),
      relations: { connectors: true },
    });
    return { items, meta: { page, perPage, total } };
  }

  async filter(q: ChargerFilterDto): Promise<Page<ChargerStation>> {
    const { connector, operator, chargerType, minRating, status = 'active', page = 1, perPage = 20 } = q;

    const qb = this.stations
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.connectors', 'c')
      .where(`s.status = :status`, { status });

    if (connector) qb.andWhere(`c.connector_type = :connector`, { connector });
    if (operator) qb.andWhere(`s.operator_name % :op`, { op: operator });
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
}
