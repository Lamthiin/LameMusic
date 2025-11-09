// music-backend/src/history/dto/log-playback.dto.ts (TẠO MỚI)
import { IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class LogPlaybackDto {
    @IsOptional()
    @IsNumber()
    durationListened?: number;
}