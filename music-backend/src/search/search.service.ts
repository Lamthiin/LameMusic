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
        this.songRepository
          .createQueryBuilder('song')
          .leftJoinAndSelect('song.songArtists', 'sa', 'sa.active = 1')
          .leftJoinAndSelect('sa.artist', 'artist', 'artist.active = 1')
          .leftJoinAndSelect('song.album', 'album')
          .where('song.title LIKE :search', { search: searchTerm })
          .andWhere('song.active = 1')
          .andWhere('song.status = "APPROVED"')
          .take(5)
          .getMany(),

      // 2. Tìm Nghệ sĩ
      this.artistRepository.find({
        where: { stage_name: Like(searchTerm), active: 1 },
        take: 5,
      }),
      
      // 3. Tìm Album
      this.albumRepository.find({
        where: { title: Like(searchTerm), active: true },
        relations: ['artist'],
        take: 5,
      }),

      // 4. Tìm User
      this.userRepository.find({
        where: { username: Like(searchTerm), active: 1 },
        relations: ['role'],
        take: 5,
      })
    ]);

    // Chuyển songArtists thành mảng artist trực tiếp
    const formattedSongs = songs.map(song => ({
      ...song,
      artists: song.songArtists.map(sa => sa.artist),
    }));

    const listenerUsers = users.filter(u => u.role?.name === 'listener');
    listenerUsers.forEach(u => delete u.password);

    return { songs: formattedSongs, artists, albums, users: listenerUsers };
  }
}
