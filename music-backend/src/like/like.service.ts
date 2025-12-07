// music-backend/src/like/like.service.ts (FULL CODE)
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLikedSongs } from './user-liked-songs.entity';

@Injectable()
export class LikeService {
    constructor(
        @InjectRepository(UserLikedSongs)
        private likedRepository: Repository<UserLikedSongs>,
    ) {}

    /**
     * THÊM/XÓA (Toggle) bài hát
     */
    async toggleLike(userId: number, songId: number): Promise<boolean> {
        if (!userId) throw new InternalServerErrorException("User ID is missing.");
        
        const existingLike = await this.likedRepository.findOne({
            where: { user_id: userId, song_id: songId }
        });

        if (existingLike) {
            await this.likedRepository.delete({ user_id: userId, song_id: songId });
            return false;
        } else {
            await this.likedRepository.save({ user_id: userId, song_id: songId });
            return true;
        }
    }
    
    /**
     * KIỂM TRA: User đã thích bài hát này chưa
     */
    async isLiked(userId: number, songId: number): Promise<boolean> {
        if (!userId) return false; 
        
        const existingLike = await this.likedRepository.findOne({
            where: { user_id: userId, song_id: songId }
        });
        return !!existingLike; 
    }

    /**
     * === HÀM MỚI: Lấy danh sách bài hát yêu thích của User ===
     */
    async findUserLikedSongs(userId: number): Promise<UserLikedSongs[]> {
        if (!userId) return [];

        // Tìm tất cả các mục trong bảng liên kết,
        // và JOIN (tải) thông tin chi tiết của bài hát (song)
        return this.likedRepository.find({
            where: { user_id: userId },
            // QUAN TRỌNG: Lấy (JOIN) dữ liệu từ các bảng liên quan
            relations: [
                'song', 
                'song.songArtists',       // Bảng trung gian
                'song.songArtists.artist',// Lấy artist của bài hát
                'song.album' // Lấy album của bài hát
            ], 
            order: {
                liked_at: 'DESC' // Sắp xếp theo ngày thích mới nhất
            }
        });
    }
}