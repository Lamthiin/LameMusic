// src/song/song.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
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
  image_url: string;

  // Quan hệ: Nhiều Song thuộc 1 Album (Album có thể null)
  @ManyToOne(() => Album, (album) => album.songs, { 
    nullable: true, 
    onDelete: 'SET NULL' 
  })
  @JoinColumn({ name: 'album_id' })
  album: Album;

  // Quan hệ: Nhiều Song thuộc 1 Artist
  @ManyToOne(() => Artist, (artist) => artist.songs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  // Quan hệ: Một Song có một Lyrics (1-1)
  @OneToOne(() => Lyrics, (lyrics) => lyrics.song)
  lyrics: Lyrics;

  // Quan hệ: Bài hát này được thích bởi những User nào
  @OneToMany(() => UserLikedSongs, (likedSong) => likedSong.song)
  likedByUsers: UserLikedSongs[]; // <-- THÊM DÒNG NÀY
}