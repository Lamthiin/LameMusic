// music-backend/src/history/history.service.ts (LOGIC LỊCH SỬ NGHE)
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// Fix: Import LessThan và các operator
import { Repository, LessThan, FindManyOptions } from 'typeorm'; 
import { History } from './history.entity';
import { User } from '../user/user.entity';
import { Song } from '../song/song.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private historyRepository: Repository<History>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
  ) {}

  /**
   * Ghi lại lịch sử nghe của người dùng (Có kiểm tra trùng lặp gần đây)
   */
  async logPlayback(userId: number, songId: number, duration: number = 30): Promise<History> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const song = await this.songRepository.findOne({ where: { id: songId } });

    if (!user) throw new NotFoundException(`User ID ${userId} không tồn tại.`);
    if (!song) throw new NotFoundException(`Bài hát ID ${songId} không tồn tại.`);
    
    // Đảm bảo không ghi log cùng bài hát quá 1 lần/ngày
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1); 

    const recentEntry = await this.historyRepository.findOne({
        where: {
            // Lọc bằng các cột FK (userId, songId)
            userId: userId, 
            songId: songId, 
            listenedAt: LessThan(oneDayAgo) // Tìm bản ghi cũ hơn 24h
        },
        order: { listenedAt: 'DESC' }
    });
    
    if (recentEntry && recentEntry.listenedAt > oneDayAgo) {
         // Có log trong vòng 24h, BỎ QUA việc tạo bản ghi MỚI
         return recentEntry; 
    }

    // Tạo và lưu log mới
    const historyEntry = this.historyRepository.create({
      user: user,
      song: song,
      durationListened: duration,
      listenedAt: new Date(),
    });

    return this.historyRepository.save(historyEntry);
  }

  /**
   * Lấy lịch sử nghe (để tính toán vector ưu tiên)
   */
  async getUserListenHistory(userId: number, limit: number = 100): Promise<History[]> {
      return this.historyRepository.find({
          where: { user: { id: userId } },
          // Phải lấy cả thông tin bài hát (để có embedding)
          relations: ['song'], 
          order: { listenedAt: 'DESC' },
          take: limit,
      });
  }
}