import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
@Index(['userId'])
export class AppNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true, length: 200 })
  deeplink: string;

  @Column({ default: 'unread', length: 20 })
  status: string; // unread | read

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
