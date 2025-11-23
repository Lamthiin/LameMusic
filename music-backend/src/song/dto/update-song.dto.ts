// music-backend/src/song/dto/update-song.dto.ts (SỬA LỖI VALIDATION)
import { IsString, IsOptional, IsNumberString } from 'class-validator';

export class UpdateSongDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  genre?: string; // <-- KHÔNG CÓ @IsNumberString

  @IsOptional()
    // FIX QUAN TRỌNG: Validation phải là điều kiện OR (Là chuỗi số HOẶC là chuỗi rỗng)
    // Cách an toàn nhất là loại bỏ @IsNumberString và xử lý parse/validation trong Service.
  @IsString() 
  albumId?: string;
  

  @IsOptional()
  @IsNumberString()
  track_number?: string;
}