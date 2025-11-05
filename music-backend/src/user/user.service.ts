// music-backend/src/user/user.service.ts (BẢN SỬA LỖI "DELETE" VÀ "RELATIONS")
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto'; 

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * HÀM: Tìm user bằng ID (dùng cho 'me')
   */
  async findById(id: number): Promise<Omit<User, 'password' | 'otp'>> { 
    const user = await this.userRepository.findOne({ 
        where: { id },
        // === SỬA LỖI: THÊM 'artist' VÀO ĐÂY ===
        relations: ['role', 'playlists', 'likedSongs', 'artist'] 
        // =====================================
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }
    
    const { password, otp, ...result } = user;
    return result; 
  }

  /**
   * HÀM: Cập nhật thông tin (Họ tên, Giới tính, Năm sinh)
   */
  async updateProfile(userId: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password' | 'otp'>> { 
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng.');
    }
    
    const { username, gender, birth_year } = updateUserDto;
    
    if (username !== undefined) user.username = username;
    if (gender !== undefined) user.gender = gender;
    
    if (birth_year === null || birth_year === undefined ) {
        user.birth_year = null;
    } else {
        user.birth_year = Number(birth_year); // Đảm bảo là number
    }
    
    const savedUser = await this.userRepository.save(user);
    
    const { password, otp, ...result } = savedUser;
    return result;
  }

  /**
   * HÀM: Lấy Profile CÔNG KHAI
   */
  async findPublicProfileByUsername(username: string): Promise<Omit<User, 'password' | 'email' | 'otp'>> { 
    const user = await this.userRepository.findOne({ 
        where: { username: username, active: 1 },
        relations: [
            'playlists', 'playlists.songs',
            'likedSongs', 'likedSongs.song', 'likedSongs.song.artist', 'likedSongs.song.album',
            'following', 'following.following', 'following.following.artist' 
        ] 
    });
    
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng này.');
    }

    if (user.playlists) {
        user.playlists = user.playlists.filter(pl => pl.is_private === 0 && pl.is_active === 1);
    }
    if (user.following) {
        user.following = user.following.filter(f => f.active === 1);
    }
    
    const { 
      password, 
      email, 
      otp, 
      ...publicProfile 
    } = user;

    return publicProfile; 
  }
}