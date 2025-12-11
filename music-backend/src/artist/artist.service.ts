// music-backend/src/artist/artist.service.ts (BẢN FINAL FIX LỖI TRÙNG LẶP)
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './artist.entity';
// Import các Entity khác (cần thiết cho TypeORM)
import { User } from '../user/user.entity';
import { Song } from '../song/song.entity';
import { Album } from '../album/album.entity';
import { 
    Injectable, NotFoundException, ConflictException, 
    BadRequestException, InternalServerErrorException 
} from '@nestjs/common'; // <-- THÊM CÁC EXCEPTION
import { Role } from '../role/role.entity'; // <-- CẦN IMPORT
import { UpdateArtistDto } from './dto/update-artist.dto'; // <-- IMPORT MỚI
import { R2Service } from '../shared/r2.service'; // <-- (1) IMPORT R2 SERVIC

@Injectable()
export class ArtistService {
  constructor(
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role) // <-- (2) THÊM ROLE REPO VÀO CONSTRUCTOR
    private roleRepository: Repository<Role>,
    private r2Service: R2Service,
  ) {}

  /**
   * Lấy danh sách 6 nghệ sĩ ngẫu nhiên cho trang chủ (Sử dụng SQL Thô)
   */
async findFeaturedArtists(): Promise<Artist[]> {
  try {
    const query = `
      SELECT * FROM artist 
      WHERE active = 1 AND registration_status = 'APPROVED' 
      ORDER BY RAND() 
      LIMIT 10
    `;
    const artists = await this.artistRepository.query(query);
    return artists;
  } catch (err) {
    console.error('🔥 Lỗi khi truy vấn featured artists:', err.message);
    throw new InternalServerErrorException('Không thể tải danh sách nghệ sĩ nổi bật.');
  }
}


  async findAllArtists(): Promise<Artist[]> {
    return this.artistRepository.find({
      where: { 
            active: 1,
            // === SỬA LỖI: THÊM LỌC STATUS ===
            registrationStatus: 'APPROVED' 
            // ================================
        },
      order: { stage_name: 'ASC' }, // Sắp xếp A-Z
    });
  }

async findOne(id: number): Promise<Artist | null> {
  const artist = await this.artistRepository
    .createQueryBuilder('artist')
    .where('artist.id = :id', { id })
    .andWhere('artist.active = true')
    .andWhere('artist.registrationStatus = :status', { status: 'APPROVED' })

    .leftJoinAndSelect('artist.albums', 'album', 'album.active = true')

    .leftJoinAndSelect(
      'artist.songArtists',
      'songArtist',
      'songArtist.active = true'
    )

    .leftJoinAndSelect(
      'songArtist.song',
      'song',
      'song.active = true AND song.status = :songStatus',
      { songStatus: 'APPROVED' }
    )

    .leftJoinAndSelect(
      'song.songArtists',
      'songAllArtists',
      'songAllArtists.active = true'
    )
    .leftJoinAndSelect('songAllArtists.artist', 'songAllArtistsArtist')

    .orderBy('song.play_count', 'DESC')
    .addOrderBy('album.release_date', 'DESC')
    .getOne();

  return artist;
}

  /**
   * 2. HÀM LẤY DANH SÁCH CHỜ DUYỆT (ADMIN)
   */
  async findPendingArtists(): Promise<Artist[]> {
    return this.artistRepository.find({
      where: { registrationStatus: 'PENDING' }, 
      relations: ['user'],
      order: { created_at: 'ASC' }
    });
  }

  /**
   * 3. HÀM DUYỆT HỒ SƠ (ADMIN)
   */
  async approveArtist(artistId: number): Promise<Artist> {
    const artist = await this.artistRepository.findOne({ 
      where: { id: artistId, registrationStatus: 'PENDING' }, 
      relations: ['user', 'user.role'] // Bắt buộc load user
    });

    if (!artist) {
      throw new NotFoundException('Hồ sơ không tìm thấy hoặc không ở trạng thái chờ duyệt.');
    }
    
    // === FIX TS18047: KIỂM TRA artist.user TỒN TẠI ===
    if (!artist.user) {
        throw new NotFoundException('Không tìm thấy người dùng liên kết với hồ sơ này.');
    }
    // ===============================================

    // 1. CẬP NHẬT TRẠNG THÁI DUYỆT CỦA HỒ SƠ
    artist.registrationStatus = 'APPROVED'; 
    
    // 2. CẬP NHẬT ROLE CỦA USER TỪ 'listener' SANG 'artist'
    const artistRole = await this.userRepository.manager
      .getRepository(Role) 
      .findOne({ where: { name: 'artist' } });

    if (artistRole) {
      artist.user.role = artistRole;
      await this.userRepository.save(artist.user); // FIX TS2769: Đã kiểm tra artist.user != null
    }
    
    // === FIX TS18047: KIỂM TRA TRƯỚC KHI DELETE PASSWORD ===
    delete artist.user.password; 
    // ====================================================

    return this.artistRepository.save(artist);
  }

