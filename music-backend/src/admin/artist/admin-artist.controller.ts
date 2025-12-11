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
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { AdminArtistService } from './admin-artist.service';

@Controller('admin/artists')
export class AdminArtistController {
  constructor(private readonly service: AdminArtistService) {}
  

  // ⭐ FIX URL AVATAR (thêm duy nhất phần này)
  private fixAvatar(artist: any) {
  if (!artist) return artist;

  // Nếu avatar đã là URL Cloudflare thì giữ nguyên
  if (artist.avatar_url?.startsWith("http")) {
    return artist;
  }

  // Nếu avatar là local thì thêm localhost
  if (artist.avatar_url) {
    const url = artist.avatar_url.replace(/\\/g, "/");
    artist.avatar_url = `http://localhost:3000${url}`;
  } else {
    artist.avatar_url = "http://localhost:3000/uploads/defaults/default-artist.png";
  }

  return artist;
}

  @Get()
  async getAll() {
    const list = await this.service.findAll(); // service bạn sẽ gọi method findAll
    return list.map(a => this.fixAvatar(a));
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
    const filtered = list.filter(a => a.user_id !== null);
    return filtered.map(a => this.fixAvatar(a));
  }

  @Get('inactive')
  async getInactive() {
    const list = await this.service.findInactive();
    return list.map(a => this.fixAvatar(a));
  }

  
  @Get('rejected')
  async getRejected() {
    const list = await this.service.findRejected();
    return list.map(a => this.fixAvatar(a));
  }

  @Get('removed')
  async getRemoved() {
    const list = await this.service.findRemoved();
    return list.map(a => this.fixAvatar(a));
  }

  // ⭐ LẤY TẤT CẢ NGHỆ SĨ ĐÃ ĐƯỢC APPROVED (bao gồm nghệ sĩ nội bộ + đăng ký)
  @Get('list-all')
  async listAllArtists() {
    const artists = await this.service.findAllApprovedArtists();
    return artists.map(a => this.fixAvatar(a));
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const artist = await this.service.findOne(Number(id));
    return this.fixAvatar(artist);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    const artistId = Number(id);
    if (isNaN(artistId)) {
      throw new BadRequestException('Invalid artist ID');
    }
    return this.service.approve(artistId);
  }


  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.service.reject(Number(id));
  }

  @Post()
  @UseInterceptors(FileInterceptor('avatarFile'))
  createArtist(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    return this.service.createArtist(body, file);
  }



  @Get('internal')
  async getInternalArtists() {
    const list = await this.service.findInternal();
    return list.map(a => this.fixAvatar(a));
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
  
  @Get(':id/full')
  async getFullArtist(@Param('id') id: string) {
    const artist = await this.service.findFullDetail(Number(id));
    return this.fixAvatar(artist);
  }

  @Get('paginated')
  async getPaginatedArtists(
    @Query('page', ParseIntPipe) page: number = 1, 
    @Query('take', ParseIntPipe) take: number = 15,
  ) {
    if (page < 1) page = 1; // Đảm bảo page >= 1
    
    // Gọi service để lấy dữ liệu phân trang
    const result = await this.service.getPaginatedArtists(page, take);
    
    // Áp dụng fixAvatar cho từng nghệ sĩ trong mảng data
    const fixedData = result.data.map(a => this.fixAvatar(a));
    
    // Trả về kết quả phân trang đã được sửa URL
    return { ...result, data: fixedData };
  }
}