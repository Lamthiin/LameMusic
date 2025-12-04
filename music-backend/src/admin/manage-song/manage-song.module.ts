// src/admin/manage-song/manage-song.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Artist } from '../../artist/artist.entity';
import { Album } from '../../album/album.entity';


import { ManageSongController } from './manage-song.controller';
import { ManageSongService } from './manage-song.service';

import { SharedModule } from '../../shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Song } from '../../song/song.entity';
import { CategoryModule } from '../../category/category.module';
import { Lyrics } from '../../lyrics/lyrics.entity';  
import { NotificationModule } from '../../notification/notification.module';


@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([Song, Artist, Album, Lyrics]),
    CategoryModule,
    NotificationModule,

    // Upload file vào RAM để gửi lên R2
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  ],
  controllers: [ManageSongController],
  providers: [ManageSongService],
})
export class ManageSongModule {}
