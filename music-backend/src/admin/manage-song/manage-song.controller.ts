import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ManageSongService } from './manage-song.service';
import { UpdateSongDto } from './dto/update-song.dto';

@Controller('admin/manage-song')
export class ManageSongController {
  constructor(private readonly manageSongService: ManageSongService) {}

  // ============================================================
  // 1. LẤY DANH SÁCH TẤT CẢ BÀI HÁT
  // ============================================================
  @Get()
  getAll() {
    return this.manageSongService.getAllSongsForAdmin();
  }

  // ============================================================
  // 2. LẤY ALBUM THEO NGHỆ SĨ
  // ============================================================
  @Get('albums/by-artist/:artistId')
  getAlbumsByArtist(@Param('artistId', ParseIntPipe) artistId: number) {
    return this.manageSongService.getAlbumsByArtist(artistId);
  }

  // ============================================================
  // 3. LẤY CHI TIẾT 1 BÀI HÁT
  // ============================================================
  @Get(':id')
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.manageSongService.getSongDetail(id);
  }

  // ============================================================
  // 4. UPLOAD BÀI HÁT MỚI
  // ============================================================
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audioFile', maxCount: 1 },
      { name: 'imageFile', maxCount: 1 },
    ]),
  )
  async uploadSong(
    @UploadedFiles()
    files: {
      audioFile?: Express.Multer.File[];
      imageFile?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    // Parse nghệ sĩ collab (featuredArtists)
    if (body.featuredArtists) {
      try {
        body.featuredArtists = JSON.parse(body.featuredArtists);
      } catch {
        body.featuredArtists = [];
      }
    }

    return this.manageSongService.uploadSong(files, body);
  }

  // ============================================================
  // 5. UPDATE BÀI HÁT
  // ============================================================
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audioFile', maxCount: 1 },
      { name: 'imageFile', maxCount: 1 },
    ]),
  )
  updateSong(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: {
      audioFile?: Express.Multer.File[];
      imageFile?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    // Parse collab artists khi sửa bài
    if (body.featuredArtists) {
      try {
        body.featuredArtists = JSON.parse(body.featuredArtists);
      } catch {
        body.featuredArtists = [];
      }
    }

    return this.manageSongService.updateSong(id, body, files);
  }

  // ============================================================
  // 6. ẨN / HIỆN BÀI HÁT
  // ============================================================
  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.manageSongService.toggleActive(id);
  }

  // ============================================================
  // 7. DUYỆT BÀI HÁT PENDING
  // ============================================================
  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.manageSongService.approveSong(id);
  }

  // ============================================================
  // 8. TỪ CHỐI BÀI HÁT
  // ============================================================
  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.manageSongService.rejectSong(id);
  }

  // ============================================================
  // 9. SOFT DELETE (XÓA MỀM)
  // ============================================================
  @Patch(':id/soft-delete')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.manageSongService.softDeleteSong(id);
  }

  // ============================================================
  // 10. XOÁ HẲN 1 BÀI HÁT
  // ============================================================
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.manageSongService.deleteSong(id);
  }

  // ============================================================
  // 11. PHÂN TRANG
  // ============================================================
  @Get('page/:page')
  getPaginated(@Param('page', ParseIntPipe) page: number) {
    return this.manageSongService.getPaginatedSongs(page);
  }
}
