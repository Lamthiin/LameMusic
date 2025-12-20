import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Lấy danh sách các phòng chat cho Sidebar
  @Get('rooms')
  @UseGuards(AuthGuard('jwt'))
  async getAllRooms(@Req() req: any) {
    const adminId = req.user.userId; 
    return await this.chatService.getAllRooms(adminId);
  }

  // Lấy lịch sử chat
  @Get('history/:roomId')
  async getHistory(@Param('roomId') roomId: string) {
    return await this.chatService.getMessagesByRoom(roomId);
  }

  // Đánh dấu đã đọc
  @Patch('read/:roomId')
  @UseGuards(AuthGuard('jwt'))
  async markAsRead(@Param('roomId') roomId: string, @Req() req: any) {
    const adminId = req.user.userId; 
    const result = await this.chatService.markAsRead(roomId, adminId);
    return result;
  }
}