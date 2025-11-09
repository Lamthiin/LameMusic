// music-backend/src/history/history.entity.ts (BẢN SỬA LỖI FINAL)
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, // <-- PHẢI CÓ 'Column' Ở ĐÂY
    ManyToOne, 
    CreateDateColumn, 
    JoinColumn, 
    Index 
} from 'typeorm';
import { User } from '../user/user.entity';
import { Song } from '../song/song.entity';

@Entity('history') // Tên bảng
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  // === FIX LỖI CRASH: Chỉ định TYPE: 'int' và đảm bảo @Column được import ===
  @Column({ name: 'duration_listened', type: 'int', nullable: true }) // <-- Đã thêm type: 'int'
  durationListened: number | null; 

  @CreateDateColumn({ name: 'listened_at', type: 'timestamp' })
  listenedAt: Date;

  // Khóa ngoại dạng cột
  @Column({ name: 'user_id' })
  @Index()
  userId: number; 

  @Column({ name: 'song_id' })
  @Index()
  songId: number; 
  // =========================================================================


  // Mối quan hệ với User
  @ManyToOne(() => User, user => user.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) 
  user: User;

  // Mối quan hệ với Song
  @ManyToOne(() => Song, song => song.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'song_id' })
  song: Song;
}