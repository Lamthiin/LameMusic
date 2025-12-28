// music-backend/src/playlist/playlist.controller.ts (FULL CODE)
import { 
  Controller, Post, Get, Body, 
  UseGuards, Req, HttpStatus, HttpCode, 
  ValidationPipe, ParseIntPipe, Param, 
  UnauthorizedException,
  BadRequestException,Delete, NotFoundException
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AuthGuard } from '@nestjs/passport'; 
import { JwtPayload } from '../auth/jwt.strategy';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { AddSongsToPlaylistDto } from './dto/add-songs-to-playlist.dto'; // Import DTO


@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  /**
   * POST /playlists (Tạo Playlist)
   */
  @UseGuards(AuthGuard('jwt')) 
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createPlaylistDto: CreatePlaylistDto, 
    @Req() req
  ) {
    const userId = (req.user as JwtPayload).userId; 
    const playlist = await this.playlistService.create(userId, createPlaylistDto);
    return { message: 'Playlist created successfully!', playlist };
  }

  /**
   * === API MỚI: Lấy playlist của tôi ===
   * GET /playlists/my-playlists
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('my-playlists')
  async getMyPlaylists(@Req() req) {
    const userId = (req.user as JwtPayload).userId;
    return this.playlistService.findMyPlaylists(userId);
  }

  /**
 * === API MỚI: Thêm bài hát HÀNG LOẠT vào playlist ===
 * POST /playlists/:playlistId/add-songs
 */
@UseGuards(AuthGuard('jwt'))
@Post(':playlistId/add-songs') // <-- Đổi endpoint thành 'add-songs' (số nhiều)
async addSongsToPlaylist(
  @Param('playlistId', ParseIntPipe) playlistId: number,
  @Body() data: AddSongsToPlaylistDto, // <-- NHẬN DTO HÀNG LOẠT
  @Req() req
) {
  // Nhờ ValidationPipe, chúng ta biết data.songIds là MẢNG SỐ hợp lệ
  
  const userId = (req.user as JwtPayload).userId;
  
  await this.playlistService.addSongsToPlaylist(
    userId, 
    playlistId, 
    data.songIds // TRUYỀN MẢNG ID
  );
  
  return { message: `Đã thêm ${data.songIds.length} bài hát vào playlist.` };
}

  /**
   * === API MỚI: Thêm bài hát vào playlist ===
   * POST /playlists/:playlistId/add-song
   */
  @UseGuards(AuthGuard('jwt'))
  @Post(':playlistId/add-song')
  async addSongToPlaylist(
    @Param('playlistId', ParseIntPipe) playlistId: number,
    @Body('songId') songIdBody: number, // Lấy songId từ body
    @Req() req
  ) {
    // Ép kiểu songId sang number (vì ValidationPipe không chạy trên body đơn lẻ)
    const songId = parseInt(songIdBody as any);
    if (isNaN(songId)) {
        throw new BadRequestException('songId phải là một con số.');
    }
        
    const userId = (req.user as JwtPayload).userId;
    await this.playlistService.addSongToPlaylist(userId, playlistId, songId);
    return { message: 'Đã thêm bài hát vào playlist.' };
  }

  /**
   * API MỚI: DELETE /playlists/:playlistId/song/:songId
   * Xóa một bài hát khỏi playlist (chỉ chủ sở hữu)
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':playlistId/song/:songId')
  async removeSongFromPlaylist(
    @Req() req: any,
    @Param('playlistId', ParseIntPipe) playlistId: number,
    @Param('songId', ParseIntPipe) songId: number,
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.playlistService.removeSongFromPlaylist(userId, playlistId, songId);
  }

  /**
   * === API MỚI: Lấy chi tiết 1 Playlist (Công khai) ===
   * GET /playlists/:id
   */
  // @Get(':id') // <-- API MỚI (Public)
  // async getPlaylistById(@Param('id', ParseIntPipe) id: number) {
  //   // Service sẽ kiểm tra quyền riêng tư
  //   return this.playlistService.findPublicById(id);
  // }

  /**
     * API CHUNG: GET /playlists/:id (Decision Maker)
     * Quyết định gọi hàm Public hay Private dựa trên Token và quyền sở hữu.
     */
    @UseGuards(OptionalJwtAuthGuard) // Cho phép Token có hoặc không
    @Get(':id') 
    async getPlaylistById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const user = (req.user as JwtPayload) || null;

        if (user) {
            // === FIX LỖI: THỬ TÌM VỚI QUYỀN SỞ HỮU TRƯỚC ===
            try {
                // Hàm này sẽ trả về Playlist nếu: (id khớp) VÀ (userId khớp)
                return await this.playlistService.findMyPlaylistById(user.userId, id);
            } catch (error) {
                // Nếu findMyPlaylistById thất bại (bị 404 vì không phải playlist của họ),
                // ta tiếp tục tìm kiếm Public.
                if (error instanceof NotFoundException) {
                    return this.playlistService.findPublicById(id);
                }
                throw error;
            }
        }
        
        // Nếu không có Token, chỉ tìm Public
        return this.playlistService.findPublicById(id);
    }

@Post(':id/clone')
@UseGuards(AuthGuard('jwt'))
async clonePlaylist(
  @Param('id', ParseIntPipe) id: number,
  @Req() req,
) {
  const userId = (req.user as JwtPayload).userId;
  return this.playlistService.clonePublicPlaylistToUser(userId, id);
}


  /**
   * API MỚI: DELETE /playlists/my/:id (Xóa Playlist)
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete('my/:id')
  async deleteMyPlaylist(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.playlistService.deleteMyPlaylist(userId, id);
  }

}