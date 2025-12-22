import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Lấy danh sách các phòng chat cho Sidebar (Dành cho Admin)
  @Get('rooms')
  @UseGuards(AuthGuard('jwt'))
  async getAllRooms(@Req() req: any) {
    // Ép kiểu về Number để đảm bảo tính toán trong SQL chính xác
    const adminId = Number(req.user.userId); 
    return await this.chatService.getAllRooms(adminId);
  }

  // Lấy lịch sử chat (Dành cho cả Guest và Admin)
  @Get('history/:roomId')
  async getHistory(@Param('roomId') roomId: string) {
    return await this.chatService.getMessagesByRoom(roomId);
  }

  // Đánh dấu đã đọc khi Admin nhấn vào xem phòng
  @Patch('read/:roomId')
  @UseGuards(AuthGuard('jwt'))
  async markAsRead(@Param('roomId') roomId: string, @Req() req: any) {
    const adminId = Number(req.user.userId); 
    const result = await this.chatService.markAsRead(roomId, adminId);
    
    return {
      success: true,
      message: 'Đã đánh dấu đã đọc',
      result
    };
  }
}