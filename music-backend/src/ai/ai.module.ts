// music-backend/src/ai/ai.module.ts (BẢN SỬA LỖI CIRCULAR DEPENDENCY)
import { Module, forwardRef } from '@nestjs/common'; // <-- IMPORT forwardRef
import { AiService } from './ai.service';
import { HttpModule } from '@nestjs/axios';
import { AiController } from './ai.controller'; 
import { SongModule } from '../song/song.module'; // <-- IMPORT MODULE

@Module({
  imports: [
    HttpModule,
    // === FIX LỖI: DÙNG forwardRef CHO SONG MODULE ===
    forwardRef(() => SongModule) 
    // ===============================================
  ], 
  controllers: [AiController], 
  providers: [AiService],
  exports: [AiService], // Vẫn export AiService
})
export class AiModule {}