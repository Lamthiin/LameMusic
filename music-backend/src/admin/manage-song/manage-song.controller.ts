// src/admin/manage-song/manage-song.controller.ts
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

  // ================================
  // 📌 1. LIST TẤT CẢ BÀI HÁT CHO ADMIN
  // ================================
  @Get()
  getAll() {
    return this.manageSongService.getAllSongsForAdmin();
  }

  // Lấy danh sách album theo artist
  @Get('albums/by-artist/:artistId')
  getAlbumsByArtist(@Param('artistId', ParseIntPipe) artistId: number) {
    return this.manageSongService.getAlbumsByArtist(artistId);
  }

  // ================================
  // 📌 2. XEM CHI TIẾT 1 BÀI HÁT
  // ================================
  @Get(':id')
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.manageSongService.getSongDetail(id);
  }


  // ================================
  // 📌 3. UPLOAD BÀI HÁT MỚI (audio + image)
  // ================================
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
    return this.manageSongService.uploadSong(files, body);
  }

  // ================================
  // 📌 4. SỬA BÀI HÁT (có thể kèm file mới)
  // ================================
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
    @Body() body: UpdateSongDto,
  ) {
    return this.manageSongService.updateSong(id, body, files);
  }
  

  // ================================
  // 5. ẨN / HIỆN BÀI HÁT
  // ================================
  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.manageSongService.toggleActive(id);
  }

  // ================================
  // 6. DUYỆT BÀI HÁT PENDING
  // ================================
  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.manageSongService.approveSong(id);
  }

  // ================================
  // 6b. TỪ CHỐI BÀI HÁT PENDING
  // ================================
  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.manageSongService.rejectSong(id);
  }

  // ================================
  // 8. XOÁ MỀM
  // ================================
  @Patch(':id/soft-delete')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.manageSongService.softDeleteSong(id);
  }



  // ================================
  // 7. XOÁ BÀI HÁT
  // ================================
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.manageSongService.deleteSong(id);
  }

  @Get('page/:page')
  getPaginated(
    @Param('page', ParseIntPipe) page: number
  ) {
    return this.manageSongService.getPaginatedSongs(page);
  }

}