/**
   * 4. HÀM MỚI: Lấy hồ sơ Artist CÁ NHÂN (cho Dashboard)
   */
  async getMyArtistProfile(userId: number): Promise<Artist> {
    // === SỬA LỖI TẠI ĐÂY ===
    // (Tìm bằng 'user_id' thay vì 'user: { id: ... }')
    const artist = await this.artistRepository.findOne({
      where: { user_id: userId },
      relations: ['user'] 
    });
    // ======================

    if (!artist) {
      throw new NotFoundException('Không tìm thấy hồ sơ nghệ sĩ của bạn.');
    }
    return artist;
  }

  /**
   * HÀM: Cập nhật hồ sơ Artist CÁ NHÂN (Upload Avatar lên R2)
   */
  async updateMyArtistProfile(
    userId: number, 
    dto: any, 
    avatarFile?: Express.Multer.File 
  ): Promise<Artist> {
    
    const artist = await this.getMyArtistProfile(userId); 

    // Cập nhật thông tin text
    if (dto.stage_name) { /* ... */ artist.stage_name = dto.stage_name; }
    if (dto.bio) artist.bio = dto.bio;

    // === FIX: XỬ LÝ UPLOAD/DELETE AVATAR TRÊN R2 ===
    if (avatarFile) {
      // 1. Xóa file cũ (nếu có)
      if (artist.avatar_url) {
        await this.r2Service.deleteFileByUrl(artist.avatar_url);
      }
      
      // 2. Upload avatar mới vào folder 'artistscover'
      const uploadResult = await this.r2Service.uploadFile(
        'artistscover', 
        avatarFile.originalname,
        avatarFile.buffer,
        avatarFile.mimetype,
      );
      artist.avatar_url = uploadResult.url; // <-- LƯU R2 URL MỚI
    }
    // ===============================================

    return this.artistRepository.save(artist);
  }

  async findAllApprovedArtists(): Promise<Artist[]> {
    return this.artistRepository.find({
        where: { 
            active: 1, 
            registrationStatus: 'APPROVED' 
        },
        // Chỉ chọn các trường cần thiết cho Collab
        select: ['id', 'stage_name', 'avatar_url'] 
    });
}

/**
 * 1. HÀM ĐĂNG KÝ (Tạo/Tái liên kết Artist với trạng thái PENDING)
 * Xử lý 3 kịch bản: Tạo mới, Tái liên kết, Xung đột (Conflict).
 */
async registerArtistProfile(userId: number, stageName: string): Promise<Artist> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['artist', 'role'] });

    if (!user) throw new NotFoundException('Người dùng không tồn tại.');
    if (user.artist && user.artist.registrationStatus === 'APPROVED') {
        throw new ConflictException('Hồ sơ Nghệ sĩ đã được tạo và duyệt cho tài khoản này.');
    }
    if (user.role.name !== 'listener') throw new BadRequestException('Bạn không phải là Listener.');

    // 1. TÌM KIẾM THEO STAGE NAME (Hồ sơ Artist đã tồn tại?)
    let existingArtist = await this.artistRepository.findOne({ 
        where: { stage_name: stageName },
        // PHẢI LOAD USER DÙ CÓ THỂ LÀ NULL
        relations: ['user'] 
    });

    if (existingArtist) {
        // === FIX LỖI TS18047: KIỂM TRA TRƯỚC KHI TRUY CẬP ID USER KHÁC ===
        
        // 2a. XUNG ĐỘT: Nếu Stage Name đã tồn tại VÀ đã được gán cho User khác (không phải User hiện tại)
        // Chúng ta kiểm tra user_id (number | null)
        if (existingArtist.user_id && existingArtist.user_id !== userId) {
            throw new ConflictException(`Nghệ danh "${stageName}" đã được sử dụng bởi tài khoản khác.`);
        }
        
        // 2b. TÁI LIÊN KẾT: Hồ sơ Artist đã tồn tại nhưng chưa có user_id hoặc user_id là của chính mình
        
        // Nếu user này đã có hồ sơ cũ (chưa duyệt), xóa nó đi để liên kết với hồ sơ mới
        if (user.artist) {
            await this.artistRepository.remove(user.artist); 
        }

        console.log(`[ArtistReg] Tái liên kết User ${userId} với hồ sơ Artist ID ${existingArtist.id}`);
        existingArtist.user = user; 
        existingArtist.user_id = userId; 
        existingArtist.registrationStatus = 'PENDING';
        existingArtist.active = 1; 
        
        return this.artistRepository.save(existingArtist);
        
    } else {
        // 3. TẠO MỚI BÌNH THƯỜNG
        
        if (user.artist) {
            await this.artistRepository.remove(user.artist); 
        }

        const newArtist = this.artistRepository.create({
            user: user,
            user_id: userId, 
            stage_name: stageName,
            active: 1, 
            registrationStatus: 'PENDING', 
            bio: 'Hồ sơ đang chờ Admin duyệt...',
        });

        return this.artistRepository.save(newArtist);
    }

  }

  async getArtistByUserId(userId: number) { // userId = 28
    
    // Nếu bảng Artist có quan hệ 'user' (Foreign Key)
    const artist = await this.artistRepository.findOne({
        where: { user: { id: userId } }, // Tìm Artist có user_id = 28
        select: ['id'], 
    });

    if (!artist) {
        throw new BadRequestException(`User ID ${userId} không liên kết với Artist nào.`);
    }

    // Kết quả mong muốn: artist.id = 23
    return artist;
}
}