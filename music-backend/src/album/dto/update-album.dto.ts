// music-backend/src/album/dto/update-album.dto.ts (TẠO MỚI)
import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class UpdateAlbumDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsDateString()
  release_date?: string;
}