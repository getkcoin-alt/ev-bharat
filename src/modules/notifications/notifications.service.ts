import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { AppNotification } from './notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(AppNotification) private readonly repo: Repository<AppNotification>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async list(userId: string, page = 1, perPage = 20) {
    const [items, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return { items, meta: { page, perPage, total } };
  }

  async send(userId: string, title: string, message: string, deeplink?: string): Promise<void> {
    await this.repo.save(this.repo.create({ userId, title, message, deeplink }));

    const user = await this.users.findOne({ where: { id: userId } });
    if (user?.fcmToken) {
      await this.pushFcm(user.fcmToken, title, message, deeplink);
    }
  }

  private async pushFcm(token: string, title: string, body: string, deeplink?: string) {
    const credJson = this.config.get<string>('firebase.credentialsJson');
    if (!credJson) return;

    try {
      if (!getApps().length) {
        initializeApp({ credential: cert(JSON.parse(credJson) as object) });
      }
      await getMessaging().send({
        token,
        notification: { title, body },
        data: deeplink ? { deeplink } : {},
      });
    } catch (err) {
      this.logger.warn(`FCM push failed: ${(err as Error).message}`);
    }
  }
}
