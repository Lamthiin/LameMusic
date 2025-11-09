// music-backend/src/song/song.module.ts (ĐÃ SỬA FINAL)
import { Module, BadRequestException, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from './song.entity';
import { Artist } from '../artist/artist.entity';
import { Album } from '../album/album.entity'; 
import { Lyrics } from '../lyrics/lyrics.entity'; // <-- CẦN CÓ
import { UserLikedSongs } from '../like/user-liked-songs.entity'; 
import { AuthModule } from '../auth/auth.module'; 
import { SongService } from './song.service';
import { SongController } from './song.controller';
import { MulterModule } from '@nestjs/platform-express'; // <-- (1) IMPORT MULTER
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Category } from '../category/category.entity';
import { LikeModule } from '../like/like.module';
import { AiModule } from '../ai/ai.module'; // <-- THÊM AI MODULE
import { HistoryModule } from '../history/history.module'; // <-- (1) IMPORT THIẾU

@Module({
  imports: [
    // === ĐĂNG KÝ TẤT CẢ CÁC ENTITY CẦN THIẾT ===
    TypeOrmModule.forFeature([Song, Artist, Album, Lyrics, UserLikedSongs]), 
    // ============================================
    AiModule, // <-- Đảm bảo AiModule được import
    HistoryModule,
    forwardRef(() => AuthModule),
    forwardRef(() => LikeModule),
  // === (2) CẤU HÌNH UPLOAD (NHẠC VÀ ẢNH) ===
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          let path = './uploads/music'; // Mặc định là nhạc
          if (file.fieldname === 'imageFile') {
            path = './uploads/covers'; // Nếu là ảnh bìa
          }
          cb(null, path);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.fieldname === 'audioFile') {
          if (!file.mimetype.match(/\/(mpeg|wav|mp3)$/)) { // Chỉ chấp nhận mp3/wav
            return cb(new BadRequestException('Chỉ hỗ trợ file nhạc (mp3, wav)!'), false);
          }
        } else if (file.fieldname === 'imageFile') {
          if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) { // Chỉ chấp nhận ảnh
            return cb(new BadRequestException('Chỉ hỗ trợ file ảnh (jpg, png)!'), false);
          }
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 20, // 20MB
      },
    }),
    // ==================================
  ],
  controllers: [SongController],
  providers: [SongService],
  exports: [SongService]
})
export class SongModule {}