// src/admin/manage-song/manage-song.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Song } from '../../song/song.entity';
import { Artist } from '../../artist/artist.entity';
import { Album } from '../../album/album.entity';

import { R2Service } from '../../shared/r2.service';

@Injectable()
export class ManageSongService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepo: Repository<Song>,

    @InjectRepository(Artist)
    private readonly artistRepo: Repository<Artist>,

    @InjectRepository(Album)
    private readonly albumRepo: Repository<Album>,

    private readonly r2: R2Service,
  ) {}

  async uploadSong(files: any, body: any) {

    console.log("FILES RECEIVED FROM FRONTEND:", files);
    console.log("BODY RECEIVED:", body);

    const audio = files.audioFile?.[0];
    const image = files.imageFile?.[0];

    if (!audio || !image) {
      throw new BadRequestException('Thiếu file nhạc hoặc ảnh bìa');
    }

    let artist = await this.artistRepo.findOne({
      where: { stage_name: body.artist },
    });

    if (!artist) {
      artist = this.artistRepo.create({ stage_name: body.artist });
      await this.artistRepo.save(artist);
    }

    let album: Album | null = null;

    // chỉ tạo album nếu người dùng nhập album
    if (body.album && body.album.trim() !== "") {
      album = await this.albumRepo.findOne({
        where: { title: body.album },
      });

      if (!album) {
        album = this.albumRepo.create({
          title: body.album,
          artist: artist,  // vẫn gán artist nếu đang dùng logic này
        });

        await this.albumRepo.save(album);
      }
    }


    // ================
    // ⬆ UPLOAD AUDIO
    // ================
    const audioUploaded = await this.r2.uploadFile(
      'music',
      audio.originalname,
      audio.buffer,
      audio.mimetype,
    );

    // ================
    // ⬆ UPLOAD COVER
    // ================
    const imageUploaded = await this.r2.uploadFile(
      'covers',
      image.originalname,
      image.buffer,
      image.mimetype,
    );

    // ============================
    // 💾 Lưu bài hát vào database
    // ============================
    const song = this.songRepo.create({
      title: body.title,
      genre: body.genre,
      duration: Number(body.duration),
      file_url: audioUploaded.url,
      image_url: imageUploaded.url,
      status: 'APPROVED',
      active: true,
      artist,
      album: album ?? null,  // <--- quan trọng
    });

    return this.songRepo.save(song);
  }
}
