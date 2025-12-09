// src/admin/manage-song/dto/update-song.dto.ts
import { IsOptional, IsString, IsNumberString, IsArray } from 'class-validator';

export class UpdateSongDto {
  @IsOptional()
  @IsString()
  title?: string;

  // artistId (number string)
  @IsOptional()
  @IsNumberString()
  artist?: string;

  // albumId (nullable)
  @IsOptional()
  @IsString()
  album?: string;

  // categoryId
  @IsOptional()
  @IsNumberString()
  category?: string;

  @IsOptional()
  @IsNumberString()
  duration?: string;

  @IsOptional()
  @IsString()
  lyrics?: string;

  @IsOptional()
  @IsString()
  lyricsLanguage?: string;

  // ⭐ NEW: nghệ sĩ collab – FE gửi JSON string
  @IsOptional()
  @IsString()
  featuredArtists?: string;
}
