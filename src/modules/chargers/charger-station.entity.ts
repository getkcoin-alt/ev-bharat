import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChargerConnector } from './charger-connector.entity';

@Entity('charger_stations')
@Index(['status'])
export class ChargerStation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operator_id', nullable: true })
  operatorId: string;

  @Column({ name: 'operator_name', nullable: true, length: 120 })
  operatorName: string;

  @Column({ name: 'station_name', length: 200 })
  stationName: string;

  @Column({ length: 500 })
  address: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 100 })
  state: string;

  @Column({ nullable: true, length: 10 })
  pincode: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 , transformer: decimalTransformer})
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 , transformer: decimalTransformer})
  longitude: number;

  @Column({ nullable: true, name: 'opening_hours', length: 50 })
  openingHours: string;

  @Column({ nullable: true, name: 'contact_number', length: 20 })
  contactNumber: string;

  @Column({ default: false, name: 'parking_available' })
  parkingAvailable: boolean;

  @Column({ nullable: true, type: 'decimal', precision: 3, scale: 2 , transformer: decimalTransformer})
  rating: number;

  @Column({ default: 0, name: 'review_count' })
  reviewCount: number;

  @Column({ default: 'active', length: 30 })
  status: string; // active | inactive | pending

  @Column({ type: 'simple-array', nullable: true })
  amenities: string[];

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @OneToMany(() => ChargerConnector, (c) => c.station, { cascade: true, eager: true })
  connectors: ChargerConnector[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
