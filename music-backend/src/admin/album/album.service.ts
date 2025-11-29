// src/admin/album/admin-album.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from '../../album/album.entity';
import { Artist } from '../../artist/artist.entity';

@Injectable()
export class AdminAlbumService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepo: Repository<Album>,

    @InjectRepository(Artist)
    private readonly artistRepo: Repository<Artist>,
  ) {}

  // ==================================================
  // LIST ALBUM — map entity → FE
  // ==================================================
  async findAll() {
    const albums = await this.albumRepo.find({
      relations: ['artist', 'songs'],
      order: { release_date: 'DESC' },
    });

    return albums.map((a) => ({
      id: a.id,
      name: a.title,                      // FE gọi name → map từ title
      cover_url: a.cover_url,
      release_date: a.release_date,
      artist: a.artist
        ? { id: a.artist.id, name: a.artist.stage_name }
        : null,
      songs: a.songs?.length ?? 0,
    }));
  }

  async findByActive(isActive: boolean) {
  const albums = await this.albumRepo.find({
    where: { active: isActive },
    relations: ['artist', 'songs'],
    order: { title: 'ASC' },
  });

  return albums.map(a => ({
    id: a.id,
    name: a.title,
    cover_url: a.cover_url,
    release_date: a.release_date,
    artist: a.artist ? { id: a.artist.id, name: a.artist.stage_name } : null,
    songs: a.songs?.length ?? 0,
    active: a.active
  }));
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

    return {
      id: album.id,
      name: album.title,
      cover_url: album.cover_url,
      release_date: album.release_date,
      info: album.info,
      artist: album.artist
        ? { id: album.artist.id, name: album.artist.stage_name }
        : null,
      songs: album.songs?.length ?? 0,
    };
  }

  // ==================================================
  // CREATE — dùng đúng field entity
  // ==================================================
  async create(dto: any, cover?: Express.Multer.File) {
    const artist = await this.artistRepo.findOne({
      where: { id: dto.artist_id },
    });

    if (!artist) throw new NotFoundException('Artist không tồn tại.');

    const album = this.albumRepo.create({
      title: dto.name,
      release_date: dto.release_date
        ? new Date(dto.release_date)
        : null,                                      // chỉ hợp lệ khi entity có | null
      info: dto.info ?? null,
      cover_url: cover ? `/uploads/albums/${cover.filename}` : null,
      artist: artist,
      active: true,
    });

    await this.albumRepo.save(album);

    return { message: 'Tạo album thành công' };
  }

  // ==================================================
  // UPDATE — theo đúng entity
  // ==================================================
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

  // ==================================================
  // DELETE
  // ==================================================
  async delete(id: number) {
    return this.albumRepo.delete(id);
  }
}
