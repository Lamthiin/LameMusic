// src/song/song.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, // <-- PHẢI CÓ DÒNG NÀY!
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  OneToOne, 
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Album } from '../album/album.entity';
import { Artist } from '../artist/artist.entity';
import { Lyrics } from '../lyrics/lyrics.entity';
import { UserLikedSongs } from '../like/user-liked-songs.entity'; // <-- THÊM DÒNG NÀY
import { Category } from '../category/category.entity';
import { History } from '../history/history.entity'; // <-- (1) IMPORT HISTORY

@Entity('Song') // Ánh xạ với bảng 'Song'
export class Song {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  duration: number; // Đơn vị: giây

  @Column({ type: 'varchar', length: 255 })
  file_url: string;

  @Column({ type: 'int', nullable: true, name: 'track_number' })
  track_number: number | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // === THÊM CỘT MỚI ===
  @Column({ length: 50, nullable: true })
  genre: string;

  @Column({ length: 255, nullable: true, name: 'image_url' })
  image_url?: string; // <-- sửa null thành undefined / optional


  // === CỘT MỚI: TRẠNG THÁI DUYỆT ===
  @Column({ type: 'varchar', length: 20, default: 'PENDING' }) 
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; 
  // ===================================

  
  // Quan hệ: Nhiều Song thuộc 1 Album (Album có thể null)
// === (2) SỬA LỖI: CHO PHÉP ALBUM LÀ NULL TRONG QUAN HỆ ===
  @ManyToOne(() => Album, (album) => album.songs, { 
    nullable: true, // <-- THÊM nullable: true
    onDelete: 'SET NULL' 
  })
  @JoinColumn({ name: 'album_id' })
  album: Album | null; // <-- THÊM | null

  @Column({ type: 'int', default: 0 })
  play_count: number; // <--- thêm cột này

  // === CỘT MỚI: EMBEDDING ===
  @Column({ type: 'json', nullable: true })
  embedding: number[] | null; // Lưu trữ mảng số (vector)

  // Quan hệ: Nhiều Song thuộc 1 Artist
  @ManyToOne(() => Artist, (artist) => artist.songs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  // Quan hệ: Một Song có một Lyrics (1-1)
  @OneToOne(() => Lyrics, (lyrics) => lyrics.song)
  lyrics: Lyrics | null;

  // Quan hệ: Bài hát này được thích bởi những User nào
  @OneToMany(() => UserLikedSongs, (likedSong) => likedSong.song)
  likedByUsers: UserLikedSongs[]; // <-- THÊM DÒNG NÀY

  // === (2) THÊM QUAN HỆ NGƯỢC LẠI (FIX LỖI TS2339) ===
  @OneToMany(() => History, history => history.song)
  history: History[];
}