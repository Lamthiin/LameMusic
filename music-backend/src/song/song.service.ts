// music-backend/src/song/song.service.ts (BẢN SỬA LỖI FINAL)
import { 
    Injectable, NotFoundException, 
    UnauthorizedException, BadRequestException,
    ConflictException, InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, DeepPartial } from 'typeorm';
import { Song } from './song.entity';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { Artist } from '../artist/artist.entity';
import { Album } from '../album/album.entity';
// (XÓA: import { Category })
import { User } from '../user/user.entity'; 
import { JwtPayload } from '../auth/jwt.strategy'; 
import { Lyrics } from '../lyrics/lyrics.entity';
import { parseFile } from 'music-metadata'; // <-- (1) IMPORT MỚI
import { statSync } from 'fs'; // Cần để kiểm tra file
import { extname, join } from 'path';
import { Equal } from 'typeorm';
import { IsNull, In } from 'typeorm';
import { AiService } from '../ai/ai.service'; // <-- CẦN IMPORT
import { HistoryService } from '../history/history.service'; // <-- IMPORT MỚI
import { R2Service } from '../shared/r2.service'; // <-- (1) IMPORT R2 SERVICE
import { SharedModule } from '../shared/shared.module'; // <-- import module chứa R2Service 
import * as musicMetadata from 'music-metadata';
import { FindOptionsWhere } from 'typeorm';
import { SongArtist } from './song-artist.entity'; 

@Injectable()
export class SongService {
  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
    @InjectRepository(Lyrics) // <-- (1) PHẢI TIÊM LYRICS REPO
    private lyricsRepository: Repository<Lyrics>,
    private aiService: AiService,
    private historyService: HistoryService, // <-- TIÊM MỚI
    private r2Service: R2Service,
    @InjectRepository(SongArtist) // <-- Thêm dòng này
    private songArtistRepository: Repository<SongArtist>,
  ) {}

  // (Hàm helper getArtistByUserId)
  private async getArtistByUserId(userId: number): Promise<Artist> {
    const artist = await this.artistRepository.findOne({ where: { user_id: userId } });
    if (!artist) {
      throw new NotFoundException('Không tìm thấy hồ sơ nghệ sĩ của bạn.');
    }
    return artist;
  }

async findAll(user: JwtPayload | null): Promise<Song[]> {
    return this.songRepository.find({
        where: { 
            active: true, 
            status: 'APPROVED'
        },
        relations: ['songArtists', 'songArtists.artist', 'album'], // nếu dùng SongArtist nhiều-nhiều
        order: { play_count: 'DESC' },
        take: 10
    });
}

  /**
   * (ARTIST) Lấy danh sách bài hát của TÔI
//    */
//   async findMySongs(userId: number, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<Song[]> {
//     const artist = await this.getArtistByUserId(userId);
    
//     // SỬ DỤNG QUERY BUILDER AN TOÀN
//     const query = this.songRepository.createQueryBuilder('song')
//         // === FIX LỖI: BẮT BUỘC LEFT JOIN ARTIST ===
//         .leftJoinAndSelect('song.artist', 'artist') 
//         // ============================================
//         .leftJoinAndSelect('song.album', 'album')
        
//         .where('song.artist_id = :artistId', { artistId: artist.id })
//         .andWhere('song.active = :activeStatus', { activeStatus: true })
//         .orderBy('song.created_at', 'DESC');
        
//     // Lọc theo Status (nếu có)
//     if (status) {
//         query.andWhere('song.status = :status', { status: status });
//     } else {
//         query.andWhere('song.status = :defaultStatus', { defaultStatus: 'APPROVED' });
//     }

//     return query.getMany();
//  }

//  // Hàm cần sửa (Ví dụ: Hàm kiểm tra quyền sở hữu)
// // Hàm này phải được cập nhật ở tất cả các vị trí (112, 280, 317, 357, 374)
// async checkSongOwnership(songId: number, artistId: number): Promise<Song | null> {
//     // Sử dụng Query Builder để Join SongArtist và lọc
//     return this.songRepository.createQueryBuilder('song')
//         // Join bảng trung gian và lọc theo artistId
//         .innerJoin('song.songArtists', 'sa', 'sa.artist_id = :artistId', { artistId })
//         // Lọc thêm điều kiện is_primary = true nếu chỉ muốn kiểm tra nghệ sĩ chính
//         // .andWhere('sa.is_primary = true') 
//         .where('song.id = :songId', { songId })
//         .getOne();
// }

