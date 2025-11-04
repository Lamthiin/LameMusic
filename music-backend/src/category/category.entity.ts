// music-backend/src/category/category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('Category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
  
  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true, 
    name: 'image_url' 
  })
  image_url: string;
}