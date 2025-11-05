// music-backend/src/album/album.module.ts (CẬP NHẬT)
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from './album.entity';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
import { Song } from '../song/song.entity'; 
import { Artist } from '../artist/artist.entity';
import { AuthModule } from '../auth/auth.module'; // <-- (1) IMPORT AUTH
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Album, Song, Artist]), 
    forwardRef(() => AuthModule), // <-- (2) THÊM AUTH
    
    // (3) CẤU HÌNH UPLOAD ẢNH BÌA (COVERS)
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/covers', // <-- Thư mục lưu ảnh bìa
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      // (Thêm fileFilter, limits giống ArtistModule)
    }),
  ],
  controllers: [AlbumController],
  providers: [AlbumService],
  exports: [AlbumService]
})
export class AlbumModule {}