import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Artist } from '../artist/artist.entity';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';

import { Album } from '../album/album.entity';        // ⭐ THÊM
import { Song } from '../song/song.entity';          // ⭐ THÊM

import { AdminArtistController } from './artist/admin-artist.controller';
import { AdminArtistService } from './artist/admin-artist.service';

import { ManageSongModule } from './manage-song/manage-song.module';
import { MulterModule } from '@nestjs/platform-express/multer/multer.module';
import { diskStorage } from 'multer';

import { AdminAlbumController } from './album/admin-album.controller';
import { AdminAlbumService } from './album/admin-album.service';
import { AdminGenreController } from "./genre/admin-genre.controller";
import { AdminGenreService } from "./genre/admin-genre.service";
import { Category } from "../category/category.entity";
import { CategoryModule } from '../category/category.module';
import { SharedModule } from '../shared/shared.module';

import * as multer from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Artist, 
      User, 
      Role,
      Album,   // ⭐ BẮT BUỘC
      Song, 
      Category,
         // ⭐ BẮT BUỘC
    ]),
    SharedModule,
    CategoryModule,   // ⭐ BẮT BUỘC
    MulterModule.register({
  storage: multer.memoryStorage(),
}),

    ManageSongModule,
  ],

  controllers: [AdminArtistController, AdminAlbumController, AdminGenreController,], // ⭐ THÊM AdminGenreController
  providers: [AdminArtistService, AdminAlbumService, AdminGenreService,], // ⭐ THÊM AdminGenreService
})
export class AdminModule {}