// // Hàm lấy thông tin Artist chính (thay thế cho song.artist)
// async getPrimaryArtist(songId: number): Promise<Artist | null> {
//     const songArtist = await this.songArtistRepository.findOne({
//         where: { song_id: songId, is_primary: true },
//         relations: ['artist'],
//     });
//     return songArtist?.artist || null;
// }

 /**
   * (PUBLIC) Lấy tất cả bài hát có filter (Dùng cho Trang Artist Detail/All Songs)
   * CHỈ HIỂN THỊ CÁC BÀI ĐÃ DUYỆT (APPROVED) VÀ CÒN ACTIVE.
   * @param artistId ID Artist Profile
   */
  // async findAllWithFilters(genre?: string, artistId?: number): Promise<Song[]> {
      
  //     const whereConditions: FindOptionsWhere<Song> = {
  //         // === BẮT BUỘC ĐIỀU KIỆN CÔNG KHAI ===
  //         active: true,
  //         status: 'APPROVED', 
  //         // ===================================
  //     };
      
  //     if (genre) {
  //         whereConditions.genre = genre;
  //     } 
      
  //     if (artistId) {
  //         // Lọc theo ID hồ sơ Artist (PK của bảng Artist)
  //         whereConditions.artist = { id: artistId } as FindOptionsWhere<Artist>; 
  //     }
      
  //     const options: FindManyOptions<Song> = {
  //         where: whereConditions,
  //         relations: ['artist', 'album'],
  //         order: { created_at: 'DESC' }
  //     };

  //     return this.songRepository.find(options);
  // }
async findAllWithFilters(genre?: string, artistId?: number): Promise<Song[]> {
  const qb = this.songRepository.createQueryBuilder('song')
    .leftJoinAndSelect('song.songArtists', 'songArtist')
    .leftJoinAndSelect('songArtist.artist', 'artist')
    .leftJoinAndSelect('song.album', 'album')
    .where('song.active = :active', { active: true })
    .andWhere('song.status = :status', { status: 'APPROVED' });

  if (genre) {
    qb.andWhere('song.genre = :genre', { genre });
  }

  if (artistId) {
    qb.andWhere('artist.id = :artistId', { artistId });
  }

  qb.orderBy('song.created_at', 'DESC');

  return qb.getMany();
}

  // (Hàm findOne - Chi tiết bài hát)
  // async findOne(id: number): Promise<Song | null> {
  //     const song = await this.songRepository.findOne({
  //         where: { id: id, active: true , status: 'APPROVED'},
  //         relations: ['artist', 'album', 'lyrics'], 
  //     });
  //     if (!song) {
  //         throw new NotFoundException(`Song with ID ${id} not found`); 
  //     }
  //     return song;
  // }
  
  // // (Hàm findAllWithFilters - Trang All Songs)
  // async findAllWithFilters(genre?: string, artistId?: number): Promise<any> {
  //     const options: FindManyOptions<Song> = {
  //         where: { active: true, status: 'APPROVED' },
  //         relations: ['artist', 'album'],
  //         order: { created_at: 'DESC' }
  //     };
  //     if (genre) options.where = { ...options.where, genre: genre }; 
  //     if (artistId) options.where = { ...options.where, artist: { id: artistId } };
  //     return this.songRepository.find(options);
  // }
  
  // (Hàm findByGenre - Trang Genre Detail)
  // async findByGenre(genreName: string): Promise<Song[]> {
  //      return this.songRepository.find({
  //          where: { genre: genreName, active: true, status: 'APPROVED' },
  //          relations: ['artist', 'album']
  //      });
  // }

