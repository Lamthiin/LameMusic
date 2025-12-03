// music-backend/src/notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { Follow } from '../follow/follow.entity';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(Follow)
        private followRepository: Repository<Follow>,
    ) {}

    /**
     * 1. Tạo thông báo cho một người dùng cụ thể (Admin -> Artist)
     * @param recipientUserId ID User nhận (Listener/Artist User ID)
     * @param sourceArtistId ID Artist Profile (Artist.id) - có thể NULL
     */
    async createNotificationForUser(
        recipientUserId: number,
        sourceArtistId: number | null,
        type: NotificationType,
        message: string,
        referenceId: number | null = null,
    ): Promise<void> {
        const notification = this.notificationRepository.create({
            user_id: recipientUserId, // User ID nhận thông báo
            artist_id: sourceArtistId, 
            type: type,
            reference_id: referenceId,
            message: message,
            is_read: false,
        });
        await this.notificationRepository.save(notification);
    }
    
    /**
     * 2. Tạo thông báo cho TẤT CẢ người theo dõi một Artist (Artist -> Listener)
     */
    async createNotificationForFollowers(
        artistProfileId: number, 
        artistName: string,
        type: NotificationType,
        messageSuffix: string, 
        referenceId: number | null = null,
    ): Promise<void> {
        
        const followers = await this.followRepository.find({
            where: { followingId: artistProfileId }, 
            select: ['followerId'], // Lấy ID của người theo dõi (User ID)
        });

        if (followers.length === 0) {
            return;
        }

        const notifications = followers.map(follow => {
            return this.notificationRepository.create({
                user_id: follow.followerId, // User ID nhận thông báo
                artist_id: artistProfileId, 
                type: type,
                reference_id: referenceId,
                message: `📢 ${artistName} ${messageSuffix}`,
            });
        });

        await this.notificationRepository.save(notifications);
    }
    
    async markAsRead(notificationId: number, userId: number): Promise<void> {
        await this.notificationRepository.update(
            { id: notificationId, user_id: userId },
            { is_read: true }
        );
    }

/**
     * Lấy danh sách thông báo của User (mục đích hiển thị chuông)
     */
    async getMyNotifications(userId: number, take: number = 10): Promise<Notification[]> {
        // === FIX LỖI TS2353: DÙNG CỘT KHÓA NGOẠI DẠNG SỐ 'user_id' ===
        const notifications = await this.notificationRepository.find({
            where: { user_id: userId }, // <-- Dùng user_id (đã định nghĩa trong Entity)
            order: { created_at: 'DESC' },   
            take: take,                      
            relations: ['sourceArtist'], // Load Artist nguồn (nếu có)
        });

        return notifications;
    }
}