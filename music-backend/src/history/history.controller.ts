// music-backend/src/history/history.controller.ts (BẢN SỬA LỖI CÚ PHÁP FINAL)
import { 
    Controller, Post, Body, UseGuards, Req, Param, ParseIntPipe, Query , Get
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy'; 
import { LogPlaybackDto } from './dto/log-playback.dto'; // <-- IMPORT DTO MỚI

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
    constructor(private historyService: HistoryService) {}

    /**
     * API GHI LOG: POST /history/log/:songId
     */
    @Post('/log/:songId')
    async logPlayback(
        @Req() req: any,
        @Param('songId', ParseIntPipe) songId: number, 
        @Body() logDto: LogPlaybackDto, // <-- SỬ DỤNG DTO
    ) {
        const userId = (req.user as JwtPayload).userId;
        
        // Ghi log với duration tối thiểu 30s (hoặc giá trị từ logDto)
        return this.historyService.logPlayback(
            userId, 
            songId, 
            logDto.durationListened || 30 // Dùng 30s nếu không có duration
        );
    }
    
    /**
     * API LẤY LỊCH SỬ NGHE: GET /history/me
     */
    @Get('/me')
    async getListenHistory(
        @Req() req: any,
        @Query('limit', ParseIntPipe) limit: number = 100 
    ) {
        const userId = (req.user as JwtPayload).userId;
        return this.historyService.getUserListenHistory(userId, limit);
    }
}