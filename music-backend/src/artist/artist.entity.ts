// music-backend/src/artist/artist.entity.ts (FULL CODE ĐÚNG)
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToOne, 
  JoinColumn,
  OneToMany
} from 'typeorm';
import { User } from '../user/user.entity';
import { Album } from '../album/album.entity';
import { Song } from '../song/song.entity';

@Entity('Artist')
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  user_id: number; // Foreign Key

  @Column({ length: 100 })
  stage_name: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column({ length: 255, nullable: true })
  avatar_url: string;

  @Column({ type: 'tinyint', default: 1 }) 
  active: number; // 0=Inactive, 1=Active

  @Column({ type: 'varchar', length: 20, default: 'PENDING', name: 'registration_status' }) 
  registrationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Quan hệ 1:1 với User (User là Artist này)
  @OneToOne(() => User, (user) => user.artist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // Chỉ định cột user_id là FK
  user: User;
  
  // Quan hệ 1:N với Album
  @OneToMany(() => Album, (album) => album.artist)
  albums: Album[];

  // Quan hệ 1:N với Song
  @OneToMany(() => Song, (song) => song.artist)
  songs: Song[];
}