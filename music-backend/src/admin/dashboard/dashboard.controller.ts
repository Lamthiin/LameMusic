import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('top-charts')
  async getTopCharts() {
    return this.dashboardService.getTopCharts();
  }

  @Get('top-artists')
  async getTopArtists() {
    return this.dashboardService.getTopArtists();
  }



}
