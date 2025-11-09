// music-backend/src/ai/ai.service.ts (SỬ DỤNG AXIOS THẬT)
import { Injectable, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common'; // <-- IMPORT Inject, forwardRef
import { HttpService } from '@nestjs/axios'; 
import { lastValueFrom } from 'rxjs'; 
import { SongService } from '../song/song.service'; // <-- IMPORT

@Injectable()
export class AiService {
  // Địa chỉ server AI của bạn
  private readonly AI_SERVER_URL = 'http://localhost:5000/api/embed'; 
  constructor(
      private httpService: HttpService, 
      // === FIX LỖI: DÙNG Inject VÀ forwardRef CHO SongService ===
      @Inject(forwardRef(() => SongService))
      private songService: SongService, 
      // ========================================================
  ) {}
  /**
   * Gọi Python Server để tạo vector nhúng
   */
  async generateSongEmbedding(songTitle: string, genre: string): Promise<number[] | null> {
    try {
      console.log(`[AI] Gọi FastAPI để tạo embedding cho: ${songTitle}`);
      
      const response = await lastValueFrom(
          // Gửi title và genre tới Server AI
          this.httpService.post(this.AI_SERVER_URL, { 
              title: songTitle, 
              genre: genre 
          })
      );
      
      // FastAPI trả về { embedding: [...] }
      if (response.data && response.data.embedding) {
        return response.data.embedding as number[];
      }
      return null;
      
    } catch (error) {
      console.error('LỖI AI SERVER (Kiểm tra FastAPI có chạy không):', error.message);
      // Trả về null khi có lỗi kết nối hoặc lỗi xử lý
      return null; 
    }
  }

  /**
   * Gọi Python Server để tìm kiếm bài hát gần nhất với Vector ưu tiên của User
   * @param userVector Vector nhúng (number[]) của sở thích người dùng
   * @returns {Promise<number | null>} ID bài hát được đề xuất
   */
  async getRecommendedSongId(userVector: number[]): Promise<number | null> {
      try {
          console.log(`[AI] Gửi vector sở thích để đề xuất...`);
          
          const response = await lastValueFrom(
              // Gửi vector trung bình tới FastAPI
              this.httpService.post('http://localhost:5000/api/recommend', { 
                  user_vector: userVector 
              })
          );
          
          if (response.data && response.data.recommended_song_id) {
              return response.data.recommended_song_id;
          }
          return null;
          
      } catch (error) {
          console.error('LỖI GỌI AI RECOMMENDATION:', error.message);
          return null;
      }
  }

  /**
   * MAINTENANCE: Tạo Embedding và Cập nhật trực tiếp vào DB
   */
  async updateSongEmbedding(songId: number, songTitle: string, genre: string): Promise<boolean> {
      const embeddingVector = await this.generateSongEmbedding(songTitle, genre);
      
      if (embeddingVector) {
          // Gọi SongService để cập nhật
          await this.songService.updateSongEmbedding(songId, embeddingVector);
          return true;
      }
      return false;
  }
}