async findRelatedByGenre(currentSongId: number, genreName: string): Promise<Song[]> {
    if (!genreName) return [];

    return this.songRepository.createQueryBuilder('song')
        // Join SongArtist để lấy artist
        .leftJoinAndSelect('song.songArtists', 'songArtist')
        .leftJoinAndSelect('songArtist.artist', 'artist')
        .leftJoinAndSelect('song.album', 'album')
        .where('song.genre = :genreName', { genreName })
        .andWhere('song.active = :active', { active: true })
        .andWhere('song.status = :status', { status: 'APPROVED' })
        .andWhere('song.id != :currentId', { currentId: currentSongId })
        .orderBy('RAND()')
        .limit(6)
        .getMany();
}

  
  // (Hàm findLyrics - Trang Song Detail)
  /**
   * HÀM MỚI: GET /song/:id/lyrics (Lấy lời bài hát từ bảng Lyrics)
   */
  async findLyrics(id: number): Promise<{ lyrics: string }> {
    const lyrics = await this.lyricsRepository.findOne({
      where: { song_id: id } // Tìm theo khóa ngoại song_id
    });

    if (!lyrics) {
      // Trả về thông báo lỗi 404 (đã được xử lý ở controller)
      return { lyrics: "Không tìm thấy lời bài hát." }; 
    }

    return { lyrics: lyrics.lyrics};
  }


  // async deleteMySong(userId: number, songId: number): Promise<{ message: string }> {
  //   const artist = await this.getArtistByUserId(userId);
  //   const song = await this.songRepository.findOne({ 
  //     where: { id: songId, artist: { id: artist.id } },
  //     relations: ['artist']
  //   });
  //   if (!song) throw new NotFoundException('Bài hát không tồn tại hoặc bạn không có quyền xóa.');

  //   // 1. XÓA FILE TRÊN R2 (QUAN TRỌNG)
  //   // if (song.file_url) await this.r2Service.deleteFileByUrl(song.file_url);
  //   // if (song.image_url) await this.r2Service.deleteFileByUrl(song.image_url);

  //   // 2. SOFT DELETE (Đặt active = false)
  //   await this.songRepository.update(songId, { active: false });

  //   return { message: 'Bài hát đã được ẩn thành công (Soft Deleted).' };
  // }

  // === API MỚI CHO ADMIN (DUYỆT) ===
  async findPendingSongs(): Promise<Song[]> {
    return this.songRepository.find({
        where: { status: 'PENDING' },
        relations: ['artist', 'album'], 
        order: { created_at: 'ASC' }
    });
  }
  
  async updateSongStatus(songId: number, status: 'APPROVED' | 'REJECTED'): Promise<Song> {
    const song = await this.songRepository.findOne({ where: { id: songId } });
    if (!song) throw new NotFoundException('Bài hát không tồn tại.');
    
    song.status = status;
    return this.songRepository.save(song);
  }

    async findMySingles(userId: number): Promise<Song[]> {
        return this.songRepository.createQueryBuilder('song')
            .leftJoin('song.songArtists', 'songArtist')
            .where('songArtist.artist_id = :artistId', { artistId: userId })
            .andWhere('song.album_id IS NULL')
            .andWhere('song.active = true')
            .andWhere('song.status = :status', { status: 'APPROVED' })
            .select(['song.id', 'song.title', 'song.duration', 'song.image_url'])
            .getMany();
    }

