// src/admin/album/admin-album.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException, // ⭐ THÊM
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminAlbumService } from './admin-album.service';

@Controller('admin/albums')
export class AdminAlbumController {
  constructor(private readonly service: AdminAlbumService) {}

  // ⭐ HELPER: PARSE ID AN TOÀN
  private parseId(id: string): number {
    const n = Number(id);
    if (Number.isNaN(n)) {
      throw new BadRequestException('Album id không hợp lệ');
    }
    return n;
  }

  // LẤY DS ALBUM
  @Get()
  findAll() {
    return this.service.findByActive(true);
  }

  @Get('hidden')
  findHidden() {
    return this.service.findByActive(false);
  }

  @Get(':id/available-songs')
  getAvailableSongs(@Param('id') id: string) {
    return this.service.findAvailableSongs(this.parseId(id));
  }

  // ⭐ ĐẶT TRƯỚC — ROUTE FULL CHI TIẾT
  @Get(':id/full')
  getFull(@Param('id') id: string) {
    return this.service.findFull(this.parseId(id));
  }

  // ⭐ ROUTE MATCH ĐỘNG — ĐẶT SAU
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(this.parseId(id));
  }

  // TẠO ALBUM
  @Post()
  @UseInterceptors(FileInterceptor('cover'))
  create(
    @UploadedFile() cover: Express.Multer.File,
    @Body() dto: any,
  ) {
    return this.service.create(dto, cover);
  }

  // SỬA ALBUM
  @Patch(':id')
  @UseInterceptors(FileInterceptor('cover'))
  update(
    @Param('id') id: string,
    @UploadedFile() cover: Express.Multer.File,
    @Body() dto: any,
  ) {
    return this.service.update(this.parseId(id), dto, cover);
  }

  // XOÁ ALBUM (SOFT DELETE: active = 0)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.softDelete(this.parseId(id));
  }

  // KHÔI PHỤC ALBUM (active = 1)
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.service.restore(this.parseId(id));
  }
  // SỬA INFO ALBUM (CHỈ SỬA PHẦN INFO)
  @Patch(':id/info')
  updateInfo(
    @Param('id') id: string,
    @Body('info') info: string,
  ) {
    return this.service.updateAlbumInfo(this.parseId(id), info);
  }

  @Patch(':id/add-song')
  addSongToAlbum(
    @Param('id') id: string,
    @Body('songId') songId: number,
  ) {
    return this.service.addSongToAlbum(this.parseId(id), +songId);
  }

  
}
