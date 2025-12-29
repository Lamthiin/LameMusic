// music-backend/src/otp/otp.entity.ts (TẠO MỚI)
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('otp')
export class Otp {
  
  @PrimaryColumn({ name: 'user_id' }) // Đặt user_id làm Khóa chính
  user_id: number;

  @Column({ length: 10 })
  code: string;

  @Column({ type: 'datetime' })
  expires_at: Date;

  // Quan hệ 1:1 ngược lại với User
  @OneToOne(() => User, user => user.otp)
  @JoinColumn({ name: 'user_id' }) // Chỉ định cột join
  user: User;
}