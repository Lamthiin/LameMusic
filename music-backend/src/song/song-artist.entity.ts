// music-backend/src/song/song-artist.entity.ts (TẠO MỚI)
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Song } from './song.entity';
import { Artist } from '../artist/artist.entity';

@Entity('SongArtist')
export class SongArtist {
    @PrimaryColumn({ name: 'song_id' })
    song_id: number;

    @PrimaryColumn({ name: 'artist_id' })
    artist_id: number;

    @Column({ default: false, name: 'is_primary' })
    is_primary: boolean; // Chỉ định ai là nghệ sĩ chính

    // SỬA: Xóa { primary: true }
    @ManyToOne(() => Song, song => song.songArtists)
    @JoinColumn({ name: 'song_id' })
    song: Song;

    // SỬA: Xóa { primary: true }
    @ManyToOne(() => Artist, artist => artist.songArtists)
    @JoinColumn({ name: 'artist_id' })
    artist: Artist;
}