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
    async findUserLikedSongs(userId: number) {
        if (!userId) return [];

        return this.likedRepository
            .createQueryBuilder('like')
            .leftJoinAndSelect('like.song', 'song')
            .leftJoinAndSelect('song.songArtists', 'sa', 'sa.active = 1')
            .leftJoinAndSelect('sa.artist', 'artist', 'artist.active = 1')
            .leftJoinAndSelect('song.album', 'album')
            .where('like.user_id = :userId', { userId })
            .andWhere('song.active = 1')
            .andWhere('song.status = "APPROVED"')
            .orderBy('like.liked_at', 'DESC')
            .getMany();
    }
}