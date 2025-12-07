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
import { R2Service } from '../../shared/r2.service';
import { UpdateSongDto } from './dto/update-song.dto';
import { Category } from '../../category/category.entity';
import { Lyrics } from '../../lyrics/lyrics.entity';
import * as mm from 'music-metadata';
import { NotificationService } from '../../notification/notification.service';
import { NotificationType } from '../../notification/notification.entity';
import { SongArtist } from '../../song/song-artist.entity';



@Injectable()
export class ManageSongService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepo: Repository<Song>,

    @InjectRepository(Artist)
    private readonly artistRepo: Repository<Artist>,

    @InjectRepository(Album)
    private readonly albumRepo: Repository<Album>,

    @InjectRepository(Lyrics)
    private readonly lyricsRepo: Repository<Lyrics>,


    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    private readonly r2: R2Service,

    @InjectRepository(SongArtist)
    private readonly songArtistRepo: Repository<SongArtist>, // <-- Thêm repository này

    private readonly notificationService: NotificationService, 
  ) {}

  // =============================
  //  TẠO BÀI HÁT (UPLOAD)
  // =============================
  // async uploadSong(files: any, body: any) {
  //   try{
  //     console.log('FILES RECEIVED FROM FE:', files);
  //     console.log('BODY RECEIVED:', body);
  //     console.log("AUDIO FILE:", files?.audioFile?.[0]);
  //     console.log("IMAGE FILE:", files?.imageFile?.[0]);
  //     console.log("BODY RECEIVED:", body);

  //     const audio = files?.audioFile?.[0];
  //     // Đọc metadata từ file nhạc để lấy thời lượng
  //     const metadata = await mm.parseBuffer(audio.buffer);
  //     const detectedDuration = Math.floor(metadata.format.duration || 0);

  //     if (!detectedDuration || detectedDuration <= 0) {
  //       // fallback: ước tính duration theo bitrate hoặc bỏ qua
  //       console.warn("⚠️ Không đọc được duration từ file — fallback = 0");
  //     }

  //     console.log("⏱ Duration detected:", detectedDuration);

  //     const image = files?.imageFile?.[0];

  //     if (!audio || !image) {
  //       throw new BadRequestException('Thiếu file nhạc hoặc ảnh bìa');
  //     }

  //     // =============================
  //     //  Xử lý nghệ sĩ
  //     // =============================
  //     // Artist ID từ FE
  //     const artistId = Number(body.artist);

  //     if (!artistId) {
  //       throw new BadRequestException("Artist ID không hợp lệ");
  //     }

  //     // Tìm artist theo ID
  //     const artist = await this.artistRepo.findOne({
  //       where: { id: artistId },
  //     }) as Artist;


  //     if (!artist) {
  //       throw new NotFoundException("Artist không tồn tại");
  //     }

  //     //  Fix 
  //     if (!artist.user_id) {
  //       console.warn("⚠ Nghệ sĩ không có user_id — bỏ qua gửi thông báo cho nghệ sĩ.");
  //     }



  //     // =============================
  //     //  Xử lý album (optional)
  //     // =============================
  //     let album: Album | null = null;

  //     if (body.album && body.album !== "") {
  //       const albumId = Number(body.album);

  //       if (isNaN(albumId)) {
  //         throw new BadRequestException("Album ID không hợp lệ");
  //       }

  //       album = await this.albumRepo.findOne({
  //         where: { id: albumId },
  //       });

  //       if (!album) {
  //         throw new NotFoundException("Album không tồn tại");
  //       }
  //     }


  //     // =============================
  //     //  Xử lý thể loại Category
  //     // =============================
  //     const categoryId = Number(body.category);

  //     if (!categoryId || isNaN(categoryId)) {
  //       throw new BadRequestException("Category ID không hợp lệ");
  //     }

  //     const category = await this.categoryRepo.findOne({
  //       where: { id: categoryId },
  //     });

  //     if (!category) {
  //       throw new NotFoundException("Thể loại không tồn tại");
  //     }




  //     console.log("➡️ UPLOADING AUDIO TO R2...", {
  //       filename: audio.originalname,
  //       size: audio.size,
  //       mime: audio.mimetype
  //     });

  //     // =============================
  //     //  Upload audio lên R2
  //     // =============================
  //     const audioUploaded = await this.r2.uploadFile(
  //       'music',
  //       audio.originalname,
  //       audio.buffer,
  //       audio.mimetype,
  //     );

  //     console.log("✅ AUDIO UPLOADED:", audioUploaded);


  //     // =============================
  //     //  UPLOAD IMAGE TO R2
  //     // =============================
  //     console.log("➡️ UPLOADING IMAGE TO R2...", {
  //       filename: image.originalname,
  //       size: image.size,
  //       mime: image.mimetype
  //     });

  //     // =============================
  //     //  Upload ảnh lên R2
  //     // =============================
  //     const imageUploaded = await this.r2.uploadFile(
  //       'covers',
  //       image.originalname,
  //       image.buffer,
  //       image.mimetype,
  //     );

  //     console.log("✅ IMAGE UPLOADED:", imageUploaded);
  //     // =============================
  //     //  Lưu vào DB
  //     // =============================
  //     const song = this.songRepo.create({
  //       title: body.title,
  //       duration: detectedDuration,
  //       file_url: audioUploaded.url,
  //       image_url: imageUploaded.url,
  //       status: 'APPROVED',
  //       active: true,
  //       artist,
  //       album: album ?? null,
  //       genre: category.name, // ⭐ LƯU TÊN THỂ LOẠI VÀO CỘT genre
  //     });


  //     // Lưu vào DB trước
  //     const savedSong = await this.songRepo.save(song);

  //     // =============================
  //     //  GỬI THÔNG BÁO CHO NGHỆ SĨ (NẾU NGHỆ SĨ CÓ USER ID)
  //     // =============================
  //     if (artist.user_id) {
  //       await this.notificationService.createNotificationForUser(
  //         artist.user_id,
  //         artist.id,
  //         NotificationType.SONG_APPROVED,
  //         `Admin đã thêm bài hát "${savedSong.title}" vào hồ sơ nghệ sĩ của bạn.`,
  //         savedSong.id
  //       );
  //     } else {
  //       console.log("⚠ Nghệ sĩ không có user_id → Bỏ qua gửi thông báo.");
  //     }



  //     // =============================
  //     // LƯU LYRICS nếu FE gửi
  //     // =============================
  //     if (body.lyrics && body.lyrics.trim() !== "") {
  //       const lyricsRecord = this.lyricsRepo.create({
  //         song: savedSong,               // relation 1-1
  //         song_id: savedSong.id,         // foreign key
  //         lyrics: body.lyrics.trim(),
  //         language: body.lyricsLanguage || "vi",
  //       });

  //       await this.lyricsRepo.save(lyricsRecord);
  //     }

  //     return savedSong;
  //   } catch (err) {
  //     console.error("❌ LỖI UPLOAD:", err);
  //     throw err;
  // }
  // }

  async uploadSong(files: any, body: any) {
  try {
    const audio = files?.audioFile?.[0];
    const image = files?.imageFile?.[0];

    if (!audio || !image) {
      throw new BadRequestException('Thiếu file nhạc hoặc ảnh bìa');
    }

    // Đọc metadata để lấy duration
    const metadata = await mm.parseBuffer(audio.buffer);
    const detectedDuration = Math.floor(metadata.format.duration || 0);
    if (!detectedDuration || detectedDuration <= 0) {
      console.warn("⚠️ Không đọc được duration từ file — fallback = 0");
    }

    // =============================
    // Xử lý nghệ sĩ (primary artist)
    // =============================
    const artistId = Number(body.artist);
    if (!artistId) throw new BadRequestException("Artist ID không hợp lệ");

    const artist = await this.artistRepo.findOne({ where: { id: artistId } });
    if (!artist) throw new NotFoundException("Artist không tồn tại");

    // =============================
    // Xử lý album (optional)
    // =============================
    let album: Album | null = null;
    if (body.album && body.album !== "") {
      const albumId = Number(body.album);
      if (isNaN(albumId)) throw new BadRequestException("Album ID không hợp lệ");

      album = await this.albumRepo.findOne({ where: { id: albumId } });
      if (!album) throw new NotFoundException("Album không tồn tại");
    }

    // =============================
    // Xử lý thể loại Category
    // =============================
    const categoryId = Number(body.category);
    if (!categoryId || isNaN(categoryId)) throw new BadRequestException("Category ID không hợp lệ");

    const category = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException("Thể loại không tồn tại");

    // =============================
    // Upload audio & image lên R2
    // =============================
    const audioUploaded = await this.r2.uploadFile('music', audio.originalname, audio.buffer, audio.mimetype);
    const imageUploaded = await this.r2.uploadFile('covers', image.originalname, image.buffer, image.mimetype);

    // =============================
    // Tạo song mới (không gán artist trực tiếp)
    // =============================
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

    // =============================
    // Tạo quan hệ songArtist (primary)
    // =============================
    await this.songArtistRepo.save({
      song: savedSong,
      artist,
      is_primary: true
    });

    // =============================
    // Gửi thông báo cho nghệ sĩ nếu có user_id
    // =============================
    if (artist.user_id) {
      await this.notificationService.createNotificationForUser(
        artist.user_id,
        artist.id,
        NotificationType.SONG_APPROVED,
        `Admin đã thêm bài hát "${savedSong.title}" vào hồ sơ nghệ sĩ của bạn.`,
        savedSong.id
      );
    }

    // =============================
    // Lưu lyrics nếu FE gửi
    // =============================
    if (body.lyrics && body.lyrics.trim() !== "") {
      const lyricsRecord = this.lyricsRepo.create({
        song: savedSong,
        song_id: savedSong.id,
        lyrics: body.lyrics.trim(),
        language: body.lyricsLanguage || "vi",
      });
      await this.lyricsRepo.save(lyricsRecord);
    }

    return savedSong;
  } catch (err) {
    console.error("❌ LỖI UPLOAD:", err);
    throw err;
  }
}


  // ==============================================
  //  LIST
  // ==============================================
  async getAllSongsForAdmin() {
    return this.songRepo.find({
      relations: [
        "songArtists",
        "songArtists.artist",
        "album",
        "lyrics",
      ],
      order: { id: "DESC" }
    });
  }

  // ==============================================
  //  DETAIL
  // ==============================================
  async getSongDetail(id: number) {
    const song = await this.songRepo.findOne({
      where: { id },
      relations: [
        "songArtists",
        "songArtists.artist",
        "album",
        "lyrics",
      ]
    });

    if (!song) throw new NotFoundException("Không tìm thấy bài hát");
    return song;
  }


  // ==============================================
  //  UPDATE
  // ==============================================
