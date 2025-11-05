// music-backend/src/artist/artist.controller.ts (BẢN SỬA LỖI 400 FINAL)
import { Controller, Get, Param, ParseIntPipe, NotFoundException, Patch, UseInterceptors, UploadedFile, UseGuards, Req, Post, ValidationPipe, Body } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { Artist } from './artist.entity';
import { ArtistRegistrationDto } from './dto/artist-registration.dto'; // <-- IMPORT MỚI
import { AuthGuard } from '@nestjs/passport'; // <-- (1) IMPORT
import { RolesGuard } from '../auth/roles.guard'; // <-- (2) IMPORT
import { Roles } from '../auth/roles.decorator'; // <-- (3) IMPORT
import { JwtPayload } from '../auth/jwt.strategy'; // <-- (4) IMPORT
import { FileInterceptor } from '@nestjs/platform-express'; // <-- THÊM
// ... (imports khác)
import { UpdateArtistDto } from './dto/update-artist.dto'; // <-- THÊM

@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

 /**
   * API: GET /artists/featured
   */
  @Get('featured')
  async getFeaturedArtists() {
    return this.artistService.findFeaturedArtists();
  }

  /**
   * API: GET /artists/all
   */
  @Get('all')
  async getAllArtists() {
    return this.artistService.findAllArtists();
  }



  /**
   * API ADMIN: GET /artists/pending (Lấy hồ sơ chờ duyệt)
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard) 
  @Roles('admin') 
  @Get('pending')
  async getPendingArtists() {
    return this.artistService.findPendingArtists();
  }

  /**
   * API ADMIN: POST /artists/approve/:artistId (Duyệt hồ sơ)
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard) 
  @Roles('admin') 
  @Post('approve/:artistId') 
  async approveArtist(@Param('artistId', ParseIntPipe) artistId: number) {
    return this.artistService.approveArtist(artistId);
  }

  /**
   * API: POST /artists/register (Đăng ký hồ sơ Nghệ sĩ)
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('register')
  async registerArtist(
    @Req() req: any,
    @Body(ValidationPipe) artistRegistrationDto: ArtistRegistrationDto
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.artistService.registerArtistProfile(userId, artistRegistrationDto.stageName);
  }

  /**
   * API ARTIST: GET /artists/me (Lấy hồ sơ cá nhân của Artist)
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artist') // <-- CHỈ ARTIST MỚI GỌI ĐƯỢC
  @Get('me')
  async getMyArtistProfile(@Req() req: any) {
    const userId = (req.user as JwtPayload).userId;
    return this.artistService.getMyArtistProfile(userId);
  }

  /**
   * API ARTIST: PATCH /artists/me (Cập nhật hồ sơ cá nhân)
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artist')
  @Patch('me')
  @UseInterceptors(FileInterceptor('avatarFile')) // <-- Nhận file tên là 'avatarFile'
  async updateMyArtistProfile(
    @Req() req: any,
    @Body(ValidationPipe) dto: UpdateArtistDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.artistService.updateMyArtistProfile(userId, dto, file);
  }

    /**
   * API: GET /artists/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const artist = await this.artistService.findOne(id);
    if (!artist) {
        throw new NotFoundException(`Nghệ sĩ với ID ${id} không tồn tại`);
    }
    return artist;
  }
}