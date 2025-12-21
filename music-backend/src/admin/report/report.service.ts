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

  async restoreReport(id: number) {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['song', 'song.songArtists', 'song.songArtists.artist', 'user'],
    });

    if (!report) throw new NotFoundException('Report không tồn tại');

    const song = report.song;
    if (!song) throw new NotFoundException('Không tìm thấy bài hát liên quan');

    // ------------------------------------
    // Lấy nghệ sĩ CHÍNH của bài hát
    // ------------------------------------
    const primaryArtist = song.songArtists.find(sa => sa.is_primary);

    const artist = primaryArtist ? primaryArtist.artist : null;

    // ------------------------------------
    // Khôi phục bài hát
    // ------------------------------------
    song.active = true;
    song.status = 'APPROVED';
    await this.songRepo.save(song);

    // ------------------------------------
    // Cập nhật trạng thái report
    // ------------------------------------
    report.status = ReportStatus.REJECTED;
    await this.reportRepo.save(report);

    // ============================================================
    // 1. Gửi notification cho NGƯỜI GỬI REPORT
    // ============================================================
    const notiUser = this.notiRepo.create({
      user_id: report.userId,
      artist_id: null,
      message: `Bài hát "${song.title}" đã được khôi phục sau khi xem xét lại.`,
      type: NotificationType.ADMIN_MESSAGE,
      reference_id: song.id,
      is_read: false,
    });

    await this.notiRepo.save(notiUser);

    // ============================================================
    // 2. Gửi notification cho NGHỆ SĨ CHÍNH (nếu có)
    //    Không gửi nếu artist.user_id = null (admin tạo)
    // ============================================================
    if (artist && artist.user_id !== null) {
      const notiArtist = this.notiRepo.create({
        user_id: artist.user_id,     // gửi notification cho User của nghệ sĩ
        artist_id: artist.id,
        message: `Bài hát "${song.title}" của bạn đã được khôi phục.`,
        type: NotificationType.ADMIN_MESSAGE,
        reference_id: song.id,
        is_read: false,
      });

      await this.notiRepo.save(notiArtist);
    }

    return {
      message: 'Khôi phục thành công',
      report,
      song,
    };
  }

}
