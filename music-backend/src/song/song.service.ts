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
  ) {}

  // (Hàm helper getArtistByUserId)
  private async getArtistByUserId(userId: number): Promise<Artist> {
    const artist = await this.artistRepository.findOne({ where: { user_id: userId } });
    if (!artist) {
      throw new NotFoundException('Không tìm thấy hồ sơ nghệ sĩ của bạn.');
    }
    return artist;
  }
  
  // ================================
  // === CÁC HÀM CŨ (PUBLIC) ===
  // ================================
  
  // (Hàm findAll - Trang Home)
  async findAll(user: JwtPayload | null): Promise<Song[]> {
      return this.songRepository.find({
          where: { active: true, status: 'APPROVED' }, 
          relations: ['artist', 'album'],
          order: { play_count: 'DESC' }, // sắp xếp theo lượt nghe giảm dần
          take: 6
      });
  }

  /**
   * (ARTIST) Lấy danh sách bài hát của TÔI
   */
  async findMySongs(userId: number, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<Song[]> {
    const artist = await this.getArtistByUserId(userId);
    
    // SỬ DỤNG QUERY BUILDER AN TOÀN
    const query = this.songRepository.createQueryBuilder('song')
        // === FIX LỖI: BẮT BUỘC LEFT JOIN ARTIST ===
        .leftJoinAndSelect('song.artist', 'artist') 
        // ============================================
        .leftJoinAndSelect('song.album', 'album')
        
        .where('song.artist_id = :artistId', { artistId: artist.id })
        .andWhere('song.active = :activeStatus', { activeStatus: true })
        .orderBy('song.created_at', 'DESC');
        
    // Lọc theo Status (nếu có)
    if (status) {
        query.andWhere('song.status = :status', { status: status });
    } else {
        query.andWhere('song.status = :defaultStatus', { defaultStatus: 'APPROVED' });
    }

    return query.getMany();
  }

  // (Hàm findOne - Chi tiết bài hát)
  async findOne(id: number): Promise<Song | null> {
      const song = await this.songRepository.findOne({
          where: { id: id, active: true , status: 'APPROVED'},
          relations: ['artist', 'album', 'lyrics'], 
      });
      if (!song) {
          throw new NotFoundException(`Song with ID ${id} not found`); 
      }
      return song;
  }
  
  // (Hàm findAllWithFilters - Trang All Songs)
  async findAllWithFilters(genre?: string, artistId?: number): Promise<any> {
      const options: FindManyOptions<Song> = {
          where: { active: true, status: 'APPROVED' },
          relations: ['artist', 'album'],
          order: { created_at: 'DESC' }
      };
      if (genre) options.where = { ...options.where, genre: genre }; 
      if (artistId) options.where = { ...options.where, artist: { id: artistId } };
      return this.songRepository.find(options);
  }
  
  // (Hàm findByGenre - Trang Genre Detail)
  async findByGenre(genreName: string): Promise<Song[]> {
       return this.songRepository.find({
           where: { genre: genreName, active: true, status: 'APPROVED' },
           relations: ['artist', 'album']
       });
  }

  // === (1) HÀM BỊ THIẾU (ĐÃ THÊM LẠI) ===
  async findRelatedByGenre(currentSongId: number, genreName: string): Promise<Song[]> {
        if (!genreName) return [];
        
        return this.songRepository.createQueryBuilder('song')
            .leftJoinAndSelect('song.artist', 'artist')
            .leftJoinAndSelect('song.album', 'album') 
            .where('song.genre = :genreName', { genreName: genreName }) 
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

  // ===================================
  // === TÍNH NĂNG: TẠO BÀI HÁT MỚI ===
  // ===================================

  async createSong(
    userId: number, 
    dto: any, 
    files: { audioFile?: Express.Multer.File[], imageFile?: Express.Multer.File[] }
  ): Promise<Song> {
    
    if (!files?.audioFile?.[0]) throw new BadRequestException('File nhạc (audioFile) là bắt buộc.');

    const artist = await this.getArtistByUserId(userId);
    const audioFile = files.audioFile[0];
    const imageFile = files.imageFile?.[0];
    
    let album: Album | null = null;
    if (dto.albumId) {
      album = await this.albumRepository.findOne({ where: { id: parseInt(dto.albumId), artist: { id: artist.id } } });
      if (!album) throw new NotFoundException('Album không tồn tại hoặc không thuộc về bạn.');
    }

    // 1. UPLOAD FILE NHẠC LÊN R2
    const audioUpload = await this.r2Service.uploadFile(
      'mucsic', 
      audioFile.originalname,
      audioFile.buffer, // <-- Dùng buffer
      audioFile.mimetype,
    );

    // 2. UPLOAD COVER LÊN R2
    let imageUrl: string | null = null;
    if (imageFile) {
      const imageUpload = await this.r2Service.uploadFile('covers', imageFile.originalname, imageFile.buffer, imageFile.mimetype);
      imageUrl = imageUpload.url;
    }

    // === 3. TÍNH DURATION (TỪ BUFFER) ===
    let duration = 0;
    try {
      // FIX: Đọc metadata từ BUFFER
      const metadata = await musicMetadata.parseBuffer(audioFile.buffer, audioFile.mimetype); 
      duration = metadata.format.duration ? Math.floor(metadata.format.duration) : 0;
    } catch {
      duration = 0;
    }
    // ===================================

    // 4. TẠO LYRICS (Dọn dẹp logic tạo)
    let lyricsEntity: Lyrics | null = null;
    if (dto.lyricsContent?.trim()) {
        lyricsEntity = this.lyricsRepository.create({ 
            lyrics: dto.lyricsContent.trim(),
            language: dto.language || 'vi' 
        });
    }

    // 5. TẠO EMBEDDING
    const embeddingVector = await this.aiService.generateSongEmbedding(dto.title, dto.genre);

    // 6. Tạo entity Song
    const newSong = this.songRepository.create({
      title: dto.title,
      file_url: audioUpload.url, // R2 URL
      image_url: imageUrl, // R2 URL
      duration,
      track_number: dto.track_number ? Number(dto.track_number) : null,
      active: true,
      status: 'PENDING',
      genre: dto.genre,
      artist,
      album,
      lyrics: lyricsEntity,
      embedding: embeddingVector,
    });

    return this.songRepository.save(newSong);
  }

  // ===================================
  // === CẬP NHẬT BÀI HÁT (R2) ===
  // ===================================
  async updateMySong(
    userId: number, 
    songId: number, 
    dto: any, 
    imageFile?: Express.Multer.File
  ): Promise<Song> {
    const artist = await this.getArtistByUserId(userId);

    const song = await this.songRepository.findOne({
      where: { id: songId, artist: { id: artist.id } },
      relations: ['artist', 'album'],
    });
    if (!song) throw new NotFoundException('Bài hát không tồn tại hoặc bạn không có quyền sửa.');

    song.title = dto.title || song.title;
    song.track_number = dto.track_number ? parseInt(dto.track_number) : song.track_number;
    if (dto.genre) song.genre = dto.genre;

    // 1. Xử lý Album
    if (dto.albumId !== undefined) {
      if (dto.albumId === '') {
        song.album = null;
      } else {
        const album = await this.albumRepository.findOne({ where: { id: parseInt(dto.albumId), artist: { id: artist.id } } });
        if (!album) throw new NotFoundException('Album không tồn tại hoặc không thuộc về bạn.');
        song.album = album;
      }
    }

    // 2. Xử lý upload ảnh mới
    if (imageFile) {
      if (song.image_url) await this.r2Service.deleteFileByUrl(song.image_url); // Xóa cũ
      const imageUpload = await this.r2Service.uploadFile('covers', imageFile.originalname, imageFile.buffer, imageFile.mimetype);
      song.image_url = imageUpload.url; // Lưu URL R2 mới
    }

    // 3. Cập nhật trạng thái duyệt
    if (song.status === 'REJECTED' || song.status === 'APPROVED') song.status = 'PENDING';

    return this.songRepository.save(song);
  }


  async deleteMySong(userId: number, songId: number): Promise<{ message: string }> {
    const artist = await this.getArtistByUserId(userId);
    const song = await this.songRepository.findOne({ 
      where: { id: songId, artist: { id: artist.id } },
      relations: ['artist']
    });
    if (!song) throw new NotFoundException('Bài hát không tồn tại hoặc bạn không có quyền xóa.');

    // 1. XÓA FILE TRÊN R2 (QUAN TRỌNG)
    // if (song.file_url) await this.r2Service.deleteFileByUrl(song.file_url);
    // if (song.image_url) await this.r2Service.deleteFileByUrl(song.image_url);

    // 2. SOFT DELETE (Đặt active = false)
    await this.songRepository.update(songId, { active: false });

    return { message: 'Bài hát đã được ẩn thành công (Soft Deleted).' };
  }

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

  /**
     * HÀM MỚI (ARTIST): Lấy TẤT CẢ Singles của Artist (Bài hát KHÔNG có album_id)
     */
    async findMySingles(userId: number): Promise<Song[]> {
        const artist = await this.getArtistByUserId(userId);

        return this.songRepository.find({
            where: {
                artist: { id: artist.id },
                album: IsNull(), // <-- ĐIỀU KIỆN QUAN TRỌNG NHẤT: Album là NULL
                active: true,
                status: In(['APPROVED']),
            },
            select: ['id', 'title', 'duration', 'image_url'], // Chỉ lấy các trường cần thiết
        });
    }

    /**
     * HÀM MỚI (ARTIST): Thêm 1 Single vào Album (Cập nhật album_id)
     */
    async addSongToAlbum(userId: number, songId: number, albumId: number): Promise<Song> {
        const artist = await this.getArtistByUserId(userId);

        // 1. Kiểm tra Bài hát có tồn tại và thuộc về Artist này không
        const song = await this.songRepository.findOne({ 
            where: { id: songId, artist: { id: artist.id } },
            relations: ['album']
        });
        if (!song) {
            throw new NotFoundException('Bài hát không tồn tại hoặc không thuộc về bạn.');
        }
        if (song.album) {
            throw new BadRequestException('Bài hát này đã thuộc Album khác.');
        }

        // 2. Kiểm tra Album có tồn tại và thuộc về Artist này không
        const album = await this.albumRepository.findOne({ 
            where: { id: albumId, artist: { id: artist.id } } 
        });
        if (!album) {
            throw new NotFoundException('Album không tồn tại.');
        }

        // 3. Cập nhật album_id cho Bài hát
        song.album = album;
        // (Bạn có thể thêm logic cập nhật track_number nếu cần)

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
      relations: ['artist', 'album'],
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
        relations: ['artist', 'album'],
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
        relations: ['artist', 'album'],
        order: { play_count: 'DESC' },
        take: 10,
    });

    if (topSongs.length === 0) {
        throw new NotFoundException("Không tìm thấy bài hát đề xuất.");
    }

    // Chọn ngẫu nhiên 1 bài trong top 10
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
}