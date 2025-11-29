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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminAlbumService } from './album.service';

@Controller('admin/albums')
export class AdminAlbumController {
  constructor(private readonly service: AdminAlbumService) {}

  // LẤY DS ALBUM CHO ADMIN
  @Get()
  findAll() {
    return this.service.findByActive(true);
  }

  @Get('hidden')
  findHidden() {
    return this.service.findByActive(false);
}


  // LẤY CHI TIẾT ALBUM
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

  // XOÁ ALBUM
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.service.delete(+id);
  }
}
