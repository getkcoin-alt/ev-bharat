import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { OtpCode } from './modules/auth/otp.entity';
import { ChargerConnector } from './modules/chargers/charger-connector.entity';
import { ChargerStation } from './modules/chargers/charger-station.entity';
import { ChargersModule } from './modules/chargers/chargers.module';
import { Favorite } from './modules/favorites/favorite.entity';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ChargingHistory } from './modules/history/charging-history.entity';
import { HistoryModule } from './modules/history/history.module';
import { AppNotification } from './modules/notifications/notification.entity';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChargerReport } from './modules/reports/charger-report.entity';
import { ReportsModule } from './modules/reports/reports.module';
import { ChargerReview } from './modules/reviews/charger-review.entity';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RouteModule } from './modules/route/route.module';
import { SuggestedCharger } from './modules/suggested-chargers/suggested-charger.entity';
import { SuggestedChargersModule } from './modules/suggested-chargers/suggested-chargers.module';
import { User } from './modules/users/user.entity';
import { UsersModule } from './modules/users/users.module';
import { Vehicle } from './modules/vehicles/vehicle.entity';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ScheduleModule.forRoot(),

    // Global rate limit: 100 req / 60 s per IP. Auth routes override this lower.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        entities: [
          User, OtpCode, Vehicle,
          ChargerStation, ChargerConnector,
          ChargerReview, ChargerReport, SuggestedCharger,
          Favorite, ChargingHistory, AppNotification,
        ],
        synchronize: config.get<string>('nodeEnv') !== 'production',
        ssl: config.get<string>('nodeEnv') === 'production'
          ? { rejectUnauthorized: false }
          : false,
        extra: {
          max: 25,               // connection pool ceiling
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 5_000,
        },
      }),
    }),

    AuthModule,
    UsersModule,
    VehiclesModule,
    ChargersModule,
    FavoritesModule,
    ReviewsModule,
    ReportsModule,
    SuggestedChargersModule,
    HistoryModule,
    RouteModule,
    NotificationsModule,
    MaintenanceModule,
  ],
  controllers: [HealthController],
  providers: [
    // Apply ThrottlerGuard globally; individual routes can use @Throttle() to override.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
