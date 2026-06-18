import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChargerStation } from '../chargers/charger-station.entity';

export interface LatLng { lat: number; lng: number }

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(ChargerStation) private readonly stations: Repository<ChargerStation>,
  ) {}

  /** Returns a straight-line polyline and chargers within `corridorKm` of any segment. */
  async plan(source: LatLng, destination: LatLng, connectorType?: string) {
    const polyline = [source, destination]; // Phase 1: straight line; real routing in Phase 2
    const midLat = (source.lat + destination.lat) / 2;
    const midLng = (source.lng + destination.lng) / 2;

    // Diagonal distance / 2 as corridor radius, capped at 200 km.
    const corridorKm = Math.min(
      this.haversine(source.lat, source.lng, destination.lat, destination.lng) / 2,
      200,
    );

    let qb = this.stations
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.connectors', 'c')
      .where(`s.status = 'active'`)
      .andWhere(
        `(6371 * acos(
          cos(radians(:lat)) * cos(radians(s.latitude)) *
          cos(radians(s.longitude) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(s.latitude))
        )) <= :radius`,
        { lat: midLat, lng: midLng, radius: corridorKm },
      );

    if (connectorType) {
      qb = qb.andWhere(`c.connector_type = :connectorType`, { connectorType });
    }

    const stations = await qb.getMany();

    // Order by progress along the source→destination axis.
    const dx = destination.lng - source.lng;
    const dy = destination.lat - source.lat;
    stations.sort((a, b) => {
      const pa = (a.latitude - source.lat) * dy + (Number(a.longitude) - source.lng) * dx;
      const pb = (b.latitude - source.lat) * dy + (Number(b.longitude) - source.lng) * dx;
      return pa - pb;
    });

    const totalDistanceKm = this.haversine(source.lat, source.lng, destination.lat, destination.lng);

    return { polyline, stops: stations, totalDistanceKm };
  }

  async chargersAlongRoute(source: LatLng, destination: LatLng, connectorType?: string) {
    const result = await this.plan(source, destination, connectorType);
    return result.stops;
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.rad(lat2 - lat1);
    const dLng = this.rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.rad(lat1)) * Math.cos(this.rad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private rad(deg: number) { return (deg * Math.PI) / 180; }
}
