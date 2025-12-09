// src/admin/manage-song/manage-song.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Song } from '../../song/song.entity';
import { Artist } from '../../artist/artist.entity';
import { Album } from '../../album/album.entity';
import { Category } from '../../category/category.entity';
import { Lyrics } from '../../lyrics/lyrics.entity';
import { SongArtist } from '../../song/song-artist.entity';

import { R2Service } from '../../shared/r2.service';
import { UpdateSongDto } from './dto/update-song.dto';

import * as mm from 'music-metadata';
import { NotificationService } from '../../notification/notification.service';
import { NotificationType } from '../../notification/notification.entity';

@Injectable()
export class ManageSongService {
  constructor(
    @InjectRepository(Song) private songRepo: Repository<Song>,
    @InjectRepository(Artist) private artistRepo: Repository<Artist>,
    @InjectRepository(Album) private albumRepo: Repository<Album>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Lyrics) private lyricsRepo: Repository<Lyrics>,
    @InjectRepository(SongArtist) private songArtistRepo: Repository<SongArtist>,

    private readonly r2: R2Service,
    private readonly notificationService: NotificationService,
  ) {}

  // ======================================================
  // TẠO BÀI HÁT (UPLOAD)
  // ======================================================
  async uploadSong(files: any, body: any) {
    try {
      const audio = files?.audioFile?.[0];
      const image = files?.imageFile?.[0];

      if (!audio || !image) {
        throw new BadRequestException('Thiếu file nhạc hoặc ảnh bìa');
      }

      const metadata = await mm.parseBuffer(audio.buffer);
      const detectedDuration = Math.floor(metadata.format.duration || 0);

      // Primary artist
      const artist = await this.artistRepo.findOne({
        where: { id: Number(body.artist) },
      });
      if (!artist) throw new NotFoundException('Artist không tồn tại');

      // Album
      let album: Album | null = null;
      if (body.album) {
        album = await this.albumRepo.findOne({
          where: { id: Number(body.album) },
        });
        if (!album) throw new NotFoundException('Album không tồn tại');
      }

      // Category
      const category = await this.categoryRepo.findOne({
        where: { id: Number(body.category) },
      });
      if (!category) throw new NotFoundException('Thể loại không tồn tại');

      // =====================
      // Upload lên R2
      // =====================
      const audioUploaded = await this.r2.uploadFile(
        'music',
        audio.originalname,
        audio.buffer,
        audio.mimetype,
      );

      const imageUploaded = await this.r2.uploadFile(
        'covers',
        image.originalname,
        image.buffer,
        image.mimetype,
      );

      // =====================
      // Tạo song
      // =====================
      const song = this.songRepo.create({
        title: body.title,
        duration: detectedDuration,
        file_url: audioUploaded.url,
        image_url: imageUploaded.url,
        status: 'APPROVED',
        active: true,
        album: album ?? null,
        genre: category.name,
      });

      const savedSong = await this.songRepo.save(song);

      // =====================
      // Lưu nghệ sĩ chính
      // =====================
      await this.songArtistRepo.save({
        song: savedSong,
        artist,
        is_primary: true,
      });

      // =====================
      // Lưu nghệ sĩ collab
      // =====================
      if (Array.isArray(body.featuredArtists)) {
        for (const id of body.featuredArtists) {
          const collab = await this.artistRepo.findOne({
            where: { id: Number(id) },
          });

          if (collab) {
            await this.songArtistRepo.save({
              song: savedSong,
              artist: collab,
              is_primary: false,
            });
          }
        }
      }

      // =====================
      // Lưu lyrics
      // =====================
      if (body.lyrics?.trim()) {
        const lyricsRecord = this.lyricsRepo.create({
          song: savedSong,
          song_id: savedSong.id,
          lyrics: body.lyrics.trim(),
          language: body.lyricsLanguage || 'vi',
        });
        await this.lyricsRepo.save(lyricsRecord);
      }

      // =====================
      // Gửi thông báo
      // =====================
      if (artist.user_id) {
        await this.notificationService.createNotificationForUser(
          artist.user_id,
          artist.id,
          NotificationType.SONG_APPROVED,
          `Admin đã thêm bài hát "${savedSong.title}" vào hồ sơ nghệ sĩ của bạn.`,
          savedSong.id,
        );
      }

      return savedSong;
    } catch (err) {
      console.error('❌ LỖI UPLOAD:', err);
      throw err;
    }
  }

  // ======================================================
  // LẤY LIST SONG
  // ======================================================
  async getAllSongsForAdmin() {
    return this.songRepo.find({
      relations: ['songArtists', 'songArtists.artist', 'album', 'lyrics'],
      order: {
        songArtists: {
          is_primary: 'DESC',   // ⭐ Ưu tiên nghệ sĩ chính
        },
        id: 'DESC'
      }
    });
  }


  // ======================================================
  // DETAIL SONG
  // ======================================================
  async getSongDetail(id: number) {
    const song = await this.songRepo.findOne({
      where: { id },
      relations: ['songArtists', 'songArtists.artist', 'album', 'lyrics'],
      order: {
        songArtists: { is_primary: 'DESC' }
      }
    });

    if (!song) throw new NotFoundException('Không tìm thấy bài hát');
    return song;
  }


  // ======================================================
  // UPDATE SONG
  // ======================================================
  async updateSong(id: number, body: UpdateSongDto, files?: any) {
    const song = await this.songRepo.findOne({
      where: { id },
      relations: ['album', 'lyrics', 'songArtists', 'songArtists.artist'],
    });

    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    if (body.title) song.title = body.title.trim();

    // ========================
    // CATEGORY
    // ========================
    if (body.category) {
      const category = await this.categoryRepo.findOne({
        where: { id: Number(body.category) },
      });

      if (!category) throw new NotFoundException('Thể loại không tồn tại');
      song.genre = category.name;
    }

    song.songArtists = [];
    // =====================
    // UPDATE NGHỆ SĨ (primary + collab)
    // =====================
    if (body.artist) {
      const artist = await this.artistRepo.findOne({
        where: { id: Number(body.artist) },
      });

      if (!artist) throw new NotFoundException('Artist không tồn tại');

      // XÓA toàn bộ quan hệ cũ
      await this.songArtistRepo
        .createQueryBuilder()
        .delete()
        .from(SongArtist)
        .where("song_id = :id", { id })
        .execute();

      // Thêm nghệ sĩ chính
      await this.songArtistRepo.save({
        song: song,
        artist,
        is_primary: true,
      });

      // Thêm collab
      if (Array.isArray(body.featuredArtists)) {
        for (const aId of body.featuredArtists) {
          const collab = await this.artistRepo.findOne({
            where: { id: Number(aId) },
          });

          if (collab) {
            await this.songArtistRepo.save({
              song: song,
              artist: collab,
              is_primary: false,
            });
          }
        }
      }
    }

  // ========================
  // ALBUM
  // ========================
  if (body.album !== undefined) {
    if (body.album === "" || body.album === null) {
      song.album = null;
    } else {
      const album = await this.albumRepo.findOne({
        where: { id: Number(body.album) },
      });

      if (!album) throw new NotFoundException("Album không tồn tại");

      song.album = album;
    }
  }

  // ========================
  // LYRICS
  // ========================
  if (body.lyrics !== undefined) {
    const content = body.lyrics.trim();

    if (song.lyrics) {
      song.lyrics.lyrics = content;
      song.lyrics.language = body.lyricsLanguage || 'vi';
      await this.lyricsRepo.save(song.lyrics);
    } else if (content !== '') {
      const newLyrics = this.lyricsRepo.create({
        song,
        song_id: song.id,
        lyrics: content,
        language: body.lyricsLanguage || 'vi',
      });
      await this.lyricsRepo.save(newLyrics);
      song.lyrics = newLyrics;
    }
  }

  // ========================
  // ẢNH
  // ========================
  const newImage = files?.imageFile?.[0];
  if (newImage) {
    if (song.image_url) await this.r2.deleteFileByUrl(song.image_url);

    const uploaded = await this.r2.uploadFile(
      'covers',
      newImage.originalname,
      newImage.buffer,
      newImage.mimetype,
    );

    song.image_url = uploaded.url;
  }

  // ========================
  // FILE NHẠC
  // ========================
  const newAudio = files?.audioFile?.[0];
  if (newAudio) {
    if (song.file_url) await this.r2.deleteFileByUrl(song.file_url);

    const meta = await mm.parseBuffer(newAudio.buffer);
    song.duration = Math.floor(meta.format.duration || 0);

    const uploaded = await this.r2.uploadFile(
      'music',
      newAudio.originalname,
      newAudio.buffer,
      newAudio.mimetype,
    );

    song.file_url = uploaded.url;
  }

  delete (song as any).songArtists;
  await this.songRepo.save(song);
  return song;

}


  // ======================================================
  // GET ALBUMS BY ARTIST
  // ======================================================
  async getAlbumsByArtist(artistId: number) {
    return this.albumRepo.find({
      where: { artist: { id: artistId }, active: true, },
      order: { title: 'ASC' },
    });
  }

  // ======================================================
  // TOGGLE ACTIVE
  // ======================================================
  async toggleActive(id: number) {
    const song = await this.songRepo.findOne({ where: { id } });
    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    if (song.status === 'APPROVED') song.status = 'HIDDEN';
    else if (song.status === 'HIDDEN') song.status = 'APPROVED';

    song.active = true;

    return this.songRepo.save(song);
  }

  // ======================================================
  // APPROVE SONG
  // ======================================================
  async approveSong(id: number) {
    const song = await this.songRepo.findOne({
      where: { id },
      relations: ['songArtists', 'songArtists.artist'],
    });

    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    song.status = 'APPROVED';
    song.active = true;
    await this.songRepo.save(song);

    const artist = song.songArtists.find((s) => s.is_primary)?.artist;

    if (artist?.user_id) {
      await this.notificationService.createNotificationForUser(
        artist.user_id,
        artist.id,
        NotificationType.SONG_APPROVED,
        `Bài hát "${song.title}" đã được phê duyệt.`,
        song.id,
      );
    }

    return song;
  }

  // ======================================================
  // REJECT SONG
  // ======================================================
  async rejectSong(id: number) {
    const song = await this.songRepo.findOne({
      where: { id },
      relations: ['songArtists', 'songArtists.artist'],
    });

    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    song.status = 'REJECTED';
    song.active = false;

    await this.songRepo.save(song);

    const artist = song.songArtists.find((s) => s.is_primary)?.artist;

    if (artist?.user_id) {
      await this.notificationService.createNotificationForUser(
        artist.user_id,
        artist.id,
        NotificationType.SONG_REJECTED,
        `Bài hát "${song.title}" đã bị từ chối bởi quản trị viên.`,
        song.id,
      );
    }

    return song;
  }

  // ======================================================
  // SOFT DELETE
  // ======================================================
  async softDeleteSong(id: number) {
    const song = await this.songRepo.findOne({ where: { id } });
    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    song.active = false;
    song.status = 'APPROVED';

    return this.songRepo.save(song);
  }

  // ======================================================
  // DELETE SONG
  // ======================================================
  async deleteSong(id: number) {
    const song = await this.songRepo.findOne({ where: { id } });

    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    if (song.image_url) await this.r2.deleteFileByUrl(song.image_url);
    if (song.file_url) await this.r2.deleteFileByUrl(song.file_url);

    await this.songRepo.delete(id);
    return { success: true };
  }

  // ======================================================
  // PAGINATION
  // ======================================================
  async getPaginatedSongs(page: number) {
    const take = 15;
    const skip = (page - 1) * take;

    const [songs, total] = await this.songRepo.findAndCount({
      take,
      skip,
      order: {
        songArtists: { is_primary: 'DESC' },
        id: 'DESC'
      },
      relations: ['songArtists', 'songArtists.artist', 'album', 'lyrics'],
    });

    return {
      data: songs,
      currentPage: page,
      totalPages: Math.ceil(total / take),
      totalItems: total,
    };
  }
}
