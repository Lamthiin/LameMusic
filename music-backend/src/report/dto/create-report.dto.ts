import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsInt()
  @IsNotEmpty()
  songId: number; // ID Bài hát bị báo cáo

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string; // Tiêu đề/Lý do chính

  @IsString()
  description: string; // Mô tả chi tiết (Optional)
}