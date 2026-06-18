import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 15 })
  mobile: string;

  @Column({ nullable: true, length: 120 })
  name: string;

  @Column({ nullable: true, length: 254 })
  email: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, name: 'preferred_connector', length: 30 })
  preferredConnector: string;

  @Column({ default: 'active', length: 20 })
  status: string;

  @Column({ nullable: true, name: 'fcm_token', length: 512 })
  fcmToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
