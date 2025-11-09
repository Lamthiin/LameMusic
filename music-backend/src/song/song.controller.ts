// music-backend/src/song/song.controller.ts (BẢN SỬA LỖI FINAL)
import { 
  Controller, Get, Post, Body, 
  UseGuards, Req, 
  Param, ParseIntPipe, NotFoundException, 
  Query, 
  UseInterceptors, UploadedFile, ValidationPipe,
  UploadedFiles, Patch, Delete
} from '@nestjs/common';
import type { Request } from 'express'; 
import { SongService } from './song.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard'; 
import { JwtPayload } from '../auth/jwt.strategy';
import { AuthGuard } from '@nestjs/passport'; 
import { Roles } from '../auth/roles.decorator'; 
import { RolesGuard } from '../auth/roles.guard'; 
import { FileInterceptor } from '@nestjs/platform-express'; 
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Controller('song') 
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Get('recommend')
  @UseGuards(AuthGuard('jwt')) // BẮT BUỘC ĐĂNG NHẬP
  async getRecommendation(@Req() req) {
    const userId = (req.user as JwtPayload).userId;
    return this.songService.recommendSong(userId);
  }
  
  // (findAll - giữ nguyên)
  @Get()
  @UseGuards(OptionalJwtAuthGuard) 
  findAll(@Req() req: Request) { 
    const user: JwtPayload | null = (req as any).user as JwtPayload | null;
    return this.songService.findAll(user);
  }


  
  // (findAllWithFilters - giữ nguyên)
  @Get('all')
  @UseGuards(OptionalJwtAuthGuard)
  findAllWithFilters(
    @Query('genre') genre?: string, 
    @Query('artistId', new ParseIntPipe({ optional: true })) 
    artistId?: number, 
  ) {
    return this.songService.findAllWithFilters(genre, artistId);
  }

  
  
  // (findLyrics - giữ nguyên)
  @Get(':id/lyrics')
  async findLyrics(@Param('id', ParseIntPipe) id: number) {
    const lyrics = await this.songService.findLyrics(id);
    if (!lyrics) {
      throw new NotFoundException(`Không tìm thấy lời cho bài hát ID ${id}`);
    }
    return lyrics;
  }

  // (findByGenre - giữ nguyên)
  @Get('genre/:genreName')
  @UseGuards(OptionalJwtAuthGuard) 
  async findByGenre(@Param('genreName') genreName: string) {
    const songs = await this.songService.findByGenre(genreName);
    if (!songs || songs.length === 0) {
        throw new NotFoundException(`Không tìm thấy bài hát nào thuộc thể loại: ${genreName}`);
    }
    return songs;
  }

  // === (4) SỬA LỖI TS18047 (LỖI CHECK NULL) ===
  @Get('related/:id')
  async findRelatedSongs(@Param('id', ParseIntPipe) id: number) {
    const currentSong = await this.songService.findOne(id);
    
    // THÊM BƯỚC KIỂM TRA NULL
    if (!currentSong) {
        throw new NotFoundException('Không tìm thấy bài hát gốc.');
    }
    
    const genreName = currentSong.genre; // (Bây giờ đã an toàn)

    if (!genreName) {
        return []; 
    }
    
    return this.songService.findRelatedByGenre(id, genreName);
  }

  // ================================
  // === API CHO ARTIST DASHBOARD ===
  // ================================
  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artist')
  @Get('my-songs')
  async getMySongs(
    @Req() req: any,
    @Query('status') status?: string
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.songService.findMySongs(userId, status as 'PENDING' | 'APPROVED' | 'REJECTED');
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artist')
  @Post('my')
  @UseInterceptors(FileFieldsInterceptor([ 
    { name: 'audioFile', maxCount: 1 },
    { name: 'imageFile', maxCount: 1 },
  ]))
  async createSong(
    @Req() req: any,
    @Body(ValidationPipe) dto: CreateSongDto,
    @UploadedFiles() files: { audioFile?: Express.Multer.File[], imageFile?: Express.Multer.File[] }
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.songService.createSong(userId, dto, files);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artist')
  @Patch('my/:id')
  @UseInterceptors(FileInterceptor('imageFile')) 
  async updateMySong(
  @Param('id', ParseIntPipe) id: number,
  @Req() req: any,
    @Body(ValidationPipe) dto: UpdateSongDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.songService.updateMySong(userId, id, dto, file);
  }
  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artist')
  @Delete('my/:id')
  async deleteMySong(
    @Param('id', ParseIntPipe) id: number,
  @Req() req: any
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.songService.deleteMySong(userId, id);
  }
  
  // ================================
  // === API CHO ADMIN (DUYỆT) ===
  // ================================
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('admin/pending')
  async getPendingSongs() {
    return this.songService.findPendingSongs();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch('admin/approve/:id')
  async approveSong(@Param('id', ParseIntPipe) id: number) {
    return this.songService.updateSongStatus(id, 'APPROVED');
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch('admin/reject/:id')
  async rejectSong(@Param('id', ParseIntPipe) id: number) {
    return this.songService.updateSongStatus(id, 'REJECTED');
 }

 // === (1) API MỚI: LẤY TẤT CẢ SINGLES CỦA TÔI ===
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artist')
  @Get('my-singles')
  async getMySingles(@Req() req: any) {
    const userId = (req.user as JwtPayload).userId;
    return this.songService.findMySingles(userId);
  }

  // === (2) API MỚI: THÊM BÀI HÁT VÀO ALBUM ===
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artist')
  @Patch('add-to-album')
  async addSongToAlbum(
    @Req() req: any,
    @Body('songId', ParseIntPipe) songId: number,
    @Body('albumId', ParseIntPipe) albumId: number,
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.songService.addSongToAlbum(userId, songId, albumId);
  }
  

  /**
   * API MỚI: PATCH /song/play/:id (Tăng lượt nghe)
   */
  @Patch('play/:id') // Dùng PATCH vì chúng ta đang cập nhật một phần
  async incrementPlayCount(@Param('id', ParseIntPipe) id: number) {
    // Không cần logic kiểm tra 404, service tự xử lý
    await this.songService.incrementPlayCount(id);
    return { message: 'Play count incremented.' };
  }

 // (findOne - giữ nguyên)
  @Get(':id') 
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const song = await this.songService.findOne(id);
    if (!song) {
        throw new NotFoundException(`Bài hát với ID ${id} không tồn tại`);
    }
    return song;
  }
}