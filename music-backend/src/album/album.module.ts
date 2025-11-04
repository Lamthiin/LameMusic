// music-backend/src/album/album.module.ts (FULL CODE)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from './album.entity';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
// Imports các Entity mà Album Service cần Join
import { Song } from '../song/song.entity'; 
import { Artist } from '../artist/artist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Album, Song, Artist]), // Đăng ký các Entities
  ],
  controllers: [AlbumController],
  providers: [AlbumService],
  exports: [AlbumService]
})
export class AlbumModule {}