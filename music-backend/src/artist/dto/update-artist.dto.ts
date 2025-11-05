// music-backend/src/artist/dto/update-artist.dto.ts (TẠO MỚI)
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateArtistDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  stage_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;
}