//   async updateSong(
//     id: number,
//     body: UpdateSongDto,
//     files?: { imageFile?: Express.Multer.File[]; audioFile?: Express.Multer.File[] },
//   ) {
//     const song = await this.songRepo.findOne({
//       where: { id },
//       relations: ['artist', 'album', 'lyrics'],
//     });
//     if (!song) throw new NotFoundException('Không tìm thấy bài hát');

//     if (body.title) song.title = body.title.trim();
//     // =============================
//     //  Update thể loại (category)
//     // =============================
//     if (body.category) {
//       const categoryId = Number(body.category);

//       const category = await this.categoryRepo.findOne({
//         where: { id: categoryId },
//       });

//       if (!category) {
//         throw new NotFoundException("Thể loại không tồn tại");
//       }

//       song.genre = category.name;   // ✅ GÁN TÊN CATEGORY VÀO CỘT genre
//     }


//     //  UPDATE NGHỆ SĨ (NHẬN ID)
//     if (body.artist) {
//       const artistId = Number(body.artist);

//       if (isNaN(artistId)) throw new BadRequestException("Artist ID không hợp lệ");

//       const artist = await this.artistRepo.findOne({ where: { id: artistId } });
//       if (!artist) throw new NotFoundException("Artist không tồn tại");

//       song.artist = artist;
//     }

