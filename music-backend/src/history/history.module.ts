// music-backend/src/history/history.module.ts (TẠO MỚI FILE NÀY)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { History } from './history.entity';
import { User } from '../user/user.entity'; 
import { Song } from '../song/song.entity'; 

// Components
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';

// Imports cần thiết: AuthModule (nếu bạn có)
// Nếu AuthModule chưa được tạo, bạn có thể comment dòng dưới hoặc tạo file rỗng trước
import { AuthModule } from '../auth/auth.module'; 

@Module({
    // Đăng ký các Entity mà HistoryService cần truy cập
    imports: [
        TypeOrmModule.forFeature([History, User, Song]),
        AuthModule // Cần AuthModule để sử dụng Guards và Decorators
    ],
    providers: [HistoryService],
    controllers: [HistoryController],
    // Export HistoryService để SongService có thể tiêm (inject) nó
    exports: [HistoryService] 
})
export class HistoryModule {}