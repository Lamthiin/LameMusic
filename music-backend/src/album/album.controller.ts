// music-backend/src/album/album.controller.ts (FULL CODE)
import { 
  Controller, Get, Param, ParseIntPipe, NotFoundException, 
  UseGuards, Post, Patch, Delete, Req, Body, ValidationPipe,
  UseInterceptors, UploadedFile
} from '@nestjs/common';
import { AlbumService } from './album.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Controller('albums') 
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  /**
   * API MỚI: GET /albums/all (KHÔNG CẦN VALIDATION)
   */
  // @Get('all')
  // async getAllAlbums() {
  //   return this.albumService.findAllAlbums();
  // }

  /**
   * API: GET /albums/:id (Chi tiết Album - Chỉ cần ParseIntPipe)
  //  */
  // @Get(':id')
  // async findOne(@Param('id', ParseIntPipe) id: number) {
  //   const album = await this.albumService.findOne(id);
  //   return album;
  // }

  // === API CHO ARTIST DASHBOARD ===

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artist')
  @Get('my-albums')
  async getMyAlbums(@Req() req: any) {
    const userId = (req.user as JwtPayload).userId;
    return this.albumService.findMyAlbums(userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artist')
  @Post()
  @UseInterceptors(FileInterceptor('coverFile')) // Tên file upload là 'coverFile'
  async createAlbum(
    @Req() req: any,
    @Body(ValidationPipe) dto: CreateAlbumDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.albumService.createAlbum(userId, dto, file);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artist')
  @Patch('my/:id') // Dùng /my/ để phân biệt với API Patch của Admin
  @UseInterceptors(FileInterceptor('coverFile'))
  async updateMyAlbum(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body(ValidationPipe) dto: UpdateAlbumDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.albumService.updateMyAlbum(userId, id, dto, file);
  }
  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artist')
  @Delete('my/:id')
  async deleteMyAlbum(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.albumService.deleteMyAlbum(userId, id);
  }


  // === API PUBLIC ===

  @Get('all')
  async getAllAlbums() {
    return this.albumService.findAllAlbums();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.albumService.findOne(id);
  }
}