async addSongToAlbum(userId: number, songId: number, albumId: number): Promise<Song> {
  const artist = await this.getArtistByUserId(userId);

  // 1. Kiểm tra bài hát có tồn tại và thuộc về Artist này
  const song = await this.songRepository.createQueryBuilder('song')
    .leftJoin('song.songArtists', 'songArtist')
    .leftJoinAndSelect('song.album', 'album')
    .where('song.id = :songId', { songId })
    .andWhere('songArtist.artistId = :artistId', { artistId: artist.id })
    .getOne();

  if (!song) {
    throw new NotFoundException('Bài hát không tồn tại hoặc không thuộc về bạn.');
  }
  if (song.album) {
    throw new BadRequestException('Bài hát này đã thuộc Album khác.');
  }

  // 2. Kiểm tra Album có tồn tại và thuộc về Artist này
  const album = await this.albumRepository.createQueryBuilder('album')
    .leftJoin('album.albumArtists', 'albumArtist') // nếu Album cũng là nhiều-nhiều
    .where('album.id = :albumId', { albumId })
    .andWhere('albumArtist.artistId = :artistId', { artistId: artist.id })
    .getOne();

  if (!album) {
    throw new NotFoundException('Album không tồn tại.');
  }

  // 3. Cập nhật album_id cho bài hát
  song.album = album;

  return this.songRepository.save(song);
}
    /**
     * HÀM MỚI: Tăng lượt nghe (play_count) cho một bài hát
     */
    async incrementPlayCount(songId: number): Promise<void> {
        // Sử dụng Query Builder để tăng giá trị trực tiếp (nhanh hơn findOne + save)
        await this.songRepository.createQueryBuilder()
            .update(Song)
            .set({ play_count: () => 'play_count + 1' }) // <-- Tăng 1
            .where('id = :id', { id: songId })
            .execute();
    }

  /**
   * MAINTENANCE: Lấy tất cả bài hát đã APPROVED và thiếu Embedding
   */
  async findAllApprovedSongsWithMissingEmbedding(): Promise<Song[]> {
    return this.songRepository.find({
      where: {
        status: 'APPROVED',
        active: true,
        embedding: IsNull(), // <-- Tìm những bài có cột embedding là NULL
      },
      select: ['id', 'title', 'genre'], // Chỉ cần các trường này cho AI Service
    });
  }

  /**
   * MAINTENANCE: Cập nhật Embedding sau khi nhận được từ AI Service
   */
  async updateSongEmbedding(songId: number, embedding: number[]): Promise<void> {
    await this.songRepository.update(
        { id: songId },
        { embedding: embedding }
    );
  }

  async getPublicSongs() {
    return this.songRepository.find({
      where: { active: true, status: 'APPROVED' }, // Chỉ bài public & đã duyệt
      relations: ['songArtists', 'songArtists.artist', 'album'], 
      order: { id: 'DESC' },
    });
  }


  async recommendSong(userId: number): Promise<Song> {
    const historyEntries = await this.historyService.getUserListenHistory(userId, 100);
    const vectorSize = 128; // chiều vector embedding

    // Lấy các embedding hợp lệ từ lịch sử
    const validEmbeddings = historyEntries
        .map(entry => entry.song.embedding as number[] | null)
        .filter((emb): emb is number[] => emb !== null && emb.length === vectorSize);

    // Nếu không có lịch sử hợp lệ, trả về bài fallback
    if (validEmbeddings.length === 0) {
        return this.getFallbackSong();
    }

    // Tính vector trung bình của user
    const userVector = new Array(vectorSize).fill(0);
    for (const embedding of validEmbeddings) {
        for (let i = 0; i < vectorSize; i++) {
            userVector[i] += embedding[i];
        }
    }
    const userPreferenceVector = userVector.map(sum => sum / validEmbeddings.length);

    // Lấy tất cả bài hát APPROVED
    const allApprovedSongs = await this.songRepository.find({
        where: { status: 'APPROVED', active: true },
         relations: ['songArtists', 'songArtists.artist', 'album'],
        take: 500, // lấy 500 bài gần nhất
    });

    // Tìm bài hát có similarity cao nhất, bỏ qua bài đã nghe gần đây
    let bestMatch: Song | null = null;
    let highestSimilarity = -1;

    for (const song of allApprovedSongs) {
        const embedding = song.embedding as number[] | null;
        if (!embedding || embedding.length !== vectorSize) continue;

        const isRecentlyListened = historyEntries.some(h => h.song.id === song.id);
        if (isRecentlyListened) continue;

        const similarity = this.calculateCosineSimilarity(userPreferenceVector, embedding);
        if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            bestMatch = song;
        }
    }

    // Nếu tìm được bài phù hợp với threshold (ví dụ 0.1), trả về
    if (bestMatch && highestSimilarity > 0.1) {
        console.log(`[RECOMMEND AI] Trả về bài tương đồng nhất (${bestMatch.title}, similarity: ${highestSimilarity.toFixed(2)})`);
        return bestMatch;
    }

    // Fallback nếu không tìm được bài phù hợp
    return this.getFallbackSong();
}



/**
 * Hàm fallback: Trả về 1 bài phổ biến ngẫu nhiên từ top 10
 */
