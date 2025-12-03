// music-backend/src/album/album.service.ts (FULL CODE ĐÃ SỬA)
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from './album.entity';
import { Artist } from '../artist/artist.entity'; // <-- (1) IMPORT
import { CreateAlbumDto } from './dto/create-album.dto'; // <-- (2) IMPORT
import { UpdateAlbumDto } from './dto/update-album.dto'; // <-- (3) IMPORT
import { User } from '../user/user.entity'; // <-- (4) IMPORT
import { R2Service } from '../shared/r2.service'; // <-- (1) IMPORT R2 SERVICE

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
    @InjectRepository(Artist) // <-- (5) INJECT ARTIST REPO
    private artistRepository: Repository<Artist>,
    private r2Service: R2Service,
  ) {}

  // Hàm helper để lấy Artist từ UserId
  private async getArtistByUserId(userId: number): Promise<Artist> {
    const artist = await this.artistRepository.findOne({ where: { user_id: userId } });
    if (!artist) {
      throw new NotFoundException('Không tìm thấy hồ sơ nghệ sĩ của bạn.');
    }
    return artist;
  }
  /**
   * HÀM MỚI: Lấy tất cả Album
   */
  async findAllAlbums(): Promise<Album[]> {
  return this.albumRepository.find({
    where: { active: true },   // ✔ chỉ lấy album chưa xóa
    relations: ['artist'],
    order: { release_date: 'DESC' },
  });
  }


/**
   * HÀM MỚI (ARTIST): Lấy TẤT CẢ Album của TÔI
   */
  async findMyAlbums(userId: number): Promise<Album[]> {
    const artist = await this.getArtistByUserId(userId);
    return this.albumRepository.find({
      where: { artist: { id: artist.id }, active: true },
      relations: ['songs'], 
      order: { release_date: 'DESC' },
    });
  }

  // /**
  //  * HÀM MỚI (ARTIST): TẠO Album mới
  //  */
  // async createAlbum(userId: number, dto: CreateAlbumDto, coverFile?: Express.Multer.File): Promise<Album> {
  //   const artist = await this.getArtistByUserId(userId);

  //   // === SỬA LỖI TS2322 (LỖI 1) ===
  //   let cover_url: string | null = null; // Khai báo rõ ràng kiểu
  //   if (coverFile) {
  //       cover_url = `/uploads/covers/${coverFile.filename}`; 
  //   }
  //   // =============================

  //   const newAlbum = this.albumRepository.create({
  //     ...dto,
  //     artist: artist,
  //     cover_url: cover_url, // (Lỗi 2, 3 đã được fix)
  //   });
    
  //   return this.albumRepository.save(newAlbum);
  // }

  // /**
  //  * HÀM MỚI (ARTIST): CẬP NHẬT Album
  //  */
  // async updateMyAlbum(userId: number, albumId: number, dto: UpdateAlbumDto, coverFile?: Express.Multer.File): Promise<Album> {
  //   const artist = await this.getArtistByUserId(userId);
  //   const album = await this.albumRepository.findOne({ 
  //     where: { id: albumId, active: true },
  //     relations: ['artist'] 
  //   });

  //   if (!album) throw new NotFoundException('Album không tồn tại.');
  //   if (album.artist.id !== artist.id) {
  //     throw new UnauthorizedException('Bạn không có quyền sửa Album này.');
  //   }

  //   // Cập nhật thông tin
  //   album.title = dto.title || album.title;
    
  //   // === SỬA LỖI TS2322 (LỖI 4): CHUYỂN STRING SANG DATE ===
  //   if (dto.release_date) {
  //       album.release_date = new Date(dto.release_date);
  //   }
  //   // ==================================================
    
  //   if (coverFile) {
  //       album.cover_url = `/uploads/covers/${coverFile.filename}`;
  //   }

  //   return this.albumRepository.save(album);
  // }

  /**
     * API: Lấy chi tiết 1 Album (Chỉ hiển thị bài hát APPROVED)
     */
    async findOne(id: number): Promise<Album> {
        // === SỬ DỤNG QUERY BUILDER ĐỂ LỌC BÀI HÁT ===
        const album = await this.albumRepository.createQueryBuilder('album')
            .where('album.id = :albumId AND album.active = :active', { 
                albumId: id,
                active: true 
            })
            // 1. JOIN Artist
            .leftJoinAndSelect('album.artist', 'artist')
            
            // 🚨 FIX LỖI: BẮT BUỘC JOIN USER CỦA ARTIST 🚨
            // Dòng này cần load user, ngay cả khi user_id là NULL
            .leftJoinAndSelect('artist.user', 'user') 
            
            // JOIN Songs VÀ LỌC THEO STATUS
            .leftJoinAndSelect('album.songs', 'song', 
                'song.status = :status AND song.active = :active', 
                { status: 'APPROVED', active: true }
            )
            // JOIN Artist của Bài hát (cho tên nghệ sĩ)
            .leftJoinAndSelect('song.artist', 'songArtist')
            
            // Sắp xếp bài hát theo track_number
            .orderBy('song.track_number', 'ASC')
            
            .getOne();
        // ===========================================

        // 1. Kiểm tra Album có tồn tại không
        if (!album) {
            throw new NotFoundException(`Album with ID ${id} not found.`);
        }
        
        // 2. FIX LỖI: Chỉ báo lỗi nếu không tìm thấy Artist Profile (bản thân album bị lỗi liên kết)
        if (!album.artist) {
             throw new NotFoundException('Dữ liệu Artist liên kết bị thiếu.');
        }
        
        // Bỏ kiểm tra album.artist.user: Cho phép user là NULL (Đã Fix)

        return album;
    }

    /**
   * (ARTIST) Xóa Album (Soft Delete: Đặt is_active = 0)
   */
  async deleteMyAlbum(userId: number, albumId: number): Promise<{ message: string }> {
    const artist = await this.getArtistByUserId(userId);

    // 1. Tìm Album để kiểm tra quyền sở hữu
    const album = await this.albumRepository.findOne({
      where: { id: albumId, artist: { id: artist.id }, active: true }, // Chỉ tìm album đang active
      relations: ['artist', 'songs']
    });

    if (!album) {
      throw new NotFoundException('Album không tồn tại hoặc bạn không có quyền xóa.');
    }
    
    // 2. SOFT DELETE (Chuyển is_active = 0)
    // Dùng update để chỉ cập nhật cột này
    const updateResult = await this.albumRepository.update(albumId, { active: false }); 

    if (updateResult.affected === 0) {
         throw new NotFoundException('Xóa thất bại (Không tìm thấy bản ghi active).');
    }
    
    return { message: 'Album đã được ẩn thành công (Soft Deleted).' };
  }
