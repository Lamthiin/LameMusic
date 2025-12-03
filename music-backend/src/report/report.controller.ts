import { Controller, Post, Body, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtPayload } from '../auth/jwt.strategy';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * POST /report
   * Gửi một báo cáo vi phạm mới
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createReport(
    @Req() req: any, 
    @Body(ValidationPipe) dto: CreateReportDto
  ) {
    const userId = (req.user as JwtPayload).userId; // Lấy userId từ token
    
    // Gọi hàm Service để tạo báo cáo
    const report = await this.reportService.createReport(userId, dto);
    
    return {
      message: 'Báo cáo của bạn đã được gửi thành công và đang chờ xem xét.',
      reportId: report.id,
      status: report.status,
    };
  }
}