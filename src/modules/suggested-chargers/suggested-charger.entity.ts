import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('suggested_chargers')
@Index(['userId'])
export class SuggestedCharger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'charger_name', length: 200 })
  chargerName: string;

  @Column({ nullable: true, name: 'operator_name', length: 120 })
  operatorName: string;

  @Column({ nullable: true, length: 500 })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 , transformer: decimalTransformer})
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 , transformer: decimalTransformer})
  longitude: number;

  @Column({ nullable: true, name: 'connector_type', length: 30 })
  connectorType: string;

  @Column({ nullable: true, name: 'price_per_unit', type: 'decimal', precision: 8, scale: 2 , transformer: decimalTransformer})
  pricePerUnit: number;

  @Column({ nullable: true, length: 512 })
  photo: string;

  @Column({ nullable: true, type: 'text' })
  remarks: string;

  @Column({ default: 'pending', length: 20 })
  status: string; // pending | approved | rejected

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
