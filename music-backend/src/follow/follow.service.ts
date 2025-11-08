// music-backend/src/follow/follow.service.ts (BẢN SỬA LỖI KHÓA NGOẠI FINAL)
import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './follow.entity';
import { Artist } from '../artist/artist.entity'; 
import { User } from '../user/user.entity';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(User)
    private userRepository: Repository<User>, 
    @InjectRepository(Artist) 
    private artistRepository: Repository<Artist>,
  ) {}

  /**
   * Logic: Follow hoặc Unfollow một nghệ sĩ
   * @param userId: ID của người theo dõi (Listener)
   * @param artistProfileId: ID HỒ SƠ ARTIST (Artist.id) <-- INPUT CHÍNH XÁC
   */
  async toggleFollow(userId: number, artistProfileId: number): Promise<{ isFollowing: boolean }> {
    
    // === (1) TÌM HỒ SƠ ARTIST ĐÃ DUYỆT ===
    const targetArtist = await this.artistRepository.findOne({
        where: { 
            id: artistProfileId, // <-- TÌM BẰNG ID HỒ SƠ ARTIST
            registrationStatus: 'APPROVED',
            active: 1
        },
        relations: ['user'] // Lấy User để kiểm tra tự follow
    });

    if (!targetArtist) {
        throw new NotFoundException('Hồ sơ Nghệ sĩ không tồn tại hoặc chưa được duyệt.');
    }

    // Kiểm tra tự follow: so sánh User ID của người theo dõi với User ID của Artist
    if (userId === targetArtist.user.id) {
      throw new BadRequestException('Bạn không thể tự theo dõi chính mình.');
    }
    // ===============================================

    // 2. Kiểm tra xem đã theo dõi chưa (Lưu theo ID Hồ sơ Artist)
    const existingFollow = await this.followRepository.findOne({
      where: {
        followerId: userId,
        followingId: artistProfileId, // <-- LƯU ID HỒ SƠ ARTIST (Artist.id)
      },
    });

    if (existingFollow) {
      // Đã tồn tại -> Đảo ngược trạng thái
      if (existingFollow.active === 1) {
        existingFollow.active = 0;
        await this.followRepository.save(existingFollow);
        return { isFollowing: false };
      } else {
        // Đang Unfollow (active=0) -> Follow lại
        existingFollow.active = 1;
        await this.followRepository.save(existingFollow);
        return { isFollowing: true };
      }
    } else {
      // Chưa tồn tại -> Tạo mới (Follow)
      const newFollow = this.followRepository.create({
        followerId: userId,
        followingId: artistProfileId, // <-- LƯU ID HỒ SƠ ARTIST
        active: 1, 
      });
      await this.followRepository.save(newFollow);
      return { isFollowing: true };
    }
  }

  /**
   * === HÀM KIỂM TRA TRẠNG THÁI FOLLOW ===
   */
  async checkFollowStatus(userId: number, artistProfileId: number): Promise<{ isFollowing: boolean }> {
    if (!userId) return { isFollowing: false };

    // Cần kiểm tra trạng thái APPROVED trước 
    const targetArtist = await this.artistRepository.findOne({
        where: { 
            id: artistProfileId, // <-- TÌM BẰNG ID HỒ SƠ ARTIST
            registrationStatus: 'APPROVED',
            active: 1
        }
    });

    if (!targetArtist) {
        return { isFollowing: false }; 
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: userId,
        followingId: artistProfileId, // <-- TÌM BẰNG ID HỒ SƠ ARTIST
        active: 1, 
      },
    });

    return { isFollowing: !!follow }; 
  }

  

/**
   * === HÀM LẤY DANH SÁCH USER ĐANG THEO DÕI (FIX TRỰC TIẾP ARTIST) ===
   */
  async findMyFollowing(userId: number): Promise<any[]> {
    
    // === FIX LỖI: Load quan hệ TRỰC TIẾP đến ARTIST ===
    // 'following' trong entity giờ đã là Artist Entity.
    const follows = await this.followRepository.find({
        where: { 
            followerId: userId, 
            active: 1 
        },
        // CHỈ CẦN RELATIONS: ['following']
        relations: ['following'], 
        order: { createdAt: 'DESC' }
    });

    // Lọc trên Node.js để loại bỏ những Artist chưa được duyệt hoặc bị vô hiệu hóa
    // Dữ liệu giờ là follows[i].following (là Artist Entity)
    return follows.filter(follow => 
        follow.following?.registrationStatus === 'APPROVED' &&
        follow.following?.active === 1
    );
  } 
}