import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('vehicles')
@Index(['userId'])
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'vehicle_type', length: 30 })
  vehicleType: string; // 2-wheeler | 3-wheeler | car | commercial

  @Column({ nullable: true, length: 80 })
  brand: string;

  @Column({ nullable: true, length: 80 })
  model: string;

  @Column({ nullable: true, name: 'battery_capacity', type: 'decimal', precision: 6, scale: 2 , transformer: decimalTransformer})
  batteryCapacity: number;

  @Column({ nullable: true, name: 'range_km', type: 'decimal', precision: 7, scale: 2 , transformer: decimalTransformer})
  rangeKm: number;

  @Column({ nullable: true, name: 'connector_type', length: 30 })
  connectorType: string;

  @Column({ nullable: true, name: 'vehicle_number', length: 20 })
  vehicleNumber: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
