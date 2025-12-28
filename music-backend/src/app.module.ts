// music-backend/src/app.module.ts (BẢN CHÍNH XÁC)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

// Import các module tính năng
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SongModule } from './song/song.module';
import { ArtistModule } from './artist/artist.module'; // <-- IMPORT MỚI
import { MailerModule } from '@nestjs-modules/mailer'; // <-- (1) IMPORT
import { LikeModule } from './like/like.module'; // <-- THÊM DÒNG NÀY
import { TotpModule } from './totp/totp.module';
import { CategoryModule } from './category/category.module'; // <-- IMPORT MỚI
import { PlaylistModule } from './playlist/playlist.module';
import { SearchModule } from './search/search.module';
import { FollowModule } from './follow/follow.module'; // <-- IMPORT MỚI
import { AlbumModule } from './album/album.module';
import { History } from './history/history.entity'; // <-- IMPORT MỚI
import { HistoryModule } from './history/history.module'; // <-- IMPORT MỚI
import { AdminModule } from './admin/admin.module';
import { ManageUserModule } from './admin/manage-user/manage-user.module';
import { DashboardModule } from './admin/dashboard/dashboard.module';
import { ReportModule } from './report/report.module'; // <-- IMPORT MỚI
import { NotificationModule } from './notification/notification.module';
import { RateLimitModule } from './common/rate-limit.module'; // <-- IMPORT MỚI
import { AdminProfileModule } from './admin/admin-profile/admin-profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 1. Cấu hình kết nối Database
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const host = process.env.DB_HOST;
        const port = Number(process.env.DB_PORT);

        if (!host) throw new Error('DB_HOST missing');
        if (!port) throw new Error('DB_PORT missing');
        if (host === 'localhost' || host === '127.0.0.1') {
          throw new Error('DB_HOST is localhost (wrong for Railway)');
        }

    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // ⭐ BẮT BUỘC cho Railway
      },
      autoLoadEntities: true,
      synchronize: false,
    };
  },
}),
    

    // 2. Các module tính năng
    RoleModule,
    UserModule,
    AuthModule,
    SongModule,
    ArtistModule,
    LikeModule,
    TotpModule,
    CategoryModule,
    PlaylistModule,
    SearchModule,
    FollowModule,
    AlbumModule,
    HistoryModule,
    AdminModule,
    ManageUserModule, 
    DashboardModule,
    ReportModule,
    NotificationModule,
    RateLimitModule,
    AdminProfileModule,
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}