//     //  UPDATE ALBUM (NHẬN ID hoặc null)
//     if (body.album !== undefined) {
//       if (body.album === "" || body.album === null) {
//         song.album = null;
//       } else {
//         const albumId = Number(body.album);

//         if (isNaN(albumId)) throw new BadRequestException("Album ID không hợp lệ");

//         const album = await this.albumRepo.findOne({ where: { id: albumId } });
//         if (!album) throw new NotFoundException("Album không tồn tại");

//         song.album = album;
//       }
//     }

//     // 🎵 UPDATE LYRICS (nếu FE gửi lên)
//     if (body.lyrics !== undefined) {
//       const normalizedLyrics = body.lyrics.trim();

//       if (song.lyrics) {
//         song.lyrics.lyrics = normalizedLyrics;
//         song.lyrics.language = body.lyricsLanguage || "vi";
//         await this.lyricsRepo.save(song.lyrics);
//       } else if (normalizedLyrics !== "") {
//         const newLyrics = this.lyricsRepo.create({
//           song: song,
//           song_id: song.id,
//           lyrics: normalizedLyrics,
//           language: body.lyricsLanguage || "vi",
//         });

//         await this.lyricsRepo.save(newLyrics);
//         song.lyrics = newLyrics;
//       }
//     }




//     // ảnh mới
//     const newImage = files?.imageFile?.[0];
//     if (newImage) {
//       if (song.image_url) await this.r2.deleteFileByUrl(song.image_url);

