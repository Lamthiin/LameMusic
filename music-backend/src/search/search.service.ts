// src/search/search.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Song } from '../song/song.entity';
import { Artist } from '../artist/artist.entity';
import { Album } from '../album/album.entity';
import { User } from '../user/user.entity';
import { AiService } from '../ai/ai.service'; // ← THÊM IMPORT NÀY
import { Inject, forwardRef } from '@nestjs/common';

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

    // === THÊM AiService VỚI forwardRef NẾU CÓ CIRCULAR DEPENDENCY ===
    @Inject(forwardRef(() => AiService))
    private aiService: AiService,
  ) {}

async searchAll(query: string, topK = 10) {
  const dbResults = await this.findAll(query, 'full');
  const dbSongs = dbResults.songs;

  let aiRawResults: any[] = [];
  try {
    aiRawResults = await this.aiService.searchSongByText(query, topK);
  } catch (error) {
    console.error('AI lyrics search failed:', error);
  }

  // map AI -> DB (async)
const matchAiSongToDb = async (aiSong: any) => {
  const title = aiSong.ten_bai_hat?.trim();
  if (!title) return { id: null, ...aiSong, source: 'AI', similarity: aiSong.similarity ?? 1.0 };

  const song = await this.songRepository.findOne({
    where: { title, active: true, status: 'APPROVED' },
    relations: ['songArtists', 'songArtists.artist', 'album'],
  });

  if (song) {
    return {
      ...song,
      source: 'AI',
      similarity: aiSong.similarity ?? 1.0,
      artist_name_from_ai: aiSong.nghe_si,
      artists: song.songArtists?.map(sa => sa.artist) || [], // <-- tất cả artist
    };
  } else {
    return {
      id: null,
      title: aiSong.ten_bai_hat,
      artist_name: aiSong.nghe_si,
      album_name: aiSong.album || null,
      image_url: '/images/ai-placeholder.jpg',
      songArtists: [],
      album: null,
      source: 'AI',
      similarity: aiSong.similarity ?? 1.0,
      artists: [], // fallback rỗng
    };
  }
};

  const matchedAiSongs = await Promise.all(aiRawResults.map(matchAiSongToDb));

  const allSongs = [
    ...matchedAiSongs,
    ...dbResults.songs.map(s => ({ ...s, source: 'DB', similarity: 1.0 })),
  ];

  allSongs.sort((a, b) => b.similarity - a.similarity);

  return {
    ...dbResults,
    songs: allSongs,
  };
}


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
