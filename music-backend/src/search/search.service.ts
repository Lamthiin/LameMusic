// music-backend/src/search/search.service.ts (BẢN SỬA LỖI TÌM KIẾM USER)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm'; 
import { Song } from '../song/song.entity';
import { Artist } from '../artist/artist.entity';
import { Album } from '../album/album.entity';
import { User } from '../user/user.entity'; 

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
    @InjectRepository(User) 
    private userRepository: Repository<User>,
  ) {}

  async findAll(query: string) {
    if (!query || query.trim() === '') {
      return { songs: [], artists: [], albums: [], users: [] }; 
    }

    const searchTerm = `%${query}%`; 

    const [songs, artists, albums, users] = await Promise.all([
      
      // 1. Tìm Bài hát
      this.songRepository.find({
        where: { title: Like(searchTerm), active: true },
        relations: ['artist', 'album'],
        take: 5, 
      }),
      
      // 2. Tìm Nghệ sĩ
      this.artistRepository.find({
        where: { stage_name: Like(searchTerm), active: 1 },
        take: 5,
      }),
      
      // 3. Tìm Album
      this.albumRepository.find({
        where: { title: Like(searchTerm) }, 
        relations: ['artist'],
        take: 5,
      }),

      // 4. SỬA LỖI: TÌM USER (CHỈ LỌC THEO USERNAME, TẢI LUÔN ROLE)
      this.userRepository.find({
        where: { 
            username: Like(searchTerm), 
            active: 1, // Chỉ tìm user đã active
        },
        relations: ['role'], // <-- Tải Role để lọc ở bước dưới
        take: 5,
      })
    ]);

    // === LỌC ROLE 'LISTENER' Ở ĐÂY (TRONG SERVICE) ===
    const listenerUsers = users.filter(u => u.role?.name === 'listener');

    // Xóa password
    listenerUsers.forEach(u => delete u.password);

    return { songs, artists, albums, users: listenerUsers }; // <-- Trả về mảng đã lọc
  }
}