private async getFallbackSong(): Promise<Song> {
    const topSongs = await this.songRepository.find({
        where: { status: 'APPROVED', active: true },
        relations: ['songArtists', 'songArtists.artist', 'album'],
        order: { play_count: 'DESC' },
        take: 10,
    });

    if (topSongs.length === 0) {
        throw new NotFoundException("Không tìm thấy bài hát đề xuất.");
    }

    const randomIndex = Math.floor(Math.random() * topSongs.length);
    console.log(`[RECOMMEND FALLBACK] Trả về bài phổ biến: ${topSongs[randomIndex].title}`);
    return topSongs[randomIndex];
}


/**
 * Cosine similarity helper
 */
private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    return (magA && magB) ? dot / (magA * magB) : 0;
}

  // private async getArtistByUserId(userId: number): Promise<Artist> {
  //   const artist = await this.artistRepository.findOne({ where: { user_id: userId } });
  //   if (!artist) throw new NotFoundException('Không tìm thấy hồ sơ nghệ sĩ của bạn.');
  //   return artist;
  // }

  // ==========================================================
  // =============== CREATE SONG =============================
  // ==========================================================
async createSong(
  userId: number,
  dto: any,
  files: { audioFile?: Express.Multer.File[], imageFile?: Express.Multer.File[] }
): Promise<Song> {
  if (!files?.audioFile?.[0]) throw new BadRequestException('File nhạc là bắt buộc.');

  const artist = await this.getArtistByUserId(userId);
  const audioFile = files.audioFile[0];
  const imageFile = files.imageFile?.[0];

  let album: Album | null = null;
  if (dto.albumId) {
    album = await this.albumRepository.findOne({ where: { id: +dto.albumId } });
    if (!album) throw new NotFoundException('Album không tồn tại.');
  }

  const audioUpload = await this.r2Service.uploadFile('music', audioFile.originalname, audioFile.buffer, audioFile.mimetype);
  let imageUrl: string | null = null;
  if (imageFile) {
    const imageUpload = await this.r2Service.uploadFile('covers', imageFile.originalname, imageFile.buffer, imageFile.mimetype);
    imageUrl = imageUpload.url;
  }

  let duration = 0;
  try {
    const metadata = await musicMetadata.parseBuffer(audioFile.buffer, audioFile.mimetype);
    duration = metadata.format.duration ? Math.floor(metadata.format.duration) : 0;
  } catch {}

  const embeddingVector = await this.aiService.generateSongEmbedding(dto.title, dto.genre);

  const newSong = this.songRepository.create({
    title: dto.title,
    file_url: audioUpload.url,
    image_url: imageUrl,
    duration,
    track_number: dto.track_number ? Number(dto.track_number) : null,
    active: true,
    status: 'PENDING',
    genre: dto.genre,
    album,
    embedding: embeddingVector,
  });

  const savedSong = await this.songRepository.save(newSong); // <-- TS biết đây là Song, không phải Song[]

  // === Lyrics 1-1 ===
  if (dto.lyricsContent?.trim()) {
    const lyricsEntity = this.lyricsRepository.create({
      lyrics: dto.lyricsContent.trim(),
      language: dto.language || 'vi',
      song: savedSong, // gán relation đúng kiểu
    });
    await this.lyricsRepository.save(lyricsEntity);
  }

  // === Nghệ sĩ chính ===
  await this.songArtistRepository.save({ song: savedSong, artist, is_primary: true });

  // === Nghệ sĩ phụ ===
  if (dto.featuredArtistIds?.length) {
    for (const id of dto.featuredArtistIds) {
      if (id !== artist.id) {
        const featArtist = await this.artistRepository.findOne({ where: { id } });
        if (featArtist) {
          await this.songArtistRepository.save({ song: savedSong, artist: featArtist, is_primary: false });
        }
      }
    }
  }

  return savedSong;
}


  // ==========================================================
  // =============== UPDATE SONG =============================
  // ==========================================================
  // async updateMySong(userId: number, songId: number, dto: any, imageFile?: Express.Multer.File) {
  //   const artist = await this.getArtistByUserId(userId);

  //   const song = await this.songRepository.createQueryBuilder('song')
  //     .innerJoin('song.songArtists', 'sa', 'sa.artist_id = :artistId', { artistId: artist.id })
  //     .where('song.id = :songId', { songId })
  //     .leftJoinAndSelect('song.album', 'album')
  //     .getOne();

  //   if (!song) throw new NotFoundException('Bài hát không tồn tại hoặc bạn không có quyền sửa.');

  //   song.title = dto.title || song.title;
  //   song.track_number = dto.track_number ? parseInt(dto.track_number) : song.track_number;
  //   if (dto.genre) song.genre = dto.genre;

  //   // Album
  //   if (dto.albumId !== undefined) {
  //     if (dto.albumId === '') song.album = null;
  //     else {
  //       const album = await this.albumRepository.findOne({ where: { id: parseInt(dto.albumId) } });
  //       if (!album) throw new NotFoundException('Album không tồn tại.');
  //       song.album = album;
  //     }
  //   }

  //   // Ảnh
  //   if (imageFile) {
  //     if (song.image_url) await this.r2Service.deleteFileByUrl(song.image_url);
  //     const imageUpload = await this.r2Service.uploadFile('covers', imageFile.originalname, imageFile.buffer, imageFile.mimetype);
  //     song.image_url = imageUpload.url;
  //   }

  //   if (song.status === 'APPROVED' || song.status === 'REJECTED') song.status = 'PENDING';

  //   return this.songRepository.save(song);
