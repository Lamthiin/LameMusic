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
  ParseIntPipe,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminAlbumService } from './admin-album.service';

@Controller('admin/albums')
export class AdminAlbumController {
  constructor(private readonly service: AdminAlbumService) {}

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
  async getAvailable(@Param('id') albumId: number) {
    return this.service.findAvailableSongs(albumId);
  }


  // ⭐ ĐẶT TRƯỚC — ROUTE FULL CHI TIẾT
  @Get(':id/full')
  getFull(@Param('id') id: number) {
    return this.service.findFull(+id);
  }

  
  // ⭐ ROUTE MATCH ĐỘNG — ĐẶT SAU
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
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
    @Param('id') id: number,
    @UploadedFile() cover: Express.Multer.File,
    @Body() dto: any,
  ) {
    return this.service.update(+id, dto, cover);
  }
// SỬA INFO ALBUM (CHỈ SỬA PHẦN INFO)
@Patch(':id/info')
updateInfo(
  @Param('id') id: number,
  @Body('info') info: string,
) {
  return this.service.updateAlbumInfo(+id, info);
}

@Patch(':id/add-song')
addSongToAlbum(
  @Param('id') id: number,
  @Body('songId') songId: number,
) {
  return this.service.addSongToAlbum(+id, +songId);
}

Y


@Patch(':id/soft-delete')
softDelete(@Param('id', ParseIntPipe) id: number) {
  return this.service.softDelete(id);
}

// KHÔI PHỤC ALBUM (active = 1)
@Patch(':id/restore')
restore(@Param('id', ParseIntPipe) id: number) {
  return this.service.restore(id);
}


}
