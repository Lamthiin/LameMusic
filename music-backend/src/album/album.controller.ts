// music-backend/src/album/album.controller.ts (FULL CODE)
import { Controller, Get, Param, ParseIntPipe, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { AlbumService } from './album.service';

@Controller('albums') 
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  /**
   * API MỚI: GET /albums/all (KHÔNG CẦN VALIDATION)
   */
  @Get('all')
  async getAllAlbums() {
    return this.albumService.findAllAlbums();
  }

  /**
   * API: GET /albums/:id (Chi tiết Album - Chỉ cần ParseIntPipe)
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const album = await this.albumService.findOne(id);
    return album;
  }

  // (Nếu bạn có endpoint POST/PATCH, nó sẽ cần @UsePipes(ValidationPipe))
}