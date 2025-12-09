import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Report, ReportStatus } from '../../report/report.entity';
import { Notification, NotificationType } from '../../notification/notification.entity';
import { Song } from '../../song/song.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,

    @InjectRepository(Notification)
    private readonly notiRepo: Repository<Notification>,

    @InjectRepository(Song)
    private readonly songRepo: Repository<Song>,
  ) {}

  // ====================================================
  // 📌 1. Lấy danh sách report theo trạng thái
  // ====================================================
  async getReports(status?: ReportStatus) {
    const where = status ? { status } : {};

    return this.reportRepo.find({
      where,
      relations: ['user', 'song'],
      order: { created_at: 'DESC' },
    });
  }

  // ====================================================
  // 📌 2. Cập nhật trạng thái + gửi notification
  // ====================================================
  async updateStatus(id: number, status: ReportStatus) {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['user', 'song'],
    });

    if (!report) throw new NotFoundException('Report không tồn tại');

    // Cập nhật trạng thái report
    report.status = status;
    await this.reportRepo.save(report);


    // Nếu RESOLVED → Ẩn bài hát thay vì xoá
    if (status === ReportStatus.RESOLVED) {
      const song = report.song;
      if (song) {
        song.active = false;        // bật active nếu bạn dùng cờ này
        song.status = 'HIDDEN';    // đổi trạng thái bài hát
        await this.songRepo.save(song);
      }
    }

    // =========================
    // 📌 Tạo nội dung thông báo
    // =========================

    let message = '';
    let type = NotificationType.ADMIN_MESSAGE;

    if (status === ReportStatus.RESOLVED) {
      message = `Bài hát "${report.song.title}" đã bị gỡ sau khi kiểm duyệt báo cáo.`;
    } else {
      message = `Báo cáo về bài hát "${report.song.title}" đã bị từ chối.`;
    }

    // =========================
    // 📌 Lưu Notification vào DB
    // =========================

    const noti = this.notiRepo.create({
      user_id: report.userId,         // gửi cho người báo cáo
      artist_id: null,                // admin gửi → NULL
      message,
      type,
      reference_id: report.songId,    // liên kết bài hát liên quan
      is_read: false,
    });

    await this.notiRepo.save(noti);

    return {
      message: 'Cập nhật thành công',
      report,
      notification: noti,
    };
  }
}
