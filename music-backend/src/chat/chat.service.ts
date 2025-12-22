import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async saveMessage(data: any) {
    // Chỉ lấy đúng các trường hiện có trong Database
    const newMessage = this.messageRepo.create({
        senderId: String(data.senderId),
        roomId: data.roomId,
        content: data.content,
        isRead: false, 
        createdAt: new Date()
    });
    return await this.messageRepo.save(newMessage);
  }

  async getMessagesByRoom(roomId: string) {
    return await this.messageRepo.find({
      where: { roomId },
      order: { createdAt: 'ASC' },
      // ĐÃ XÓA relations: ['sender'] - Đây là nguyên nhân gây lỗi của bạn
    });
  }

// Sửa trong ChatService.getAllRooms
async getAllRooms(currentUserId: number) {
  return await this.messageRepo.query(`
    SELECT 
      m1.roomId,
      CASE 
        WHEN u.username IS NOT NULL THEN u.username 
        WHEN m1.roomId LIKE 'guest_%' THEN CONCAT('Khách lạ #', UPPER(SUBSTRING(m1.roomId, -4)))
        ELSE 'Người dùng ẩn danh'
      END AS username,
      m1.content AS lastMessage,
      m1.createdAt,
      (
        SELECT COUNT(*) 
        FROM message 
        WHERE roomId = m1.roomId 
        AND isRead = false 
        AND senderId != ?
      ) AS unreadCount
    FROM message m1
    LEFT JOIN user u ON u.id = CASE 
      WHEN m1.roomId LIKE 'user_%' THEN CAST(REPLACE(m1.roomId, 'user_', '') AS UNSIGNED)
      ELSE NULL 
    END
    WHERE m1.id = (
      SELECT id FROM message 
      WHERE roomId = m1.roomId 
      ORDER BY createdAt DESC LIMIT 1
    )
    ORDER BY m1.createdAt DESC
  `, [String(currentUserId)]);
}

  async markAsRead(roomId: string, readerId: number) {
    const readerIdStr = String(readerId);
    
    return await this.messageRepo.update(
      { 
        roomId: roomId, 
        senderId: Not(readerIdStr), 
        isRead: false 
      },
      { isRead: true }
    );
  }
}