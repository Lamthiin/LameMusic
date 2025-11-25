import { Controller, Get, Param, Patch } from '@nestjs/common';
import { AdminArtistService } from './artist.service';

@Controller('admin/artists')
export class AdminArtistController {
  constructor(private readonly service: AdminArtistService) {}

  @Get('pending')
  getPending() {
    return this.service.findPending();
  }

  @Get('active')
  getActive() {
    return this.service.findApproved();
  }

  @Patch(':id/approve')
  approve(@Param('id') id: number) {
    return this.service.approve(Number(id));
  }

  @Patch(':id/reject')
  reject(@Param('id') id: number) {
    return this.service.reject(Number(id));
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.service.findOne(Number(id));
  }
}
