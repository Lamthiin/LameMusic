// src/admin/album/admin-album.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from '../../album/album.entity';
import { Artist } from '../../artist/artist.entity';
import { Song } from '../../song/song.entity';
import { R2Service } from 'src/shared/r2.service';


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

    private readonly r2: R2Service, 
  ) {}

  private fixCover(album: any) {
  if (!album) return album;

  if (!album.cover_url) {
    album.cover_url = `/uploads/defaults/default-cover.png`;
    return album;
  }

  // Nếu URL đã là Cloudflare hoặc URLPublic -> giữ nguyên
  if (album.cover_url.startsWith("http")) {
    return album;
  }

  // Chỉ convert file LOCAL (nếu còn dùng)
  album.cover_url = `http://localhost:3000${album.cover_url.replace(/\\/g, '/')}`;

  return album;
}


  // ==================================================
  // AVAILABLE SONGS — SONG CHƯA CÓ ALBUM + APPROVED
  // ==================================================
  async findAvailableSongs(albumId: number) {
  // 1. Lấy album để biết artist_id
  const album = await this.albumRepo.findOne({
    where: { id: albumId },
    relations: ['artist'],
  });

  if (!album) throw new NotFoundException('Album không tồn tại.');

  const artistId = album.artist.id;
  

  // 2. Lấy danh sách bài hát theo điều kiện
  const songs = await this.songRepo
    .createQueryBuilder('song')
    .leftJoinAndSelect('song.artist', 'artist')
    .where('song.album_id IS NULL') // chưa thuộc album nào
    .andWhere('song.status = :status', { status: 'APPROVED' })
    .andWhere('artist.id = :artistId', { artistId }) // thuộc đúng nghệ sĩ của album
    .orderBy('song.title', 'ASC')
    .getMany();
  // 3. Format dữ liệu trả ra
  return songs.map(s => ({
    id: s.id,
    title: s.title,
    duration: s.duration,
    status: s.status,
    artist_id: s.artist?.id ?? null,
    artist_name: s.artist?.stage_name ?? '—',
    album_id: null, // luôn null vì đã lọc album_id IS NULL
  }));
}


  private formatDuration(duration?: number): string {
      const d = duration || 0;
      const minutes = Math.floor(d / 60).toString().padStart(2, '0');
      const seconds = (d % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
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
          duration: this.formatDuration(s.duration),
          status: s.status ?? 'ACTIVE',
          artist_name: s.artist?.stage_name ?? null,
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
          duration: this.formatDuration(s.duration),
          status: s.status ?? 'ACTIVE',
          artist_name: s.artist?.stage_name ?? null,
        })) ?? [],
    });
  }

  // ==================================================
  // CREATE / UPDATE / DELETE
  // ==================================================
  async create(dto: any, cover?: Express.Multer.File) {
  // Không cho phép gửi album_id – tránh nhầm update
  if (dto.id || dto.album_id) {
    throw new BadRequestException("Không được truyền album_id khi tạo album mới.");
  }

  const artist = await this.artistRepo.findOne({
    where: { id: dto.artist_id },
  });

  if (!artist) {
    throw new NotFoundException('Artist không tồn tại.');
  }

  let coverUrl: string | null = null;

  if (cover) {
    const uploaded = await this.r2.uploadFile(
      'albums',
      cover.originalname,
      cover.buffer,
      cover.mimetype,
    );
    coverUrl = uploaded.url;
  }

  const album = this.albumRepo.create({
    title: dto.name,
    release_date: dto.release_date ? new Date(dto.release_date) : null,
    info: dto.info ?? null,
    cover_url: coverUrl,
    artist: artist,
    active: true,
    songs: [], // Album mới mặc định không có bài hát
  });

  await this.albumRepo.save(album);

  return { message: 'Tạo album thành công', album };
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

    // ⭐ UPDATE COVER
    if (cover) {
      if (album.cover_url) {
        await this.r2.deleteFileByUrl(album.cover_url);
      }

      const uploaded = await this.r2.uploadFile(
        'albums',
        cover.originalname,
        cover.buffer,
        cover.mimetype,
      );

      album.cover_url = uploaded.url;
    }

    await this.albumRepo.save(album);
    return { message: 'Cập nhật album thành công' };
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

  async softDelete(id: number) {
    const album = await this.albumRepo.findOne({ where: { id } });

    if (!album) throw new NotFoundException("Album không tồn tại");

    album.active = false; // ⭐ Đưa album sang tab Hidden

    await this.albumRepo.save(album);

    return { message: "Album đã được chuyển vào thùng rác" };
  }

  async restore(id: number) {
  // 1️⃣ Lấy album cùng artist
  const album = await this.albumRepo.findOne({
    where: { id },
    relations: ['artist'], // load artist của album
  });

  if (!album) throw new NotFoundException("Album không tồn tại");

  // 2️⃣ Check artist có active không
  if (!album.artist || album.artist.active === 0) {
    return {
      message: "Không thể khôi phục album vì nghệ sĩ đã bị xóa.",
      success: false
    };
  }

  // 3️⃣ Khôi phục album
  album.active = true;
  await this.albumRepo.save(album);

  return { message: "Khôi phục album thành công", success: true };
}


  // ==================================================
// ADD MULTIPLE SONGS TO ALBUM
// ==================================================
async addSongsToAlbum(albumId: number, songIds: number[]) {
  if (!songIds || songIds.length === 0) {
    return { message: "Không có bài hát nào để thêm." };
  }

  const album = await this.albumRepo.findOne({ where: { id: albumId } });
  if (!album) throw new NotFoundException("Album không tồn tại");

  // Cập nhật album_id cho tất cả bài hát
  await this.songRepo
    .createQueryBuilder()
    .update()
    .set({ album: album })
    .whereInIds(songIds)
    .execute();

  return {
    message: `Đã thêm ${songIds.length} bài hát vào album.`,
    added: songIds,
  };
}
}