import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('charger_reviews')
@Index(['stationId'])
@Index(['userId'])
export class ChargerReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ type: 'smallint' })
  rating: number; // 1-5

  @Column({ nullable: true, name: 'review_text', type: 'text' })
  reviewText: string;

  @Column({ nullable: true, name: 'waiting_time', type: 'smallint' })
  waitingTime: number;

  @Column({ nullable: true, name: 'cleanliness_rating', type: 'smallint' })
  cleanlinessRating: number;

  @Column({ nullable: true, name: 'safety_rating', type: 'smallint' })
  safetyRating: number;

  @Column({ nullable: true, name: 'staff_rating', type: 'smallint' })
  staffRating: number;

  @Column({ nullable: true, name: 'charger_working' })
  chargerWorking: boolean;

  @Column({ nullable: true, length: 512 })
  photo: string;

  @Column({ default: 'pending', length: 20 })
  status: string; // pending | approved | rejected

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
