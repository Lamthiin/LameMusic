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
import { MulterModule } from '@nestjs/platform-express'; // <-- (1) IMPORT MULTER
import { diskStorage } from 'multer'; // <-- (2) IMPORT diskStorage
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { Follow } from '../follow/follow.entity'

@Module({
  imports: [
    // === PHẢI ĐĂNG KÝ TẤT CẢ ENTITY MÀ 'relations' SỬ DỤNG ===
    TypeOrmModule.forFeature([Artist, User, Song, Album, Role, Follow]),
    // ===================================================
    forwardRef(() => AuthModule), // (AuthGuard dùng trong Controller)

    // === (3) CẤU HÌNH UPLOAD AVATAR ===
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/avatars', // Thư mục lưu avatar
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Chỉ chấp nhận file ảnh
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Chỉ hỗ trợ file ảnh (jpg, png, gif)!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
    }),
  ],
  controllers: [ArtistController],
  providers: [ArtistService],
  exports: [ArtistService] 
})
export class ArtistModule {}