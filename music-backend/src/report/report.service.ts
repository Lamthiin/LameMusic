// music-backend/src/report/report.service.ts (BẢN SỬA LỖI FINAL)
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from './report.entity'; // <-- FIX 1: IMPORT ReportStatus
import { CreateReportDto } from './dto/create-report.dto';
import { Song } from '../song/song.entity';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private reportRepository: Repository<Report>,
        @InjectRepository(Song)
        private songRepository: Repository<Song>,
    ) {}

    async createReport(userId: number, dto: CreateReportDto): Promise<Report> {
        
        // 1. Kiểm tra Bài hát có tồn tại không
        const song = await this.songRepository.findOne({ 
            // FIX 2: SỬA LỖI TRUY VẤN: is_active không tồn tại trên Song
            // Giả định bạn có cột `active` trong Song Entity
            where: { id: dto.songId, active: true }, 
        });
        if (!song) {
            throw new NotFoundException('Bài hát bạn đang báo cáo không tồn tại.');
        }

        // 2. Kiểm tra Duplicate: User đã báo cáo bài hát này chưa?
        const existingReport = await this.reportRepository.findOne({
            where: { userId: userId, songId: dto.songId, status: ReportStatus.PENDING }, // <-- FIX 3: DÙNG ReportStatus
        });
        
        if (existingReport) {
            throw new BadRequestException('Bạn đã gửi báo cáo cho bài hát này và đang chờ xử lý.');
        }

        // 3. Tạo Entity Report mới
        const newReport = this.reportRepository.create({
            userId: userId,
            songId: dto.songId,
            title: dto.title,
            description: dto.description || '',
            status: ReportStatus.PENDING, // <-- FIX 4: DÙNG ReportStatus
        });

        return this.reportRepository.save(newReport);
    }
}