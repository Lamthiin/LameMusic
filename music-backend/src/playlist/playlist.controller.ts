// music-backend/src/playlist/playlist.controller.ts (FULL CODE)
import { 
  Controller, Post, Get, Body, 
  UseGuards, Req, HttpStatus, HttpCode, 
  ValidationPipe, ParseIntPipe, Param, 
  UnauthorizedException,
  BadRequestException,Delete
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AuthGuard } from '@nestjs/passport'; 
import { JwtPayload } from '../auth/jwt.strategy';


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
   * === API MỚI: Lấy chi tiết 1 Playlist (Công khai) ===
   * GET /playlists/:id
   */
  @Get(':id') // <-- API MỚI (Public)
  async getPlaylistById(@Param('id', ParseIntPipe) id: number) {
    // Service sẽ kiểm tra quyền riêng tư
    return this.playlistService.findPublicById(id);
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