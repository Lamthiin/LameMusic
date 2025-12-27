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

async findAll(query: string, mode: 'dropdown' | 'full' = 'dropdown') {
  if (!query?.trim()) {
    return { songs: [], artists: [], albums: [], users: [] };
  }

  const limit = mode === 'full' ? 50 : 3;
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
      .take(limit)
      .getMany(),

    this.artistRepository.find({
      where: { stage_name: Like(searchTerm), active: 1 },
      take: limit,
    }),

    this.albumRepository.find({
      where: { title: Like(searchTerm), active: true },
      relations: ['artist'],
      take: limit,
    }),

    this.userRepository.find({
      where: { username: Like(searchTerm), active: 1 },
      relations: ['role'],
      take: limit,
    }),
  ]);

  return { songs, artists, albums, users };
}


}
