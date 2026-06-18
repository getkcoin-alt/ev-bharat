import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('charger_reports')
@Index(['stationId'])
@Index(['userId'])
export class ChargerReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ name: 'issue_type', length: 50 })
  issueType: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true, length: 512 })
  photo: string;

  @Column({ default: 'open', length: 20 })
  status: string; // open | investigating | resolved

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
