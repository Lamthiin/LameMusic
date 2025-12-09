import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class CreateSongDto {
  @IsString()
  title: string;

  // artistId
  @IsNumberString()
  artist: string;

  // albumId (nullable)
  @IsOptional()
  @IsString()
  album?: string;

  // categoryId
  @IsNumberString()
  category: string;

  // lyrics (optional)
  @IsOptional()
  @IsString()
  lyrics?: string;

  @IsOptional()
  @IsString()
  lyricsLanguage?: string;

  // Collab artists (FE gửi JSON string)
  @IsOptional()
  @IsString()
  featuredArtists?: string;
}
