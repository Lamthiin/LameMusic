// src/admin/manage-song/dto/update-song.dto.ts

import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class UpdateSongDto {
  
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  artist?: string;   // stage_name

  @IsOptional()
  @IsString()
  album?: string;    // title album (có thể rỗng hoặc null)

  @IsOptional()
  @IsNumberString()
  category?: string;   // FE gửi categoryId


  @IsOptional()
  @IsNumberString()
  duration?: string;  // FE đang gửi string, backend convert sang number

  // ⭐ Thêm field lyrics
  @IsOptional()
  @IsString()
  lyrics?: string;

  // ⭐ Thêm field language của lyrics
  @IsOptional()
  @IsString()
  lyricsLanguage?: string;
}
