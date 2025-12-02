// music-backend/src/playlist/entities/playlist-song.entity.ts (BẢN SỬA LỖI FINAL)
import { 
    Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn 
} from 'typeorm';
import { Playlist } from './playlist.entity'; // <-- FIX: IMPORT PLAYLIST
import { Song } from '../song/song.entity'; // <-- FIX: IMPORT SONG

@Entity('Playlist_Songs')
export class PlaylistSong {
    
    // === FIX LỖI: TRỞ LẠI DÙNG ID TỰ TĂNG VÌ TYPEORM DỄ XỬ LÝ HƠN ===
    @PrimaryGeneratedColumn() 
    id: number; // <-- KHẮC PHỤC LỖI TRUY CẬP ID (TS2339)
    // =============================================================
    
    @Column({ type: 'int', name: 'playlist_id' })
    playlistId: number; 

    @Column({ type: 'int', name: 'song_id' })
    songId: number; 
    
    // Cột xóa mềm
    @Column({ type: 'tinyint', default: 1, name: 'is_active' }) 
    is_active: number; 

    @Column({ type: 'int', default: 0 }) 
    order: number;

    // Quan hệ N:1 tới Playlist (Không có primary: true ở đây)
    @ManyToOne(() => Playlist, playlist => playlist.playlistSongs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'playlist_id' })
    playlist: Playlist;

    // Quan hệ N:1 tới Song
    @ManyToOne(() => Song, song => song.playlistSongs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'song_id' })
    song: Song;
}