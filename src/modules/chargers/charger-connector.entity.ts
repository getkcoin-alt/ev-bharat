import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { ChargerStation } from './charger-station.entity';

@Entity('charger_connectors')
export class ChargerConnector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => ChargerStation, (s) => s.connectors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'station_id' })
  station: ChargerStation;

  @RelationId((c: ChargerConnector) => c.station)
  stationId: string;

  @Column({ name: 'connector_type', length: 30 })
  connectorType: string;

  @Column({ name: 'power_output', type: 'decimal', precision: 6, scale: 2 , transformer: decimalTransformer})
  powerOutput: number;

  @Column({ nullable: true, name: 'charger_type', length: 10 })
  chargerType: string; // fast | slow

  @Column({ nullable: true, name: 'price_per_unit', type: 'decimal', precision: 8, scale: 2 , transformer: decimalTransformer})
  pricePerUnit: number;

  @Column({ nullable: true, name: 'session_fee', type: 'decimal', precision: 8, scale: 2 , transformer: decimalTransformer})
  sessionFee: number;

  @Column({ nullable: true, name: 'parking_charges', type: 'decimal', precision: 8, scale: 2 , transformer: decimalTransformer})
  parkingCharges: number;

  @Column({ default: 'unknown', length: 20 })
  status: string; // available | busy | out_of_service | unknown
}