//       const uploaded = await this.r2.uploadFile(
//         'covers',
//         newImage.originalname,
//         newImage.buffer,
//         newImage.mimetype,
//       );
//       song.image_url = uploaded.url;
//     }

//     // audio mới
//   const newAudio = files?.audioFile?.[0];
//   if (newAudio) {

//     // Xóa file cũ nếu có
//     if (song.file_url) {
//       await this.r2.deleteFileByUrl(song.file_url);
//     }

//     // Đọc lại thời lượng mới
//     const meta = await mm.parseBuffer(newAudio.buffer);
//     song.duration = Math.floor(meta.format.duration ?? 0);

//     // Upload file nhạc mới lên R2
//     const uploaded = await this.r2.uploadFile(
//       'music',
//       newAudio.originalname,
//       newAudio.buffer,
//       newAudio.mimetype,
//     );

//   song.file_url = uploaded.url;
// }


//     return this.songRepo.save(song);
//   }
async updateSong(
  id: number,
  body: UpdateSongDto,
  files?: { imageFile?: Express.Multer.File[]; audioFile?: Express.Multer.File[] },
) {
  const song = await this.songRepo.findOne({
    where: { id },
    relations: ['album', 'lyrics', 'songArtists', 'songArtists.artist'],
  });
  if (!song) throw new NotFoundException('Không tìm thấy bài hát');

  if (body.title) song.title = body.title.trim();

  // =============================
  //  Update thể loại (category)
  // =============================
  if (body.category) {
    const categoryId = Number(body.category);

    const category = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException("Thể loại không tồn tại");

    song.genre = category.name;
  }

  // =============================
  //  UPDATE NGHỆ SĨ CHÍNH (nhiều-nhiều qua songArtists)
  // =============================
  if (body.artist) {
    const artistId = Number(body.artist);
    if (isNaN(artistId)) throw new BadRequestException("Artist ID không hợp lệ");

    const artist = await this.artistRepo.findOne({ where: { id: artistId } });
    if (!artist) throw new NotFoundException("Artist không tồn tại");

    // XÓA TẤT CẢ quan hệ cũ trong song_artist
    await this.songArtistRepo.delete({ song: { id } });

    // TẠO QUAN HỆ MỚI
    const songArtist = this.songArtistRepo.create({
      song: song,
      artist: artist,
      is_primary: true
    });

    await this.songArtistRepo.save(songArtist);
  }


  // =============================
  //  UPDATE ALBUM
  // =============================
  if (body.album !== undefined) {
    if (body.album === "" || body.album === null) {
      song.album = null;
    } else {
      const albumId = Number(body.album);
      if (isNaN(albumId)) throw new BadRequestException("Album ID không hợp lệ");

      const album = await this.albumRepo.findOne({ where: { id: albumId } });
      if (!album) throw new NotFoundException("Album không tồn tại");

      song.album = album;
    }
  }

  // =============================
  //  UPDATE LYRICS
  // =============================
  if (body.lyrics !== undefined) {
    const normalizedLyrics = body.lyrics.trim();

    if (song.lyrics) {
      song.lyrics.lyrics = normalizedLyrics;
      song.lyrics.language = body.lyricsLanguage || "vi";
      await this.lyricsRepo.save(song.lyrics);
    } else if (normalizedLyrics !== "") {
      const newLyrics = this.lyricsRepo.create({
        song: song,
        song_id: song.id,
        lyrics: normalizedLyrics,
        language: body.lyricsLanguage || "vi",
      });
      await this.lyricsRepo.save(newLyrics);
      song.lyrics = newLyrics;
    }
  }

  // =============================
  //  UPDATE IMAGE
  // =============================
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

  // =============================
  //  UPDATE AUDIO
  // =============================
  const newAudio = files?.audioFile?.[0];
  if (newAudio) {
    if (song.file_url) await this.r2.deleteFileByUrl(song.file_url);

    const meta = await mm.parseBuffer(newAudio.buffer);
    song.duration = Math.floor(meta.format.duration ?? 0);

    const uploaded = await this.r2.uploadFile(
      'music',
      newAudio.originalname,
      newAudio.buffer,
      newAudio.mimetype,
    );
    song.file_url = uploaded.url;
  }

  return this.songRepo.save(song);
}

  // =============================
  //  Lấy album theo nghệ sĩ
  // =============================
  async getAlbumsByArtist(artistId: number) {
    const artist = await this.artistRepo.findOne({ where: { id: artistId } });
    if (!artist) {
      throw new NotFoundException("Artist không tồn tại");
    }

    return this.albumRepo.find({
      where: { artist: { id: artistId } },
      order: { title: 'ASC' },
    });
  }


  // ==============================================
  //  ACTIVE / INACTIVE
  // ==============================================
  // ==============================================
