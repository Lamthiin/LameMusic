import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity'; 

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  // Thiết lập mối quan hệ để NestJS hiểu khóa ngoại
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  roomId: string;

  @Column('text')
  content: string;

  @Column({ default: false }) // Cột trạng thái đã đọc
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}