//   // }
// async updateMySong(userId: number, songId: number, dto: any, imageFile?: Express.Multer.File) {
//     const artist = await this.getArtistByUserId(userId);

//     // 1. Kiểm tra quyền sở hữu và load Song
//     const song = await this.songRepository.createQueryBuilder('song')
//       .innerJoin('song.songArtists', 'sa', 'sa.artist_id = :artistId', { artistId: artist.id })
//       .where('song.id = :songId', { songId })
//       .leftJoinAndSelect('song.album', 'album')
//       .getOne();

//     if (!song) throw new NotFoundException('Bài hát không tồn tại hoặc bạn không có quyền sửa.');

//     // Cập nhật các trường cơ bản
//     song.title = dto.title || song.title;
//     song.track_number = dto.track_number ? parseInt(dto.track_number) : song.track_number;
//     if (dto.genre) song.genre = dto.genre;

//     // Album
//     if (dto.albumId !== undefined) {
//       if (dto.albumId === '') song.album = null;
//       else {
//         const album = await this.albumRepository.findOne({ where: { id: parseInt(dto.albumId) } });
//         if (!album) throw new NotFoundException('Album không tồn tại.');
//         song.album = album;
//       }
//     }

//     // Ảnh
//     if (imageFile) {
//       if (song.image_url) await this.r2Service.deleteFileByUrl(song.image_url);
//       const imageUpload = await this.r2Service.uploadFile('covers', imageFile.originalname, imageFile.buffer, imageFile.mimetype);
//       song.image_url = imageUpload.url;
//     }
    
//     // === 2. XỬ LÝ VÀ CẬP NHẬT COLLAB ARTISTS (FIX MỚI) ===
    
//     let featuredArtistIds: number[] = [];
//     if (dto.artistIds) { // Kiểm tra nếu Frontend gửi dữ liệu nghệ sĩ mới
//       try {
//         const allIds = JSON.parse(dto.artistIds).map(id => +id);
//         featuredArtistIds = allIds.filter(id => id !== artist.id); // Lọc ID chính
//       } catch (e) {
//         console.error("Lỗi parse artistIds:", e);
//         throw new BadRequestException('Dữ liệu nghệ sĩ cộng tác không hợp lệ.');
//       }
//     }

//     // 2a. Xóa tất cả nghệ sĩ phụ hiện tại của bài hát này
//     await this.songArtistRepository.delete({ song_id: songId, is_primary: false });

//     // 2b. Tạo lại các bản ghi Collab mới
//     if (featuredArtistIds.length > 0) {
//         const collabArtists = await this.artistRepository.findBy({ id: In(featuredArtistIds) });
//         
//         const collabRecords = collabArtists.map(featArtist => ({
//             song_id: songId,
//             artist: featArtist, // Dùng Entity
//             is_primary: false,
//         }));

//         await this.songArtistRepository.save(collabRecords);
//     }
//     // ========================================================
    
//     // Cập nhật trạng thái duyệt
//     if (song.status === 'APPROVED' || song.status === 'REJECTED') song.status = 'PENDING';

//     return this.songRepository.save(song);
// }

