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

import { AdminAlbumController } from './album/album.controller';
import { AdminAlbumService } from './album/album.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Artist, 
      User, 
      Role,
      Album,   // ⭐ BẮT BUỘC
      Song,    // ⭐ BẮT BUỘC
    ]),

    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + file.originalname;
          cb(null, unique);
        },
      }),
    }),

    ManageSongModule,
  ],

  controllers: [AdminArtistController, AdminAlbumController],
  providers: [AdminArtistService, AdminAlbumService],
})
export class AdminModule {}
