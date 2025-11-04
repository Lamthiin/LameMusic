// music-backend/src/album/album.service.ts (FULL CODE ĐÃ SỬA)
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from './album.entity';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
  ) {}

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
}