//  HIDDEN / APPROVED (active luôn = 1)
// ==============================================
  async toggleActive(id: number) {
    const song = await this.songRepo.findOne({ where: { id } });
    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    // Nếu đang APPROVED → chuyển sang HIDDEN (ẩn)
    if (song.status === 'APPROVED') {
      song.status = 'HIDDEN';
      song.active = true;   // theo yêu cầu mới
    }
    // Nếu đang HIDDEN → chuyển lại APPROVED (hiện)
    else if (song.status === 'HIDDEN') {
      song.status = 'APPROVED';
      song.active = true;   // vẫn = 1
    }

    // Các trạng thái khác (PENDING, REJECTED, DELETED) tạm thời không động vào
    return this.songRepo.save(song);
  }


  // ==============================================
  //  APPROVE
  // ==============================================
  // async approveSong(id: number) {
  //   const song = await this.songRepo.findOne({
  //     where: { id },
  //     relations: ['artist'],
  //   });

  //   if (!song) throw new NotFoundException('Không tìm thấy bài hát');

  //   song.status = 'APPROVED';
  //   song.active = true;

  //   const saved = await this.songRepo.save(song);

  //   const artist = song.artist;

  //   // =============================
  //   // 1. Gửi THÔNG BÁO CHO NGHỆ SĨ
  //   // =============================
  //   if (artist.user_id) {
  //     await this.notificationService.createNotificationForUser(
  //       artist.user_id,
  //       artist.id,
  //       NotificationType.SONG_APPROVED,
  //       `Bài hát "${song.title}" của bạn đã được phê duyệt.`,
  //       song.id
  //     );
  //   }

  //   // =============================
  //   // 2. Gửi thông báo CHO NGƯỜI FOLLOW
  //   // =============================
  //   await this.notificationService.createNotificationForFollowers(
  //     artist.id,
  //     artist.stage_name,
  //     NotificationType.NEW_SONG,
  //     `vừa phát hành bài hát mới: "${song.title}"`,
  //     song.id
  //   );

  //   return saved;
  // }

