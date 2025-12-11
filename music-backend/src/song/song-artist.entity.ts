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

     @Column({ name: 'is_primary', type: 'tinyint', width: 1, default: 0 })
    is_primary: boolean;

    @Column({ name: 'active', type: 'tinyint', width: 1, default: 1 })
    active: boolean;

    // SỬA: Xóa { primary: true }
    @ManyToOne(() => Song, song => song.songArtists, {
        nullable: false,        // 1
        onDelete: 'CASCADE',    // 2
    })
    @JoinColumn({ name: 'song_id' })
    song: Song;

    // SỬA: Xóa { primary: true }
   @ManyToOne(() => Artist, artist => artist.songArtists, {
        nullable: false,        // 3
        onDelete: 'CASCADE',    // 4
    })
    @JoinColumn({ name: 'artist_id' })
    artist: Artist;
}