// src/admin/album/admin-album.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from '../../album/album.entity';
import { Artist } from '../../artist/artist.entity';
import { Song } from '../../song/song.entity';

@Injectable()
export class AdminAlbumService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepo: Repository<Album>,

    @InjectRepository(Artist)
    private readonly artistRepo: Repository<Artist>,

    // ⭐ THÊM REPOSITORY CHO SONG (bị thiếu)
    @InjectRepository(Song)
    private readonly songRepo: Repository<Song>,
  ) {}

  // ============================
  // FIX COVER
  // ============================
  private fixCover(album: any) {
    if (!album) return album;

    if (album.cover_url) {
      const url = album.cover_url.replace(/\\/g, '/');
      album.cover_url = `http://localhost:3000${url}`;
    } else {
      album.cover_url = `http://localhost:3000/uploads/defaults/default-cover.png`;
    }

    return album;
  }

  // ==================================================
  // AVAILABLE SONGS — SONG CHƯA CÓ ALBUM + APPROVED
  // ==================================================
  async findAvailableSongs(albumId: number) {
    const songs = await this.songRepo
      .createQueryBuilder('song')
      .leftJoinAndSelect('song.artist', 'artist')
      .where('song.album_id IS NULL')
      .andWhere('song.status = :status', { status: 'APPROVED' })
      .orderBy('song.title', 'ASC')
      .getMany();

    return songs.map(s => ({
      id: s.id,
      title: s.title,
      duration: s.duration,
      status: s.status,
      artist_name: s.artist?.stage_name ?? '—',
    }));
  }

  // ==================================================
  // LIST ALBUM
  // ==================================================
  async findAll() {
    const albums = await this.albumRepo.find({
      relations: ['artist', 'songs'],
      order: { release_date: 'DESC' },
    });

    return albums.map(a =>
      this.fixCover({
        id: a.id,
        name: a.title,
        cover_url: a.cover_url,
        release_date: a.release_date,
        artist: a.artist ? { id: a.artist.id, name: a.artist.stage_name } : null,
        songs: a.songs?.length ?? 0,
      }),
    );
  }

  async findByActive(isActive: boolean) {
    const albums = await this.albumRepo.find({
      where: { active: isActive },
      relations: ['artist', 'songs'],
      order: { title: 'ASC' },
    });

    return albums.map(a =>
      this.fixCover({
        id: a.id,
        name: a.title,
        cover_url: a.cover_url,
        release_date: a.release_date,
        artist: a.artist ? { id: a.artist.id, name: a.artist.stage_name } : null,
        songs: a.songs?.length ?? 0,
        active: a.active,
      }),
    );
  }

  // ==================================================
  // DETAIL
  // ==================================================
  async findOne(id: number) {
    const album = await this.albumRepo.findOne({
      where: { id },
      relations: ['artist', 'songs'],
    });

    if (!album) throw new NotFoundException('Album không tồn tại.');

    return this.fixCover({
      id: album.id,
      name: album.title,
      cover_url: album.cover_url,
      release_date: album.release_date,
      info: album.info,
      artist: album.artist
        ? { id: album.artist.id, name: album.artist.stage_name }
        : null,
      songs: album.songs?.length ?? 0,
      songs_list:
        album.songs?.map(s => ({
          id: s.id,
          title: s.title,
          duration: s.duration,
          status: s.status,
        })) ?? [],
    });
  }

  // ==================================================
  // FULL DETAIL
  // ==================================================
  async findFull(id: number) {
    const album = await this.albumRepo.findOne({
      where: { id },
      relations: ['artist', 'songs', 'songs.artist'],
    });

    if (!album) throw new NotFoundException('Album không tồn tại.');

    return this.fixCover({
      id: album.id,
      name: album.title,
      cover_url: album.cover_url,
      release_date: album.release_date,
      info: album.info,
      artist: album.artist
        ? { id: album.artist.id, name: album.artist.stage_name }
        : null,
      songs: album.songs?.length ?? 0,
      songs_list:
        album.songs?.map(s => ({
          id: s.id,
          title: s.title,
          duration: s.duration ?? null,
          status: s.status ?? 'ACTIVE',
          artist_name: s.artist?.stage_name ?? null,
        })) ?? [],
    });
  }

  // ==================================================
  // CREATE / UPDATE / DELETE
  // ==================================================
  async create(dto: any, cover?: Express.Multer.File) {
    const artist = await this.artistRepo.findOne({
      where: { id: dto.artist_id },
    });

    if (!artist) throw new NotFoundException('Artist không tồn tại.');

    const album = this.albumRepo.create({
      title: dto.name,
      release_date: dto.release_date ? new Date(dto.release_date) : null,
      info: dto.info ?? null,
      cover_url: cover ? `/uploads/albums/${cover.filename}` : null,
      artist,
      active: true,
    });

    await this.albumRepo.save(album);
    return { message: 'Tạo album thành công' };
  }

  async update(id: number, dto: any, cover?: Express.Multer.File) {
    const album = await this.albumRepo.findOne({
      where: { id },
      relations: ['artist'],
    });

    if (!album) throw new NotFoundException('Album không tồn tại.');

    if (dto.artist_id) {
      const artist = await this.artistRepo.findOne({
        where: { id: dto.artist_id },
      });
      if (!artist) throw new NotFoundException('Artist không tồn tại.');
      album.artist = artist;
    }

    album.title = dto.name ?? album.title;
    album.release_date = dto.release_date
      ? new Date(dto.release_date)
      : album.release_date;
    album.info = dto.info ?? album.info;

    if (cover) {
      album.cover_url = `/uploads/albums/${cover.filename}`;
    }

    await this.albumRepo.save(album);
    return { message: 'Cập nhật album thành công' };
  }

  async delete(id: number) {
    return this.albumRepo.delete(id);
  }

  async addSongToAlbum(albumId: number, songId: number) {
  const album = await this.albumRepo.findOne({ where: { id: albumId } });
  if (!album) throw new NotFoundException("Album không tồn tại");

  const song = await this.songRepo.findOne({ where: { id: songId } });
  if (!song) throw new NotFoundException("Bài hát không tồn tại");

  song.album = album;

  await this.songRepo.save(song);

  return { message: "Đã thêm bài hát vào album" };
}

async updateAlbumInfo(id: number, info: string) {
  const album = await this.albumRepo.findOne({ where: { id } });
  if (!album) throw new NotFoundException('Album không tồn tại.');

  album.info = info;
  await this.albumRepo.save(album);

  return { message: 'Cập nhật info album thành công' };
}


}
