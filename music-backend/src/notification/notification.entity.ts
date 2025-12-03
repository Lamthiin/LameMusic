// music-backend/src/notification/notification.entity.ts
import { 
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, 
    CreateDateColumn 
} from 'typeorm';
import { User } from '../user/user.entity'; 
import { Artist } from '../artist/artist.entity'; 

export enum NotificationType {
    NEW_SONG = 'NEW_SONG', 
    NEW_ALBUM = 'NEW_ALBUM', 
    ARTIST_PROFILE_APPROVED = 'ARTIST_PROFILE_APPROVED', 
    SONG_APPROVED = 'SONG_APPROVED',                     
    ADMIN_MESSAGE = 'ADMIN_MESSAGE',
}

@Entity('Notification')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    // 1. NGƯỜI NHẬN (USER ID - BẮT BUỘC)
    @Column({ name: 'user_id' })
    user_id: number; 

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    recipient: User; 

    // 2. NGUỒN SỰ KIỆN (ARTIST ID - FK TỚI Artist.id - CÓ THỂ NULL)
    @Column({ name: 'artist_id', nullable: true })
    artist_id: number | null; 

    @ManyToOne(() => Artist, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'artist_id' })
    sourceArtist: Artist | null; 

    
    @Column({ length: 255 })
    message: string; 

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column({ name: 'reference_id', type: 'int', nullable: true }) // <-- THÊM type: 'int'
    reference_id: number | null;

    @Column({ default: false, name: 'is_read' })
    is_read: boolean;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;
}