// music-backend/src/notification/notification.module.ts (BẢN SỬA LỖI FINAL)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller'; // <-- CẦN ĐĂNG KÝ
import { Artist } from '../artist/artist.entity'; 
import { User } from '../user/user.entity'; 
import { Follow } from '../follow/follow.entity'; 

@Module({
  imports: [
    // Đăng ký các Entities cần thiết cho Service
    TypeOrmModule.forFeature([Notification, User, Artist, Follow])
  ],
  controllers: [NotificationController], // <-- PHẢI ĐĂNG KÝ CONTROLLER
  providers: [NotificationService],
  exports: [NotificationService], 
})
export class NotificationModule {}