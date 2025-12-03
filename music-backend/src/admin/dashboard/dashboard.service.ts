import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../user/user.entity';
import { Artist } from '../../artist/artist.entity';
import { Song } from '../../song/song.entity';
import { Album } from '../../album/album.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Artist) private artistRepo: Repository<Artist>,
    @InjectRepository(Song) private songRepo: Repository<Song>,
    @InjectRepository(Album) private albumRepo: Repository<Album>,
  ) {}

  async getOverview() {
    const totalUsers = await this.userRepo.count();
    const totalArtists = await this.artistRepo.count();
    const totalSongs = await this.songRepo.count();
    const totalAlbums = await this.albumRepo.count();

    return {
      users: { total: totalUsers },
      artists: { total: totalArtists },
      songs: { total: totalSongs },
      albums: { total: totalAlbums },
    };
  }
}
