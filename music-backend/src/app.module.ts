// music-backend/src/app.module.ts (BẢN CHÍNH XÁC)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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

@Module({
  imports: [
    // 1. Cấu hình kết nối Database
    TypeOrmModule.forRoot({
      type: 'mysql', // <-- DÒNG NÀY SẼ SỬA LỖI CỦA BẠN
      host: 'localhost',
      port: 3306,
      username: 'hiin', // Đảm bảo đúng username
      password: '1234',     // Đảm bảo đúng password
      database: 'musicdb',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, 
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}