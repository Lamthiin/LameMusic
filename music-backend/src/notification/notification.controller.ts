// music-backend/src/notification/notification.controller.ts (SỬA LỖI FINAL)
import { Controller, Get, Req, UseGuards, Query, ParseIntPipe, Patch, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';
import { JwtPayload } from '../auth/jwt.strategy'; 

@Controller('notifications') // <-- PHẢI CÓ CONTROLLER PATH
@UseGuards(AuthGuard('jwt')) // Protected
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * GET /notifications (Lấy danh sách thông báo của User)
   */
  @Get() // <-- PHẢI LÀ @Get() (Route gốc)
  async getMyNotifications(
    @Req() req: any,
    @Query('take', new ParseIntPipe({ optional: true })) take: number = 10,
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.notificationService.getMyNotifications(userId, take);
  }

  /**
   * PATCH /notifications/:id/read (Đánh dấu đã đọc)
   */
  @Patch(':id/read')
  async markAsRead(
    @Req() req: any,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    const userId = (req.user as JwtPayload).userId;
    await this.notificationService.markAsRead(notificationId, userId);
    return { success: true, message: 'Đã đánh dấu là đã đọc.' };
  }
}