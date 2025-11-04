// music-backend/src/artist/dto/artist-registration.dto.ts (TẠO MỚI)
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ArtistRegistrationDto {
  @IsString({ message: 'Tên nghệ danh phải là chuỗi.' })
  @IsNotEmpty({ message: 'Tên nghệ danh không được để trống.' })
  @MaxLength(100, { message: 'Tên nghệ danh quá dài.' })
  stageName: string;
}