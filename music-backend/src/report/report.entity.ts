import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity'; // <-- Khóa ngoại
import { Song } from '../song/song.entity'; // <-- Khóa ngoại

export enum ReportStatus { // <-- PHẢI EXPORT
  PENDING = 'PENDING',        
  IN_REVIEW = 'IN_REVIEW',    
  RESOLVED = 'RESOLVED',      
  REJECTED = 'REJECTED',      
}

@Entity('report')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  // Khóa ngoại tới User (Người gửi báo cáo)
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  // Khóa ngoại tới Song (Bài hát bị báo cáo)
  @ManyToOne(() => Song, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'song_id' })
  song: Song;

  @Column({ name: 'song_id' })
  songId: number;
  
  // Tiêu đề/Lý do báo cáo
  @Column({ length: 255 })
  title: string;

  // Nội dung chi tiết báo cáo
  @Column('text', { nullable: true })
  description: string;

  // Trạng thái xử lý báo cáo
  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  // Ghi chú của Admin sau khi xử lý
  @Column('text', { nullable: true })
  admin_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}