// ==========================================================
// =============== 1. TẠO BÀI HÁT (CREATE SONG) =============
// ==========================================================
// async createSong(
//   userId: number,
//   dto: any, // Chứa title, genre, albumId, artistIds (JSON string)
//   files: { audioFile?: Express.Multer.File[], imageFile?: Express.Multer.File[] }
// ): Promise<Song> {
//     if (!files?.audioFile?.[0]) throw new BadRequestException('File nhạc là bắt buộc.');

//     const artist = await this.getArtistByUserId(userId); // Nghệ sĩ chính
//     const audioFile = files.audioFile[0];
//     const imageFile = files.imageFile?.[0];

//     // === PHÂN TÍCH COLLAB IDS ===
//     let featuredArtistIds: number[] = [];
//     try {
//       const allIds = JSON.parse(dto.artistIds).map(id => +id);
//       featuredArtistIds = allIds.filter(id => id !== artist.id); // Lọc ID chính
//     } catch (e) {
//       throw new BadRequestException('Dữ liệu nghệ sĩ cộng tác không hợp lệ.');
//     }
//     // ============================

//     let album: Album | null = null;
//     if (dto.albumId) {
//       album = await this.albumRepository.findOne({ where: { id: +dto.albumId } });
//       if (!album) throw new NotFoundException('Album không tồn tại.');
//     }

//     // ... (Logic Upload R2, Metadata, Embedding giữ nguyên) ...
//     const audioUpload = await this.r2Service.uploadFile('music', audioFile.originalname, audioFile.buffer, audioFile.mimetype);
//     // ... (Logic Image Upload, Duration, Embedding giữ nguyên) ...
//     let imageUrl: string | null = null;
//     // ... (Logic Image Upload) ...

//     let duration = 0;
//     // ... (Logic Duration) ...
    
//     // ... (Logic Embedding) ...
//     const embeddingVector = await this.aiService.generateSongEmbedding(dto.title, dto.genre);

//     // Tạo entity Song
//     const newSong: Song = this.songRepository.create({
//         title: dto.title,
//         file_url: audioUpload.url,
//         image_url: imageUrl,
//         duration,
//         track_number: dto.track_number ? Number(dto.track_number) : null,
//         active: true,
//         status: 'PENDING',
//         genre: dto.genre,
//         album,
//         embedding: embeddingVector,
//     });

//     const savedSong: Song = await this.songRepository.save(newSong); 

//     // === 1. LƯU NGHỆ SĨ CHÍNH (PRIMARY ARTIST) ===
//     await this.songArtistRepository.save({ song: savedSong, artist, is_primary: true });

//     // === 2. LƯU NGHỆ SĨ PHỤ (COLLAB) ===
//     if (featuredArtistIds.length > 0) {
//         const collabArtists = await this.artistRepository.findBy({ id: In(featuredArtistIds) });
//         
//         const collabRecords = collabArtists.map(featArtist => ({
//             song: savedSong,
//             artist: featArtist,
//             is_primary: false,
//         }));

//         await this.songArtistRepository.save(collabRecords);
//     }
    
//     // === 3. LYRICS ===
//     if (dto.lyricsContent?.trim()) {
//         const lyricsEntity = this.lyricsRepository.create({
//           lyrics: dto.lyricsContent.trim(),
//           language: dto.language || 'vi',
//           song: savedSong, 
//         });
//         await this.lyricsRepository.save(lyricsEntity);
//     }

//     return savedSong;
// }


