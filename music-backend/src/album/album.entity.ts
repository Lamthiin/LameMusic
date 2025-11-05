// src/album/album.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { Artist } from '../artist/artist.entity';
import { Song } from '../song/song.entity';

@Entity('Album') // Ánh xạ với bảng 'Album'
export class Album {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'date', nullable: true })
  release_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cover_url: string | null;

  @Column({ type: 'text', nullable: true })
  info: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Quan hệ: Nhiều Album thuộc 1 Artist
  @ManyToOne(() => Artist, (artist) => artist.albums, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  // Quan hệ: Một Album có nhiều Song
  @OneToMany(() => Song, (song) => song.album)
  songs: Song[];
}