import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('favorites')
@Unique(['userId', 'stationId'])
@Index(['userId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'station_id' })
  stationId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
