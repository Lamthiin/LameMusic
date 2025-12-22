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
// chat.gateway.ts

@SubscribeMessage('send_message')
async handleMessage(@MessageBody() data: any) {
  // 1. Lưu vào DB
  const savedMsg = await this.chatService.saveMessage(data);
  
  // 2. Gửi cho những người đang ở TRONG phòng chat (để hiện tin nhắn lên màn hình)
  this.server.to(data.roomId).emit('receive_message', savedMsg);
  
  // 3. QUAN TRỌNG: Gửi cho TẤT CẢ mọi người (để Sidebar ở Dashboard/Admin cũng nhận được)
  // Chúng ta emit thêm một lần nữa nhưng không giới hạn trong phòng .to(roomId)
  this.server.emit('receive_message', savedMsg); 

  // 4. Phát tín hiệu thông báo chung (nếu cần)
  this.server.emit('admin_new_notification', savedMsg);
}

  // 4. (Tùy chọn) Thêm sự kiện báo Admin đã đọc từ phía Frontend
  @SubscribeMessage('admin_read_message')
  handleAdminRead(@MessageBody() data: { roomId: string }) {
      this.server.emit('admin_read_message', data);
  }
}