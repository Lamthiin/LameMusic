// music-backend/src/ai/ai.controller.ts (TẠO MỚI)
import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AiService } from './ai.service';
import { SongService } from '../song/song.service'; // Cần để lấy danh sách bài hát

@Controller('ai')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin') // <-- CHỈ ADMIN MỚI GỌI ĐƯỢC
export class AiController {
  constructor(private readonly aiService: AiService, private readonly songService: SongService) {}

  /**
   * API ADMIN: POST /ai/reindex
   * Quét và tạo lại/cập nhật embedding cho tất cả bài hát đã APPROVED
   */
  @Post('reindex-approved-songs')
  async reindexApprovedSongs() {
    // Gọi SongService để lấy tất cả bài hát đã duyệt
    const allApprovedSongs = await this.songService.findAllApprovedSongsWithMissingEmbedding();
    
    if (allApprovedSongs.length === 0) {
        return { message: "Không tìm thấy bài hát nào cần tạo/cập nhật embedding." };
    }

    let successCount = 0;
    
    // Lặp qua từng bài hát và gọi hàm tạo embedding
    for (const song of allApprovedSongs) {
        const result = await this.aiService.updateSongEmbedding(song.id, song.title, song.genre);
        if (result) {
            successCount++;
        }
    }

    return { 
        message: `Đã hoàn tất cập nhật embedding cho ${successCount} bài hát.`,
        processed: successCount 
    };
  }
}