// ==========================================================
// =============== 2. CẬP NHẬT BÀI HÁT (UPDATE SONG) =========
// ==========================================================
async updateMySong(userId: number, songId: number, dto: any, imageFile?: Express.Multer.File) {
    const artist = await this.getArtistByUserId(userId);

    // 1. Kiểm tra quyền sở hữu bằng Query Builder (FIX Collab)
    const song = await this.songRepository.createQueryBuilder('song')
      .innerJoin('song.songArtists', 'sa', 'sa.artist_id = :artistId', { artistId: artist.id })
      .where('song.id = :songId', { songId })
      .leftJoinAndSelect('song.album', 'album')
      .getOne();

    if (!song) throw new NotFoundException('Bài hát không tồn tại hoặc bạn không có quyền sửa.');

    // ... (Logic cập nhật Title, Track Number, Genre, Album, Image giữ nguyên) ...

    // === 2. XỬ LÝ VÀ CẬP NHẬT COLLAB ARTISTS ===
    let featuredArtistIds: number[] = [];
    if (dto.artistIds) { 
      try {
        const allIds = JSON.parse(dto.artistIds).map(id => +id);
        featuredArtistIds = allIds.filter(id => id !== artist.id); // Lọc ID chính
      } catch (e) {
        throw new BadRequestException('Dữ liệu nghệ sĩ cộng tác không hợp lệ.');
      }
    }

    // 2a. Xóa tất cả nghệ sĩ phụ hiện tại của bài hát này
    await this.songArtistRepository.delete({ song_id: songId, is_primary: false });

    // 2b. Tạo lại các bản ghi Collab mới
    if (featuredArtistIds.length > 0) {
        const collabArtists = await this.artistRepository.findBy({ id: In(featuredArtistIds) });
        
        const collabRecords = collabArtists.map(featArtist => ({
            song_id: songId,
            artist: featArtist,
            is_primary: false,
        }));

        await this.songArtistRepository.save(collabRecords);
    }
    // ========================================================
    
    // Cập nhật trạng thái duyệt
    if (song.status === 'APPROVED' || song.status === 'REJECTED') song.status = 'PENDING';

    return this.songRepository.save(song);
}
  // ==========================================================
  // =============== DELETE SONG =============================
  // ==========================================================
  async deleteMySong(userId: number, songId: number) {
    const artist = await this.getArtistByUserId(userId);

    const song = await this.songRepository.createQueryBuilder('song')
      .innerJoin('song.songArtists', 'sa', 'sa.artist_id = :artistId', { artistId: artist.id })
      .where('song.id = :songId', { songId })
      .getOne();

    if (!song) throw new NotFoundException('Bài hát không tồn tại hoặc bạn không có quyền xóa.');

    await this.songRepository.update(songId, { active: false });
    return { message: 'Bài hát đã được ẩn thành công (Soft Deleted).' };
  }

  // ==========================================================
  // =============== FIND ONE SONG ===========================
  // ==========================================================
  async findOne(id: number): Promise<Song> {
    const song = await this.songRepository.findOne({
      where: { id, active: true, status: 'APPROVED' },
      relations: ['songArtists', 'songArtists.artist', 'album', 'lyrics'],
    });
    if (!song) throw new NotFoundException(`Song with ID ${id} not found`);
    return song;
  }

  // ==========================================================
  // =============== CHECK OWNERSHIP =========================
  // ==========================================================
  async checkSongOwnership(songId: number, artistId: number): Promise<Song | null> {
    return this.songRepository.createQueryBuilder('song')
      .innerJoin('song.songArtists', 'sa', 'sa.artist_id = :artistId', { artistId })
      .where('song.id = :songId', { songId })
      .getOne();
  }

  // ==========================================================
  // =============== GET PRIMARY ARTIST ======================
  // ==========================================================
  async getPrimaryArtist(songId: number) {
    const sa = await this.songArtistRepository.findOne({
      where: { song_id: songId, is_primary: true },
      relations: ['artist']
    });
    return sa?.artist || null;
  }

  // ==========================================================
  // =============== FIND MY SONGS ===========================
  // ==========================================================
  async findMySongs(userId: number, status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const artist = await this.getArtistByUserId(userId);

    const query = this.songRepository.createQueryBuilder('song')
      .leftJoinAndSelect('song.songArtists', 'sa')
      .leftJoinAndSelect('sa.artist', 'artist')
      .leftJoinAndSelect('song.album', 'album')
      .where('sa.artist_id = :artistId', { artistId: artist.id })
      .andWhere('song.active = true')
      .orderBy('song.created_at', 'DESC');

    if (status) query.andWhere('song.status = :status', { status });

    return query.getMany();
  }


  // ==========================================================
  // =============== FIND BY GENRE ===========================
  // ==========================================================
  async findByGenre(genreName: string) {
    return this.songRepository.find({
      where: { genre: genreName, active: true, status: 'APPROVED' },
      relations: ['songArtists', 'songArtists.artist', 'album'],
    });
  }
}