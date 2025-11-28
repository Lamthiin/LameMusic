import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { AdminArtistService } from './admin-artist.service';

@Controller('admin/artists')
export class AdminArtistController {
  constructor(private readonly service: AdminArtistService) {}

  // ⭐ FIX URL AVATAR (thêm duy nhất phần này)
  private fixAvatar(artist: any) {
  if (!artist) return artist;

  if (artist.avatar_url) {
    // đổi backslash thành slash
    let url = artist.avatar_url.replace(/\\/g, '/');

    artist.avatar_url = `http://localhost:3000${url}`;
  } else {
    artist.avatar_url = `http://localhost:3000/uploads/defaults/default-artist.png`;
  }

  return artist;
}

  @Get('pending')
  async getPending() {
    const list = await this.service.findPending();
    return list.map(a => this.fixAvatar(a));
  }

  @Patch(':id/pending') // <--- URL có tham số :id và dùng PATCH
  setPending(@Param('id') id: string) {
  // Hàm này sẽ cập nhật trạng thái
  return this.service.setPending(Number(id)); 
  } 

  @Get('active')
  async getActive() {
    const list = await this.service.findApproved();
    return list.map(a => this.fixAvatar(a));
  }

  @Get('rejected')
  async getRejected() {
    const list = await this.service.findRejected();
    return list.map(a => this.fixAvatar(a));
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const artist = await this.service.findOne(Number(id));
    return this.fixAvatar(artist);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.approve(Number(id));
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.service.reject(Number(id));
  }

  @Post()
  @UseInterceptors(FileInterceptor('avatarFile'))
  createArtist(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.service.createArtist({
      ...body,
      avatar_url: file ? `/uploads/avatars/${file.filename}` : null,
    });
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatarFile'))
  updateArtist(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.service.updateArtist(Number(id), body, file);
  }


  @Delete(':id')
  deleteArtist(@Param('id') id: string) {
    return this.service.deleteArtist(Number(id));
  }
}
