// music-backend/src/playlist/entities/playlist.entity.ts (FULL CODE FINAL)
import { Entity, PrimaryGeneratedColumn, Column,OneToMany, ManyToOne, ManyToMany, JoinColumn, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity'; 
import { Song } from '../song/song.entity'; 
import { PlaylistSong } from './playlist-song.entity';

@Entity('Playlist')
export class Playlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; 

  // 1. CỘT XÓA MỀM (is_active)
  @Column({ type: 'tinyint', default: 1, name: 'is_active' }) 
  is_active: number; 

  // 2. CỘT RIÊNG TƯ/CÔNG KHAI (is_private)
  @Column({ type: 'tinyint', default: 0, name: 'is_private' }) 
  is_private: number; 

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 1. Mối quan hệ N:1 với User (Chủ sở hữu)
  @ManyToOne(() => User, user => user.playlists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 2. Mối quan hệ Many-to-Many với Song
  @ManyToMany(() => Song)
  @JoinTable({ 
    name: 'Playlist_Songs', 
    joinColumn: { name: 'playlist_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'song_id', referencedColumnName: 'id' },
  })
  songs: Song[];
  // 2. Mối quan hệ One-to-Many với Bảng trung gian PlaylistSong
    @OneToMany(() => PlaylistSong, playlistSong => playlistSong.playlist)
    playlistSongs: PlaylistSong[]; // <-- Thay thế cho 'songs: Song[]' cũ
}