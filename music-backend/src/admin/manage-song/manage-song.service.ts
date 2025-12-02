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


@Injectable()
export class ManageSongService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepo: Repository<Song>,

    @InjectRepository(Artist)
    private readonly artistRepo: Repository<Artist>,

    @InjectRepository(Album)
    private readonly albumRepo: Repository<Album>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    private readonly r2: R2Service,
  ) {}

  // =============================
  // 🟢 TẠO BÀI HÁT (UPLOAD)
  // =============================
  async uploadSong(files: any, body: any) {
    console.log('FILES RECEIVED FROM FE:', files);
    console.log('BODY RECEIVED:', body);

    const audio = files?.audioFile?.[0];
    const image = files?.imageFile?.[0];

    if (!audio || !image) {
      throw new BadRequestException('Thiếu file nhạc hoặc ảnh bìa');
    }

    // =============================
    // 🟢 Xử lý nghệ sĩ
    // =============================
    // Artist ID từ FE
    const artistId = Number(body.artist);

    if (!artistId) {
      throw new BadRequestException("Artist ID không hợp lệ");
    }

    // Tìm artist theo ID
    const artist = await this.artistRepo.findOne({
      where: { id: artistId },
    });

    if (!artist) {
      throw new NotFoundException("Artist không tồn tại");
    }


    // =============================
    // 🟢 Xử lý album (optional)
    // =============================
    let album: Album | null = null;

    if (body.album && body.album !== "") {
      const albumId = Number(body.album);

      if (isNaN(albumId)) {
        throw new BadRequestException("Album ID không hợp lệ");
      }

      album = await this.albumRepo.findOne({
        where: { id: albumId },
      });

      if (!album) {
        throw new NotFoundException("Album không tồn tại");
      }
    }

    // =============================
    // 🟢 Xử lý thể loại Category
    // =============================
    const categoryId = Number(body.category);

    if (!categoryId || isNaN(categoryId)) {
      throw new BadRequestException("Category ID không hợp lệ");
    }

    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException("Thể loại không tồn tại");
    }



    // =============================
    // 🟢 Upload audio lên R2
    // =============================
    const audioUploaded = await this.r2.uploadFile(
      'music',
      audio.originalname,
      audio.buffer,
      audio.mimetype,
    );

    // =============================
    // 🟢 Upload ảnh lên R2
    // =============================
    const imageUploaded = await this.r2.uploadFile(
      'covers',
      image.originalname,
      image.buffer,
      image.mimetype,
    );

    // =============================
    // 🟢 Lưu vào DB
    // =============================
    const song = this.songRepo.create({
      title: body.title,
      duration: Number(body.duration),
      file_url: audioUploaded.url,
      image_url: imageUploaded.url,
      status: 'APPROVED',
      active: true,
      artist,
      album: album ?? null,
      genre: category.name, // ⭐ LƯU TÊN THỂ LOẠI VÀO CỘT genre
    });


    return await this.songRepo.save(song);
  }

  // ==============================================
  // 🟡 LIST
  // ==============================================
  async getAllSongsForAdmin() {
    return this.songRepo
      .createQueryBuilder('song')
      .leftJoinAndSelect('song.artist', 'artist')
      .leftJoinAndSelect('song.album', 'album')
      .select([
        'song.id',
        'song.title',
        'song.genre',
        'song.duration',
        'song.play_count',
        'song.image_url',
        'song.file_url',
        'song.status',
        'song.active',
        'artist.id',
        'artist.stage_name',
        'album.id',
        'album.title',

      ])
      .orderBy('song.id', 'DESC')
      .getMany();
  }

  // ==============================================
  // 🟡 DETAIL
  // ==============================================
  async getSongDetail(id: number) {
    const song = await this.songRepo.findOne({
      where: { id },
      relations: ['artist', 'album'],
    });
    if (!song) throw new NotFoundException('Không tìm thấy bài hát');
    return song;
  }

  // ==============================================
  // 🟡 UPDATE
  // ==============================================
  async updateSong(
    id: number,
    body: UpdateSongDto,
    files?: { imageFile?: Express.Multer.File[]; audioFile?: Express.Multer.File[] },
  ) {
    const song = await this.songRepo.findOne({
      where: { id },
      relations: ['artist', 'album'],
    });
    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    if (body.title) song.title = body.title.trim();
    // =============================
    // 🟢 Update thể loại (category)
    // =============================
    if (body.category) {
      const categoryId = Number(body.category);

      const category = await this.categoryRepo.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException("Thể loại không tồn tại");
      }

      song.genre = category.name;   // ✅ GÁN TÊN CATEGORY VÀO CỘT genre
    }

    if (body.duration) song.duration = Number(body.duration);

    // nghệ sĩ
    if (body.artist && body.artist.trim() !== '') {
      let artist = await this.artistRepo.findOne({
        where: { stage_name: body.artist },
      });
      if (!artist) {
        artist = this.artistRepo.create({ stage_name: body.artist });
        await this.artistRepo.save(artist);
      }
      song.artist = artist;
    }

    // album
    if (body.album !== undefined) {
      const albumName = body.album.trim();
      if (albumName === '') {
        song.album = null;
      } else {
        let album = await this.albumRepo.findOne({
          where: { title: albumName },
        });
        if (!album) {
          album = this.albumRepo.create({
            title: albumName,
            artist: song.artist,
          });
          await this.albumRepo.save(album);
        }
        song.album = album;
      }
    }

    // ảnh mới
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

    // audio mới
    const newAudio = files?.audioFile?.[0];
    if (newAudio) {
      if (song.file_url) await this.r2.deleteFileByUrl(song.file_url);

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

  // ==============================================
  // 🟡 ACTIVE / INACTIVE
  // ==============================================
  async toggleActive(id: number) {
    const song = await this.songRepo.findOne({ where: { id } });
    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    song.active = !song.active;
    return this.songRepo.save(song);
  }

  // ==============================================
  // 🟡 APPROVE
  // ==============================================
  async approveSong(id: number) {
    const song = await this.songRepo.findOne({ where: { id } });
    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    song.status = 'APPROVED';
    song.active = true;
    return this.songRepo.save(song);
  }

  // ==============================================
  // 🟡 DELETE
  // ==============================================
  async deleteSong(id: number) {
    const song = await this.songRepo.findOne({ where: { id } });
    if (!song) throw new NotFoundException('Không tìm thấy bài hát');

    if (song.image_url) await this.r2.deleteFileByUrl(song.image_url);
    if (song.file_url) await this.r2.deleteFileByUrl(song.file_url);

    await this.songRepo.delete(id);
    return { success: true };
  }
}
