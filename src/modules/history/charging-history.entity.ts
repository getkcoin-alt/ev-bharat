import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('charging_history')
@Index(['userId'])
export class ChargingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ nullable: true, name: 'vehicle_id' })
  vehicleId: string;

  @Column({ nullable: true, name: 'station_id' })
  stationId: string;

  @Column({ nullable: true, name: 'station_name', length: 200 })
  stationName: string;

  @Column({ nullable: true, name: 'vehicle_label', length: 100 })
  vehicleLabel: string;

  @Column({ name: 'charging_date' })
  chargingDate: Date;

  @Column({ nullable: true, name: 'units_charged', type: 'decimal', precision: 7, scale: 2 , transformer: decimalTransformer})
  unitsCharged: number;

  @Column({ nullable: true, name: 'amount_paid', type: 'decimal', precision: 10, scale: 2 , transformer: decimalTransformer})
  amountPaid: number;

  @Column({ nullable: true, type: 'smallint' })
  rating: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
