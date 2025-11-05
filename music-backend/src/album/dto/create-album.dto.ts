// music-backend/src/album/dto/create-album.dto.ts (TẠO MỚI)
import { IsString, IsNotEmpty, MaxLength, IsDateString } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống.' })
  @MaxLength(100)
  title: string;

  @IsDateString({}, { message: 'Ngày phát hành phải là định dạng ngày tháng (YYYY-MM-DD).' })
  @IsNotEmpty({ message: 'Ngày phát hành không được để trống.' })
  release_date: string; // Sẽ nhận chuỗi 'YYYY-MM-DD' từ input type="date"
}