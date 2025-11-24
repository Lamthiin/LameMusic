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


@Injectable()
export class ArtistService {
  constructor(
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role) // <-- (2) THÊM ROLE REPO VÀO CONSTRUCTOR
    private roleRepository: Repository<Role>,
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

  /**
   * Lấy chi tiết một nghệ sĩ theo ID, bao gồm Bài hát và Album (Dùng cho Trang Detail)
   */
  async findOne(id: number): Promise<Artist | null> {
    return this.artistRepository.findOne({
      where: { 
            id: id, 
            active: 1,
            // === SỬA LỖI: THÊM LỌC STATUS ===
            registrationStatus: 'APPROVED' 
            // ================================
        },
      relations: ['user', 'songs', 'albums'], 
      order: {
         songs: { id: 'DESC' }, 
         albums: { release_date: 'DESC' } 
       } as any 
    });
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

/**
   * 1. HÀM ĐĂNG KÝ (Tạo Artist với trạng thái PENDING)
   */
  // async registerArtistProfile(userId: number, stageName: string): Promise<Artist> {
  //   const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['artist', 'role'] });

  //   if (!user) throw new NotFoundException('Người dùng không tồn tại.');
  //   if (user.artist) throw new ConflictException('Hồ sơ Nghệ sĩ đã tồn tại.');
  //   if (user.role.name !== 'listener') throw new BadRequestException('Bạn không phải là Listener.');

  //   // 1. Kiểm tra nghệ danh đã tồn tại chưa
  //   const existingArtist = await this.artistRepository.findOne({ where: { stage_name: stageName } });
  //   if (existingArtist) throw new ConflictException(`Nghệ danh "${stageName}" đã có người sử dụng.`);

  //   // 2. Tạo Entity Artist 
  //   const newArtist = this.artistRepository.create({
  //     user: user,
  //     stage_name: stageName,
  //     // === SỬA LỖI: DÙNG LOGIC CỦA BẠN ===
  //     active: 1, // <-- Mới đăng ký thì active (visible), Admin có thể ẩn sau
  //     registrationStatus: 'PENDING', // <-- SỬ DỤNG CỘT TRẠNG THÁI
  //     // ===================================
  //     bio: 'Hồ sơ đang chờ Admin duyệt...',
  //   });

  //   return this.artistRepository.save(newArtist);
  // }

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

  // /**
  //  * 3. HÀM DUYỆT HỒ SƠ (ADMIN)
  //  */
  // async approveArtist(artistId: number): Promise<Artist> {
  //   const artist = await this.artistRepository.findOne({ 
  //     where: { id: artistId, registrationStatus: 'PENDING' }, 
  //     relations: ['user', 'user.role'] 
  //   });

  //   if (!artist) {
  //     throw new NotFoundException('Hồ sơ không tìm thấy hoặc không ở trạng thái chờ duyệt.');
  //   }

  //   // 1. CẬP NHẬT TRẠNG THÁI DUYỆT CỦA HỒ SƠ
  //   artist.registrationStatus = 'APPROVED'; 
    
  //   // 2. CẬP NHẬT ROLE CỦA USER TỪ 'listener' SANG 'artist'
  //   const artistRole = await this.userRepository.manager
  //     .getRepository(Role) 
  //     .findOne({ where: { name: 'artist' } });

  //   if (artistRole) {
  //     artist.user.role = artistRole;
  //     await this.userRepository.save(artist.user);
  //   }
    
  //   // Xóa password trước khi trả về
  //   delete artist.user.password; 

  //   return this.artistRepository.save(artist);
  // }
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
   * 5. HÀM MỚI: Cập nhật hồ sơ Artist CÁ NHÂN
   */
  async updateMyArtistProfile(
    userId: number, 
    dto: UpdateArtistDto, 
    avatarFile?: Express.Multer.File // <-- File avatar (optional)
  ): Promise<Artist> {
    
    const artist = await this.getMyArtistProfile(userId); // Lấy hồ sơ hiện tại

    // Cập nhật thông tin text (Bio, StageName)
    if (dto.stage_name) {
        // Kiểm tra xem stage_name mới có bị trùng không (nếu nó khác tên cũ)
        if (dto.stage_name !== artist.stage_name) {
            const existing = await this.artistRepository.findOne({ where: { stage_name: dto.stage_name } });
            if (existing) throw new ConflictException('Nghệ danh này đã có người sử dụng.');
        }
        artist.stage_name = dto.stage_name;
    }
    if (dto.bio) artist.bio = dto.bio;

    // Cập nhật avatar (nếu có file mới)
    if (avatarFile) {
        // Cần xóa file avatar cũ (nếu có)
        // ... (logic xóa file cũ) ...
        
        // Cập nhật đường dẫn avatar mới
        artist.avatar_url = `/uploads/avatars/${avatarFile.filename}`;
    }

    return this.artistRepository.save(artist);
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
}