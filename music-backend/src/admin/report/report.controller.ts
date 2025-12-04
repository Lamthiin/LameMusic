import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportStatus } from '../../report/report.entity';

@Controller('admin/report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // Lấy danh sách report theo trạng thái
  @Get()
  getReports(@Query('status') status?: ReportStatus) {
    return this.reportService.getReports(status);
  }

  // Resolve
  @Patch(':id/resolve')
  resolveReport(@Param('id') id: number) {
    return this.reportService.updateStatus(Number(id), ReportStatus.RESOLVED);
  }

  // Reject
  @Patch(':id/reject')
  rejectReport(@Param('id') id: number) {
    return this.reportService.updateStatus(Number(id), ReportStatus.REJECTED);
  }
}
