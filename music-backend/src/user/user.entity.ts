// music-backend/src/user/user.entity.ts (BẢN SỬA LỖI CRASH 500)
import { 
  Entity, PrimaryGeneratedColumn, Column, 
  ManyToOne, OneToOne, JoinColumn, OneToMany, 
  CreateDateColumn, UpdateDateColumn 
} from 'typeorm';
import { Role } from '../role/role.entity';
import { Artist } from '../artist/artist.entity';
import { UserLikedSongs } from '../like/user-liked-songs.entity';
import { Playlist } from '../playlist/playlist.entity';
// (XÓA: import { Post } from '../post/post.entity';)

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255, select: false }) // select: false (không trả về pass)
  password: string;

  @Column({ type: 'tinyint', default: 2 }) // 0=Banned, 1=Active, 2=Pending
  active: number; 

  @Column({ type: 'varchar', length: 255, nullable: true, select: false }) 
  verification_token: string | null; // Mã OTP

  @Column({ type: 'datetime', nullable: true, select: false }) 
  otp_expiry: Date | null; // Hạn OTP


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

  @OneToMany(() => Playlist, playlist => playlist.user)
  playlists: Playlist[]; 

  // === (4 DÒNG NÀY GÂY LỖI - ĐÃ XÓA) ===
  // @OneToMany(() => Post, post => post.author)
  // posts: Post[];
  // ==================================
}