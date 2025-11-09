// music-backend/src/user/user.entity.ts (BẢN SỬA LỖI TS2790)
import { 
  Entity, PrimaryGeneratedColumn, Column, 
  ManyToOne, OneToOne, JoinColumn, OneToMany, 
  CreateDateColumn, UpdateDateColumn 
} from 'typeorm';
import { Role } from '../role/role.entity';
import { Artist } from '../artist/artist.entity';
import { UserLikedSongs } from '../like/user-liked-songs.entity';
import { Playlist } from '../playlist/playlist.entity';
import { Follow } from '../follow/follow.entity'; // <-- (1) IMPORT FOLLOW
import { Otp } from '../totp/totp.entity'; // <-- (1) IMPORT OTP
import { History } from '../history/history.entity'; // <-- IMPORT MỚI

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email?: string; // <-- (2) THÊM '?' (Optional)

  @Column({ length: 255, select: false }) 
  password?: string; // <-- (2) THÊM '?' (Optional)

  @Column({ type: 'tinyint', default: 2 }) 
  active: number; 

  // @Column({ type: 'varchar', length: 255, nullable: true, select: false }) 
  // verification_token?: string | null; // <-- (2) THÊM '?' (Optional)

  // @Column({ type: 'datetime', nullable: true, select: false }) 
  // otp_expiry?: Date | null; // <-- (2) THÊM '?' (Optional)


  @Column({ length: 20, default: 'prefer not to say' })
  gender: string;

  @Column({ type: 'int', nullable: true })
  birth_year: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // === CÁC MỐI QUAN HỆ ===
  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToOne(() => Artist, (artist) => artist.user)
  artist: Artist; 

  @OneToMany(() => UserLikedSongs, (like) => like.user)
  likedSongs: UserLikedSongs[];

  // === (3) THÊM QUAN HỆ MỚI ===
  @OneToOne(() => Otp, otp => otp.user, { 
      cascade: true // Tự động tạo/xóa OTP khi User thay đổi
  })
  otp: Otp;

  @OneToMany(() => Playlist, playlist => playlist.user)
  playlists: Playlist[]; 

  // (Mối quan hệ Follow/Following - Đã thêm ở bước trước)
  @OneToMany(() => Follow, follow => follow.follower)
  following: Follow[]; 
  @OneToMany(() => Follow, follow => follow.following)
  followers: Follow[]; 

  // Thêm mối quan hệ với History
  @OneToMany(() => History, history => history.user)
  history: History[];
}