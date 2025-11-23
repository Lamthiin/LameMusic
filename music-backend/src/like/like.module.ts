// music-backend/src/like/like.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLikedSongs } from './user-liked-songs.entity';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { AuthModule } from '../auth/auth.module'; // Cần AuthModule để dùng AuthGuard
import { User } from '../user/user.entity';
import { Song } from '../song/song.entity';

@Module({
  imports: [
        TypeOrmModule.forFeature([UserLikedSongs, User, Song]), // Đăng ký bảng trung gian
        AuthModule,
    ],
    providers: [LikeService],
    controllers: [LikeController],
    exports: [LikeService],
})
export class LikeModule {}