async approveSong(id: number) {
  const song = await this.songRepo.findOne({
    where: { id },
    relations: ['songArtists', 'songArtists.artist'], // load songArtists + artist
  });

  if (!song) throw new NotFoundException('Không tìm thấy bài hát');

  song.status = 'APPROVED';
  song.active = true;

  const saved = await this.songRepo.save(song);

  // Lấy nghệ sĩ chính (giả sử chỉ có 1 artist trong songArtists)
  const artist = song.songArtists[0]?.artist;
  if (!artist) return saved; // nếu không có artist, trả về luôn

  // =============================
  // 1. Gửi THÔNG BÁO CHO NGHỆ SĨ
  // =============================
  if (artist.user_id) {
    await this.notificationService.createNotificationForUser(
      artist.user_id,
      artist.id,
      NotificationType.SONG_APPROVED,
      `Bài hát "${song.title}" của bạn đã được phê duyệt.`,
      song.id
    );
  }

  // =============================
  // 2. Gửi thông báo CHO NGƯỜI FOLLOW
  // =============================
  await this.notificationService.createNotificationForFollowers(
    artist.id,
    artist.stage_name,
    NotificationType.NEW_SONG,
    `vừa phát hành bài hát mới: "${song.title}"`,
    song.id
  );

  return saved;
}

  // // ==============================================
  // // REJECT SONG
  // // ==============================================
  // async rejectSong(id: number) {
  //   const song = await this.songRepo.findOne({
  //     where: { id },
  //     relations: ['artist']
  //   });

  //   if (!song) throw new NotFoundException('Không tìm thấy bài hát');

  //   song.status = 'REJECTED';
  //   song.active = false;

  //   const saved = await this.songRepo.save(song);

  //   // 🔔 Gửi thông báo cho nghệ sĩ
  //   const artist = song.artist;
  //   if (artist?.user_id) {
  //     await this.notificationService.createNotificationForUser(
  //       artist.user_id,
  //       artist.id,
  //       NotificationType.SONG_APPROVED, // Hoặc bạn nên tạo type SONG_REJECTED
  //       `Bài hát "${song.title}" đã bị từ chối bởi quản trị viên.`,
  //       song.id
  //     );
  //   }

  //   return saved;
  // }

  async rejectSong(id: number) {
  const song = await this.songRepo.findOne({
    where: { id },
    relations: ['artist'], // quan hệ artist đã phải khai báo trong Song entity
  });

  if (!song) throw new NotFoundException('Không tìm thấy bài hát');

  song.status = 'REJECTED';
  song.active = false;

  const saved = await this.songRepo.save(song);

  const artist = song.songArtists?.[0]?.artist;

  // 🔔 Gửi thông báo cho nghệ sĩ nếu có user_id
  if (artist?.user_id) {
    await this.notificationService.createNotificationForUser(
      artist.user_id,
      artist.id,
      NotificationType.SONG_REJECTED, // ✅ loại thông báo đúng
      `Bài hát "${song.title}" đã bị từ chối bởi quản trị viên.`,
      song.id
    );
  }

  return saved;
}


  // ==============================================
  //  SOFT DELETE: active = 0, status = APPROVED
  // ==============================================
  async softDeleteSong(id: number) {
    const song = await this.songRepo.findOne({ where: { id } });
    if (!song) throw new NotFoundException("Không tìm thấy bài hát");

    song.active = false;        // xoá mềm → không còn active
    song.status = "APPROVED";   // theo yêu cầu: vẫn giữ status APPROVED

    return this.songRepo.save(song);
  }



  // ==============================================
  // DELETE
  // ==============================================
  async deleteSong(id: number) {
    const song = await this.songRepo.findOne({ where: { id } });
    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    if (song.image_url) await this.r2.deleteFileByUrl(song.image_url);
    if (song.file_url) await this.r2.deleteFileByUrl(song.file_url);

    await this.songRepo.delete(id);
    return { success: true };
  }

  async getPaginatedSongs(page: number) {
    const take = 15; // số bài mỗi trang
    const skip = (page - 1) * take;

    const [songs, total] = await this.songRepo.findAndCount({
      take,
      skip,
      order: { id: 'DESC' },
      relations: ['artist', 'album', 'lyrics']
    });

    return {
      data: songs,
      currentPage: page,
      totalPages: Math.ceil(total / take),
      totalItems: total
    };
  }

}
