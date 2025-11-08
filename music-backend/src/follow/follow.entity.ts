// music-backend/src/follow/follow.entity.ts (BẢN SỬA FINAL)
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Artist } from '../artist/artist.entity'; 

@Entity('follow')
export class Follow {
  
  @PrimaryColumn({ type: 'int', name: 'follower_id' })
  followerId: number; 

  @PrimaryColumn({ type: 'int', name: 'following_id' })
  followingId: number; // <-- KHÓA NGOẠI TỚI ARTIST.ID

  // 1. Quan hệ với User (Người theo dõi)
  @ManyToOne(() => User, user => user.following)
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  // 2. Quan hệ với Artist (Người được theo dõi)
  @ManyToOne(() => Artist, artist => artist.followers) // artist.followers (trong Artist.entity.ts)
  @JoinColumn({ name: 'following_id' }) // <-- Trỏ tới Artist.id
  following: Artist; 

  @Column({ type: 'tinyint', default: 1 })
  active: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;
}