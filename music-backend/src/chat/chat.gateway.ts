import { 
  WebSocketGateway, SubscribeMessage, MessageBody, 
  WebSocketServer, ConnectedSocket 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // 1. Khi Admin hoặc User xem tin nhắn
  @SubscribeMessage('read_event')
  async handleReadEvent(@MessageBody() data: { roomId: string; userId: number }) {
    // Cập nhật DB
    await this.chatService.markAsRead(data.roomId, data.userId);
    
    // Báo cho đối phương hiện tích xanh
    this.server.to(data.roomId).emit('messages_marked_read', { roomId: data.roomId });

    // QUAN TRỌNG: Báo cho Sidebar chính biết để giảm tổng số tin chưa đọc
    this.server.emit('admin_read_message', { roomId: data.roomId });
  }

  // 2. Khi Admin click vào một User trong danh sách (để join phòng)
  @SubscribeMessage('join_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string }) {
    client.join(payload.roomId);
    console.log(`Socket ${client.id} đã vào phòng: ${payload.roomId}`);
  }
  
  // 3. Khi có tin nhắn mới
  @SubscribeMessage('send_message')
  async handleMessage(@MessageBody() data: any) {
    console.log("🚀 Server nhận tin nhắn:", data.content); // Xem log này ở Terminal máy tính
    // Lưu tin nhắn vào Database
    const savedMsg = await this.chatService.saveMessage(data);
    
    // Gửi vào phòng riêng (cho người đang mở khung chat thấy)
    this.server.to(data.roomId).emit('receive_message', savedMsg);
    
    // Gửi thông báo tổng quát (cho Sidebar chính và danh sách user nhảy số)
    this.server.emit('admin_new_notification', {
      roomId: data.roomId,
      content: data.content,
      unreadCountUpdate: true
    });
  }

  // 4. (Tùy chọn) Thêm sự kiện báo Admin đã đọc từ phía Frontend
  @SubscribeMessage('admin_read_message')
  handleAdminRead(@MessageBody() data: { roomId: string }) {
      this.server.emit('admin_read_message', data);
  }
}