async createAlbum(
  userId: number,
  dto: CreateAlbumDto,
  coverFile?: Express.Multer.File
): Promise<Album> {
  const artist = await this.getArtistByUserId(userId);

  let coverUrl: string | null = null;

  if (coverFile) {
    const uploadResult = await this.r2Service.uploadFile(
      'albums',
      coverFile.originalname,
      coverFile.buffer,
      coverFile.mimetype
    );
    coverUrl = uploadResult.url;
  }

  const newAlbum = this.albumRepository.create({
    ...dto,
    release_date: new Date(dto.release_date),
    artist,
    cover_url: coverUrl,
    active: true,
  });

  return await this.albumRepository.save(newAlbum);
}


  /**
   * (ARTIST) Cập nhật Album (Update/Replace Cover trên R2)
   */
  async updateMyAlbum(userId: number, albumId: number, dto: any, coverFile?: Express.Multer.File): Promise<Album> {
    const artist = await this.getArtistByUserId(userId);
    const album = await this.albumRepository.findOne({ 
      where: { id: albumId, active: true },
      relations: ['artist'] 
    });

    if (!album) throw new NotFoundException('Album không tồn tại.');
    if (album.artist.id !== artist.id) {
      throw new UnauthorizedException('Bạn không có quyền sửa Album này.');
    }

    album.title = dto.title || album.title;
    if (dto.release_date) {
      album.release_date = new Date(dto.release_date);
    }
    
    // Xử lý upload ảnh mới
    if (coverFile) {
      if (album.cover_url) {
        await this.r2Service.deleteFileByUrl(album.cover_url);
      }
      const uploadResult = await this.r2Service.uploadFile('albums', coverFile.originalname, coverFile.buffer, coverFile.mimetype);
      album.cover_url = uploadResult.url; 
    }

    // === FIX LỖI: Đảm bảo chỉ save 1 object ===
    const savedAlbum = await this.albumRepository.save(album);
    return savedAlbum; // Trả về Album (số ít)
    // ============================================
  }
}