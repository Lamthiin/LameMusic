// music-backend/src/user/user.module.ts (BẢN SỬA LỖI FINAL)
import { Module, forwardRef } from '@nestjs/common'; // <-- (1) IMPORT forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module'; // <-- (2) IMPORT AUTHMODULE
import { Follow } from '../follow/follow.entity';
import { Playlist } from '../playlist/playlist.entity';
import { UserLikedSongs } from '../like/user-liked-songs.entity';
import { Artist } from '../artist/artist.entity'; // <-- (1) IMPORT ARTIST ENTITY

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Playlist, UserLikedSongs, Follow, Artist]),
    // (3) SỬ DỤNG forwardRef ĐỂ TRÁNH VÒNG LẶP
    forwardRef(() => AuthModule), 
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], 
})
export class UserModule {}