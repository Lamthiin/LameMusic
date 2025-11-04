// music-backend/src/user/user.service.ts (FULL CODE)
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from '../auth/dto/update-user.dto'; 

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * HÀM MỚI: Tìm user bằng ID (dùng cho 'me')
   */
  async findById(id: number): Promise<Omit<User, 'password'>> { 
    const user = await this.userRepository.findOne({ 
        where: { id },
        relations: ['role', 'playlists', 'likedSongs','artist'] 
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }
    
    const { password, ...result } = user;
    return result; 
  }

  /**
   * HÀM MỚI: Cập nhật thông tin (Họ tên, Giới tính, Năm sinh)
   */
  async updateProfile(userId: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> { 
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng.');
    }
    
    // Cập nhật các trường được phép
    Object.assign(user, updateUserDto);
    
    const savedUser = await this.userRepository.save(user);
    
    const { password, ...result } = savedUser;
    return result;
  }
/**
   * HÀM MỚI: Lấy Profile CÔNG KHAI (Chỉ playlist/like công khai)
   */
  async findPublicProfileByUsername(username: string): Promise<Omit<User, 'password' | 'email'>> {
    const user = await this.userRepository.findOne({ 
        where: { username: username, active: 1 },
        // Lấy các quan hệ cần thiết
        relations: [
            'playlists', 'playlists.songs', // Playlist
            'likedSongs', 'likedSongs.song', // Bài hát yêu thích
            'following', 'following.following', 'following.following.artist' // Người đang theo dõi
        ] 
    });
    
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng này.');
    }

    // === LỌC LẠI DỮ LIỆU CÔNG KHAI ===
    if (user.playlists) {
        user.playlists = user.playlists.filter(pl => pl.is_private === 0 && pl.is_active === 1);
    }
    if (user.following) {
        user.following = user.following.filter(f => f.active === 1);
    }
    
    // Xóa thông tin nhạy cảm
    const { 
      password, email, verification_token, 
      otp_expiry,
      ...publicProfile 
    } = user;

    return publicProfile;
  }
}