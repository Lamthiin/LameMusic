// music-backend/src/follow/follow.module.ts (BẢN SỬA LỖI DI FINAL)
import { Module, forwardRef } from '@nestjs/common'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './follow.entity';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/user.entity'; // <-- (1) IMPORT USER
import { Artist } from '../artist/artist.entity'; // <-- (2) IMPORT ARTIST

@Module({
  imports: [
    // === (3) ĐĂNG KÝ CÁC REPOSITORIES BỊ THIẾU ===
    TypeOrmModule.forFeature([Follow, User, Artist]),
    // ===========================================
    forwardRef(() => AuthModule), 
  ],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [TypeOrmModule] 
})
export class FollowModule {}