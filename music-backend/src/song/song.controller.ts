// music-backend/src/song/song.controller.ts (BẢN SỬA LỖI 400 BAD REQUEST)
import { 
  Controller, Get, Post, Body, 
  UseGuards, Req, 
  Param, ParseIntPipe, NotFoundException, 
  Query, 
  UseInterceptors, UploadedFile 
} from '@nestjs/common';
import type { Request } from 'express'; 
import { SongService } from './song.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard'; 
import { JwtPayload } from '../auth/jwt.strategy';
import { AuthGuard } from '@nestjs/passport'; 
import { Roles } from '../auth/roles.decorator'; 
import { RolesGuard } from '../auth/roles.guard'; 
import { FileInterceptor } from '@nestjs/platform-express'; 

@Controller('song') 
export class SongController {
  constructor(private readonly songService: SongService) {}

  /**
   * API: GET /song (Lấy 5 bài hát cho Trang Home)
   */
  @Get()
  @UseGuards(OptionalJwtAuthGuard) 
  findAll(@Req() req: Request) { 
    const user: JwtPayload | null = (req as any).user as JwtPayload | null;
    return this.songService.findAll(user);
  }

  /**
   * API: GET /song/all (Lấy TẤT CẢ bài hát, có lọc)
   */
  @Get('all')
  @UseGuards(OptionalJwtAuthGuard)
  findAllWithFilters(
    @Query('genre') genre?: string, 
    
    // === SỬA LỖI 400: Dùng ParseIntPipe và 'optional: true' ===
    @Query('artistId', new ParseIntPipe({ optional: true })) 
    artistId?: number, 
    // =========================================================
  ) {
    return this.songService.findAllWithFilters(genre, artistId);
  }

  /**
   * API: GET /song/:id (Lấy chi tiết 1 bài hát)
   */
  @Get(':id') 
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const song = await this.songService.findOne(id);
    if (!song) {
        throw new NotFoundException(`Bài hát với ID ${id} không tồn tại`);
    }
    return song;
  }
  
  /**
   * API: GET /song/:id/lyrics (Lấy lời bài hát)
   */
  @Get(':id/lyrics')
  async findLyrics(@Param('id', ParseIntPipe) id: number) {
    const lyrics = await this.songService.findLyrics(id);
    if (!lyrics) {
      throw new NotFoundException(`Không tìm thấy lời cho bài hát ID ${id}`);
    }
    return lyrics;
  }

  /**
   * API: GET /song/genre/:genreName (Lấy bài hát theo thể loại)
   */
  @Get('genre/:genreName')
  @UseGuards(OptionalJwtAuthGuard) 
  async findByGenre(@Param('genreName') genreName: string) {
    const songs = await this.songService.findByGenre(genreName);
    if (!songs || songs.length === 0) {
        throw new NotFoundException(`Không tìm thấy bài hát nào thuộc thể loại: ${genreName}`);
    }
    return songs;
  }
}