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
import { AiService } from '../../ai/ai.service';

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
    private readonly aiService: AiService,   // AI Service
  ) {}

  private logNotify(title: string, data: Record<string, any>) {
    console.log(`🚀 [NOTIFY] ${title}`);
    for (const [key, value] of Object.entries(data)) {
      console.log(`➡️ ${key}:`, value);
    }
    console.log('------------------------------------------------');
  }


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
      // TẠO EMBEDDING (AI)
      // =====================
      let embedding: number[] | null = null;

      try {
        embedding = await this.aiService.generateSongEmbedding(
          body.title,
          category.name,
        );
      } catch (e) {
        console.warn('⚠️ Không tạo được embedding, tiếp tục lưu bài hát');
      }


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
        embedding: embedding, // <- EMBEDDING (AI)
      });

      const savedSong = await this.songRepo.save(song);

      // =====================
      // 1) LƯU NGHỆ SĨ CHÍNH → 11 (is_primary = true, active = true)
      // =====================
      await this.songArtistRepo.save({
        song_id: savedSong.id,
        artist_id: artist.id,
        is_primary: true,
        active: true,
        song: { id: savedSong.id },
        artist: { id: artist.id },
      });


      // =====================
      // 2) LƯU NGHỆ SĨ COLLAB → 01 (is_primary = false, active = true)
      //    FE gửi featuredArtists = JSON.stringify([...])
      // =====================
      let featuredIds: number[] = [];

      if (body.featuredArtists) {
        const raw =
          typeof body.featuredArtists === 'string'
            ? JSON.parse(body.featuredArtists)
            : body.featuredArtists;

        if (Array.isArray(raw)) {
          featuredIds = raw.map((v: any) => Number(v));
        }
      }

      for (const id of featuredIds) {
        await this.songArtistRepo.save({
          song_id: savedSong.id,
          artist_id: id,
          is_primary: false,
          active: true,
          song: { id: savedSong.id },
          artist: { id },
        });
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
        this.logNotify('SEND SONG APPROVED (UPLOAD)', {
          userId: artist.user_id,
          artistId: artist.id,
          songId: savedSong.id,
          title: savedSong.title,
          type: NotificationType.SONG_APPROVED,
        });

        await this.notificationService.createNotificationForUser(
          artist.user_id,
          artist.id,
          NotificationType.SONG_APPROVED,
          `Admin đã thêm bài hát "${savedSong.title}" vào hồ sơ nghệ sĩ của bạn.`,
          savedSong.id,
        );

        console.log('✅ [NOTIFY] SENT SUCCESS');
        console.log('------------------------------------------------');
      } else {
        console.log('⚠️ [NOTIFY] SKIP');
        console.log('➡️ Reason: Artist không có userId, không gửi thông báo');
        console.log('➡️ artistId:', artist.id);
        console.log('➡️ songId:', savedSong.id);
        console.log('➡️ title:', savedSong.title);
        console.log('------------------------------------------------');
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

    console.log('✏️ [SONG] START UPDATE');
    console.log('➡️ songId:', song.id);
    console.log(`➡️ title: "${song.title}"`);
    console.log('➡️ fields:', Object.keys(body));
    console.log('------------------------------------------------');


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
    
    // ========================
    // UPDATE NGHỆ SĨ (primary + collab) — KHÔNG DÙNG save() NỮA
    // =====================================================
    if (body.artist) {
      const newPrimaryId = Number(body.artist);

      let newCollabs: number[] = [];
      if (body.featuredArtists) {
        const raw = typeof body.featuredArtists === "string"
          ? JSON.parse(body.featuredArtists)
          : body.featuredArtists;

        if (Array.isArray(raw)) newCollabs = raw.map(Number);
      }

      // Lấy quan hệ cũ
      const oldRelations = await this.songArtistRepo.find({
        where: { song_id: id },
      });

      const oldArtistIds = oldRelations.map(r => r.artist_id);
      const newArtistIds = [newPrimaryId, ...newCollabs];

      // -------------------------------
      // 1) UPDATE primary (11) — FIXED
      // -------------------------------
      if (oldArtistIds.includes(newPrimaryId)) {
        await this.songArtistRepo
          .createQueryBuilder()
          .update(SongArtist)
          .set({
            is_primary: true,
            active: true,
          })
          .where("song_id = :songId", { songId: id })
          .andWhere("artist_id = :artistId", { artistId: newPrimaryId })
          .execute();
      } else {
        await this.songArtistRepo.insert({
          song_id: id,
          artist_id: newPrimaryId,
          is_primary: true,
          active: true,
        });
      }

      // -------------------------------
      // 2) UPDATE collabs (01)
      // -------------------------------
      for (const collabId of newCollabs) {
        if (oldArtistIds.includes(collabId)) {
          await this.songArtistRepo
            .createQueryBuilder()
            .update(SongArtist)
            .set({
              is_primary: false,
              active: true,
            })
            .where("song_id = :songId", { songId: id })
            .andWhere("artist_id = :artistId", { artistId: collabId })
            .execute();
        } else {
          await this.songArtistRepo.insert({
            song_id: id,
            artist_id: collabId,
            is_primary: false,
            active: true,
          });
        }
      }

      /// -------------------------------
      // 3) NGHỆ SĨ BỊ LOẠI → active = false
      // -------------------------------
      for (const old of oldRelations) {
        if (!newArtistIds.includes(old.artist_id)) {
          await this.songArtistRepo
            .createQueryBuilder()
            .update(SongArtist)
            .set({ active: false })
            .where("song_id = :songId", { songId: id })
            .andWhere("artist_id = :artistId", { artistId: old.artist_id })
            .execute();
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

    // ✅ BỔ SUNG: đảm bảo không lỗi + log rõ ràng
    if (artist?.user_id) {
      try {
        await this.notificationService.createNotificationForUser(
          artist.user_id,
          artist.id,
          NotificationType.SONG_APPROVED,
          `Bài hát "${song.title}" đã được phê duyệt.`,
          song.id,
        );

        console.log('✅ [NOTIFY] SONG APPROVED SENT');
        console.log(`🎵 [SONG] Đã duyệt bài hát: ${song.title}`);
        console.log('➡️ userId:', artist.user_id);
        console.log('➡️ artistId:', artist.id);
        console.log('➡️ songId:', song.id);
        console.log('------------------------------------------------');
      } catch (err) {
        console.error('❌ [NOTIFY] FAILED TO SEND SONG APPROVED');
        console.error(err);
        console.log('------------------------------------------------');
      }
    } else {
      console.log('⚠️ [NOTIFY] SKIP SENDING SONG APPROVED');
      console.log(`🎵 [SONG] Đã duyệt bài hát: ${song.title}`);
      console.log('➡️ Reason: Artist không có userId, không gửi thông báo');
      console.log('➡️ songId:', song.id);
      console.log('------------------------------------------------');
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

    // =========================
    // LOG + NOTIFY REJECT
    // =========================
    if (artist?.user_id) {
      console.log('🚀 [NOTIFY] SEND SONG REJECTED');
      console.log('➡️ userId:', artist.user_id);
      console.log('➡️ artistId:', artist.id);
      console.log('➡️ songId:', song.id);
      console.log(`➡️ title: "${song.title}"`);
      console.log('------------------------------------------------');

      await this.notificationService.createNotificationForUser(
        artist.user_id,
        artist.id,
        NotificationType.SONG_REJECTED,
        `Bài hát "${song.title}" đã bị từ chối bởi quản trị viên.`,
        song.id,
      );

      console.log('❌ [NOTIFY] REJECT SENT SUCCESS');
      console.log('------------------------------------------------');
    } else {
      console.log('⚠️ [NOTIFY] SKIP SONG REJECTED');
      console.log('➡️ Reason: Artist không có userId');
      console.log('➡️ songId:', song.id);
      console.log(`➡️ title: "${song.title}"`);
      console.log('------------------------------------------------');
    }

    return song;
  }


  // ======================================================
  // SOFT DELETE SONG (LOG)
  // ======================================================
  async softDeleteSong(id: number) {
    const song = await this.songRepo.findOne({ where: { id } });
    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    console.log('🗑️ [SONG] START SOFT DELETE');
    console.log('➡️ songId:', song.id);
    console.log(`➡️ title: "${song.title}"`);
    console.log('➡️ currentStatus:', song.status);
    console.log('➡️ currentActive:', song.active);
    console.log('------------------------------------------------');

    // Soft delete
    song.active = false;
    song.status = 'APPROVED';

    await this.songRepo.save(song);

    console.log('✅ [SONG] SOFT DELETE SUCCESS');
    console.log('➡️ songId:', song.id);
    console.log(`➡️ title: "${song.title}"`);
    console.log('➡️ newStatus:', song.status);
    console.log('➡️ newActive:', song.active);
    console.log('------------------------------------------------');

    return song;
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
