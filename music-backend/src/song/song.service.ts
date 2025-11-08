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


@Injectable()
export class SongService {
  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
    @InjectRepository(Lyrics) // <-- (2) TIÊM LYRICS REPO MỚI
    private lyricsRepository: Repository<Lyrics>,
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

  // (Hàm findOne - Chi tiết bài hát)
  async findOne(id: number): Promise<Song | null> {
      const song = await this.songRepository.findOne({
          where: { id: id, active: true , status: 'APPROVED'},
          relations: ['artist', 'album'], 
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

  // ================================
  // === API MỚI CHO ARTIST (QUẢN LÝ BÀI HÁT) ===
  // ================================

  /**
   * (ARTIST) Lấy danh sách bài hát của TÔI (SỬ DỤNG QUERY BUILDER)
  */
  async findMySongs(userId: number, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<Song[]> {
    // 1. Lấy Artist ID (Hàm helper đã được sửa ở bước trước)
    const artist = await this.getArtistByUserId(userId);
    
    // 2. Xây dựng Query Builder (Dùng Artist ID)
    const query = this.songRepository.createQueryBuilder('song')
        // Load các quan hệ cần thiết cho Frontend
        .leftJoinAndSelect('song.artist', 'artist')
        .leftJoinAndSelect('song.album', 'album')
        
        // Lọc BẮT BUỘC theo Khóa ngoại (artist_id)
        .where('song.artist_id = :artistId', { artistId: artist.id })
        .orderBy('song.created_at', 'DESC');
        
    // 3. Lọc theo Status (Chỉ thêm WHERE nếu status không phải undefined/null)
    if (status) {
        query.andWhere('song.status = :status', { status: status });
    }

    return query.getMany();
  }

  /**
   * (ARTIST) Tạo bài hát mới (Status: PENDING)
   */
  async createSong(
    userId: number,
    dto: CreateSongDto,
    files: { audioFile?: Express.Multer.File[], imageFile?: Express.Multer.File[] }
  ): Promise<Song> {

    if (!files?.audioFile?.[0]) throw new BadRequestException('File nhạc (audioFile) là bắt buộc.');

    const artist = await this.getArtistByUserId(userId);

    let album: Album | null = null;
    if (dto.albumId) {
        album = await this.albumRepository.findOne({
            where: { id: parseInt(dto.albumId), artist: { id: artist.id } }
        });
        if (!album) throw new NotFoundException('Album không tồn tại hoặc không thuộc về bạn.');
    }

    const audioFile = files.audioFile[0];
    const audioPath = `/uploads/music/${audioFile.filename}`;
    const physicalPath = join(process.cwd(), 'uploads', 'music', audioFile.filename); // đường dẫn vật lý

    const imagePath = files.imageFile?.[0] ? `/uploads/covers/${files.imageFile[0].filename}` : null;

    const newSong = new Song();
    newSong.title = dto.title;
    newSong.file_url = audioPath;
    newSong.image_url = imagePath || undefined;
    newSong.track_number = dto.track_number ? Number(dto.track_number) : null;
    newSong.active = true;
    newSong.status = 'PENDING';
    newSong.genre = dto.genre;

    // === LẤY DURATION TỪ FILE AUDIO ===
    let songDuration = 0;
    try {
        const metadata = await parseFile(physicalPath);
        if (metadata.format.duration) {
            songDuration = Math.floor(metadata.format.duration); // làm tròn giây
        }
    } catch (err) {
        console.warn(`[METADATA WARNING] Không đọc được duration cho file ${audioFile.filename}:`, err.message);
    }
    newSong.duration = songDuration;

    // === GÁN RELATIONSHIP ===
    newSong.artist = artist;
    newSong.album = album;

    return this.songRepository.save(newSong);
  }

  async updateMySong(
    userId: number, 
    songId: number, 
    dto: UpdateSongDto, 
    imageFile?: Express.Multer.File
  ): Promise<Song> {
    const artist = await this.getArtistByUserId(userId);
    
    const song = await this.songRepository.findOne({ 
        where: { id: songId, artist: { id: artist.id } },
        relations: ['artist', 'album'] 
    });

    if (!song) throw new NotFoundException('Bài hát không tồn tại hoặc bạn không có quyền sửa.');
    
    song.title = dto.title || song.title;
    song.track_number = dto.track_number ? parseInt(dto.track_number) : song.track_number;

    if (dto.genre) {
        song.genre = dto.genre; 
    }
    
    if (dto.albumId !== undefined) {
        if (dto.albumId === '') {
            // Gỡ khỏi Album
            song.album = null; 
        } else {
            // Thêm vào Album mới
            const album = await this.albumRepository.findOne({ 
                where: { id: parseInt(dto.albumId), artist: { id: artist.id } } 
            });
            if (!album) {
                throw new NotFoundException('Album không tồn tại hoặc không thuộc về bạn.');
            }
            song.album = album;
        }
    }
    
    // 3. Xử lý Image File (Nếu có file mới)
    if (imageFile) { 
        // Logic xóa file cũ nên được thêm ở đây (tạm thời bỏ qua)
        song.image_url = `/uploads/covers/${imageFile.filename}`;
    }

    // 4. Cập nhật trạng thái duyệt (nếu bài hát bị từ chối hoặc đã duyệt và được sửa)
    if (song.status === 'REJECTED' || song.status === 'APPROVED') { 
        song.status = 'PENDING'; // Cần Admin duyệt lại
    }
    return this.songRepository.save(song);
  }

  async deleteMySong(userId: number, songId: number): Promise<{ message: string }> {
    const artist = await this.getArtistByUserId(userId);
    const song = await this.songRepository.findOne({ where: { id: songId, artist: { id: artist.id } } });

    if (!song) throw new NotFoundException('Bài hát không tồn tại hoặc bạn không có quyền xóa.');
    
    await this.songRepository.delete(songId);
    return { message: 'Xóa bài hát thành công.' };
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
}