// music-backend/src/album/album.service.ts (FULL CODE ĐÃ SỬA)
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from './album.entity';
import { Artist } from '../artist/artist.entity'; // <-- (1) IMPORT
import { CreateAlbumDto } from './dto/create-album.dto'; // <-- (2) IMPORT
import { UpdateAlbumDto } from './dto/update-album.dto'; // <-- (3) IMPORT
import { User } from '../user/user.entity'; // <-- (4) IMPORT

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
    @InjectRepository(Artist) // <-- (5) INJECT ARTIST REPO
    private artistRepository: Repository<Artist>,
  ) {}

  // Hàm helper để lấy Artist từ UserId
  private async getArtistByUserId(userId: number): Promise<Artist> {
    const artist = await this.artistRepository.findOne({ where: { user_id: userId } });
    if (!artist) {
      throw new NotFoundException('Không tìm thấy hồ sơ nghệ sĩ của bạn.');
    }
    return artist;
  }

  async findOne(id: number): Promise<Album> {
    const album = await this.albumRepository.findOne({
      where: { id: id },
      relations: [
        'artist', 
        'songs', 
        'songs.artist' 
      ],
      order: {
        // === SỬA LỖI TẠI ĐÂY (TRỞ LẠI DÒNG GỐC) ===
        songs: { 
            track_number: 'ASC' // <-- Giờ đã hợp lệ
        } 
      } as any, // Giữ lại as any để tránh lỗi TypeScript khi query lồng nhau
    });

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found.`);
    }

    return album;
  }

  /**
   * HÀM MỚI: Lấy tất cả Album
   */
  async findAllAlbums(): Promise<Album[]> {
    return this.albumRepository.find({
      relations: ['artist'], 
      order: { release_date: 'DESC' }, 
    });
  }


/**
   * HÀM MỚI (ARTIST): Lấy TẤT CẢ Album của TÔI
   */
  async findMyAlbums(userId: number): Promise<Album[]> {
    const artist = await this.getArtistByUserId(userId);
    return this.albumRepository.find({
      where: { artist: { id: artist.id } },
      relations: ['songs'], 
      order: { release_date: 'DESC' },
    });
  }

  /**
   * HÀM MỚI (ARTIST): TẠO Album mới
   */
  async createAlbum(userId: number, dto: CreateAlbumDto, coverFile?: Express.Multer.File): Promise<Album> {
    const artist = await this.getArtistByUserId(userId);

    // === SỬA LỖI TS2322 (LỖI 1) ===
    let cover_url: string | null = null; // Khai báo rõ ràng kiểu
    if (coverFile) {
        cover_url = `/uploads/covers/${coverFile.filename}`; 
    }
    // =============================

    const newAlbum = this.albumRepository.create({
      ...dto,
      artist: artist,
      cover_url: cover_url, // (Lỗi 2, 3 đã được fix)
    });
    
    return this.albumRepository.save(newAlbum);
  }

  /**
   * HÀM MỚI (ARTIST): CẬP NHẬT Album
   */
  async updateMyAlbum(userId: number, albumId: number, dto: UpdateAlbumDto, coverFile?: Express.Multer.File): Promise<Album> {
    const artist = await this.getArtistByUserId(userId);
    const album = await this.albumRepository.findOne({ 
      where: { id: albumId },
      relations: ['artist'] 
    });

    if (!album) throw new NotFoundException('Album không tồn tại.');
    if (album.artist.id !== artist.id) {
      throw new UnauthorizedException('Bạn không có quyền sửa Album này.');
    }

    // Cập nhật thông tin
    album.title = dto.title || album.title;
    
    // === SỬA LỖI TS2322 (LỖI 4): CHUYỂN STRING SANG DATE ===
    if (dto.release_date) {
        album.release_date = new Date(dto.release_date);
    }
    // ==================================================
    
    if (coverFile) {
        album.cover_url = `/uploads/covers/${coverFile.filename}`;
    }

    return this.albumRepository.save(album);
  }

  /**
   * HÀM MỚI (ARTIST): XÓA Album
   */
  async deleteMyAlbum(userId: number, albumId: number): Promise<{ message: string }> {
    const artist = await this.getArtistByUserId(userId);
    const album = await this.albumRepository.findOne({ 
        where: { id: albumId },
        relations: ['artist'] 
    });

    if (!album) throw new NotFoundException('Album không tồn tại.');
    if (album.artist.id !== artist.id) {
      throw new UnauthorizedException('Bạn không có quyền xóa Album này.');
    }

    // (Cần xóa file ảnh bìa ở đây)

    await this.albumRepository.delete(albumId);
    return { message: 'Xóa Album thành công.' };
  }
}