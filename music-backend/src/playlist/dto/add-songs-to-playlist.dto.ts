import { IsNumber, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class AddSongsToPlaylistDto {
  // Chỉ cần ID bài hát, vì Playlist ID sẽ lấy từ Param
  
  @IsArray()
  @ArrayNotEmpty() 
  // Kiểm tra từng phần tử trong mảng phải là số nguyên
  @IsInt({ each: true }) 
  @IsNumber({}, { each: true })
  songIds: number[];
}