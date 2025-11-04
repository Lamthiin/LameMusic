// music-backend/src/artist/artist.module.ts (BẢN SỬA LỖI DEPENDENCY)
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './artist.entity';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { AuthModule } from '../auth/auth.module';

// === IMPORT CÁC ENTITY LIÊN QUAN (BỊ THIẾU) ===
import { User } from '../user/user.entity';
import { Song } from '../song/song.entity';
import { Album } from '../album/album.entity';
import { Role } from '../role/role.entity'; // <-- (1) IMPORT ROLE ENTITY
// ===================================

@Module({
  imports: [
    // === PHẢI ĐĂNG KÝ TẤT CẢ ENTITY MÀ 'relations' SỬ DỤNG ===
    TypeOrmModule.forFeature([Artist, User, Song, Album, Role]),
    // ===================================================
    forwardRef(() => AuthModule), // (AuthGuard dùng trong Controller)
  ],
  controllers: [ArtistController],
  providers: [ArtistService],
  exports: [ArtistService] 
})
export class ArtistModule {}