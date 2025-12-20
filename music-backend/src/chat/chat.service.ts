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

  // 1. Lưu tin nhắn: Luôn lưu isRead = false để User có thể thấy thông báo
  async saveMessage(data: any) {
    const newMessage = this.messageRepo.create({
        ...data,
        isRead: false, // Mặc định là chưa đọc để đối phương (User hoặc Admin) nhận được badge
        createdAt: new Date()
    });
    return await this.messageRepo.save(newMessage);
  }

  async getMessagesByRoom(roomId: string) {
    return await this.messageRepo.find({
      where: { roomId },
      order: { createdAt: 'ASC' },
      relations: ['sender'],
    });
  }

  // 2. Lấy danh sách phòng: Phải nhận vào adminId để lọc số lượng chưa đọc
// chat.service.ts
async getAllRooms(currentUserId: number) {
  return await this.messageRepo.query(`
    SELECT 
      m1.roomId,
      u.username AS username,
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
    /* Chú ý: Đổi thành 'user' thay vì 'users' */
    JOIN user u ON u.id = CAST(REPLACE(m1.roomId, 'user_', '') AS UNSIGNED)
    WHERE m1.id = (
      SELECT id FROM message 
      WHERE roomId = m1.roomId 
      ORDER BY createdAt DESC LIMIT 1
    )
    ORDER BY m1.createdAt DESC
  `, [currentUserId]);
}
  // 3. Đánh dấu đã đọc: Khi Admin vào phòng, chỉ đánh dấu "Đã đọc" cho tin của khách
  async markAsRead(roomId: string, readerId: number) {
    return await this.messageRepo.update(
      { 
        roomId: roomId, 
        senderId: Not(readerId), // Chỉ đánh dấu tin nhắn của người khác gửi cho mình
        isRead: false 
      },
      { isRead: true }
    );
  }
}