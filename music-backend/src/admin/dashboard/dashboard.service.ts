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

  // -------------------------
  // 1) Tổng quan overview
  // -------------------------
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

  // -------------------------
  // 2) Top Chart (bỏ likes)
  // -------------------------
  // async getTopCharts() {
  //   const topSongs = await this.songRepo
  //     .createQueryBuilder('song')
  //     .leftJoin('song.artist', 'artist')
  //     .select([
  //       'song.id AS id',
  //       'song.title AS title',
  //       'song.image_url AS image',
  //       'artist.stage_name AS artist',
  //       'song.play_count AS plays',
  //       'song.genre AS genre',
  //     ])
  //     .where("song.status = 'APPROVED'")
  //     .andWhere("song.active = 1")
  //     .orderBy('song.play_count', 'DESC')
  //     .limit(10)
  //     .getRawMany();

  //   return topSongs.map((s, index) => ({
  //     top: index + 1,
  //     id: s.id,
  //     title: s.title,
  //     image: s.image,
  //     artist: s.artist,
  //     plays: s.plays,
  //     genre: s.genre,
  //   }));
  // }

async getTopCharts() {
  const rawSongs = await this.songRepo
    .createQueryBuilder('song')
    .leftJoin('song.songArtists', 'sa')
    .leftJoin('sa.artist', 'artist')
    .select([
      'song.id AS id',
      'song.title AS title',
      'song.image_url AS image',
      'song.play_count AS plays',
      'song.genre AS genre',
      `
      MAX(CASE WHEN sa.is_primary = 1 THEN artist.stage_name END)
      AS primaryArtist
      `,
      `
      GROUP_CONCAT(DISTINCT artist.stage_name ORDER BY sa.is_primary DESC SEPARATOR ', ')
      AS artists
      `,
    ])
    .where("song.status = 'APPROVED'")
    .andWhere("song.active = 1")
    .groupBy('song.id')
    .orderBy('song.play_count', 'DESC')
    .limit(10)
    .getRawMany<{
      id: number;
      title: string;
      image: string;
      plays: number;
      genre: string;
      primaryArtist: string | null;
      artists: string | null;
    }>();

  return rawSongs.map((s, index) => {
    const list = s.artists ? s.artists.split(', ').filter(Boolean) : [];

    // Đưa nghệ sĩ chính lên đầu (nếu chưa đứng đầu)
    let sorted = list;
    if (s.primaryArtist) {
      sorted = [
        s.primaryArtist,
        ...list.filter((a) => a !== s.primaryArtist)
      ];
    }

    return {
      top: index + 1,
      id: s.id,
      title: s.title,
      image: s.image,
      plays: s.plays,
      genre: s.genre,
      artists: sorted,
    };
  });
}




    // TOP NGHE SĨ DỰA TRÊN BÀI HÁT APPROVED
  // async getTopArtists() {
  //   const artists = await this.artistRepo.find({
  //       relations: ['songs'],
  //   });

  //   const topArtists = artists
  //       .map((artist) => {
  //       // Chỉ lấy bài hát status APPROVED
  //       const approvedSongs = artist.songs?.filter(
  //           (song) => song.status === 'APPROVED'
  //       ) || [];

  //       return {
  //           id: artist.id,
  //           name: artist.stage_name,
  //           image: artist.avatar_url ?? null,
  //           totalPlays: approvedSongs.reduce(
  //           (sum, song) => sum + song.play_count,
  //           0
  //           ),
  //       };
  //       })
  //       .sort((a, b) => b.totalPlays - a.totalPlays)
  //       .slice(0, 5); // Lấy top 5 nghệ sĩ

  //   return topArtists;
  // }

    async getTopArtists() {
    const artists = await this.artistRepo.find({
      relations: ['songArtists', 'songArtists.song'],
    });

    const topArtists = artists
      .map((artist) => {
        const approvedSongs = artist.songArtists
          ?.filter((sa) => sa.song.status === 'APPROVED')
          .map((sa) => sa.song) || [];

        return {
          id: artist.id,
          name: artist.stage_name,
          image: artist.avatar_url ?? null,
          totalPlays: approvedSongs.reduce((sum, song) => sum + (song.play_count || 0), 0),
        };
      })
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 5);

    return topArtists;
  }


}
