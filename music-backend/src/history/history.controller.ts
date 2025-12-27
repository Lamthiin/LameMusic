import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
  Query,
  Get,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { LogPlaybackDto } from './dto/log-playback.dto';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Post('/log/:songId')
  async logPlayback(
    @Req() req: any,
    @Param('songId', ParseIntPipe) songId: number,
    @Body() logDto: LogPlaybackDto,
  ) {
    const userId = (req.user as JwtPayload).userId;

    return this.historyService.logPlayback(
      userId,
      songId,
      logDto.durationListened || 30,
    );
  }

  @Get('/me')
  async getListenHistory(
    @Req() req: any,
    @Query('limit') limit?: string,
  ) {
    const userId = (req.user as JwtPayload).userId;

    return this.historyService.getUserListenHistory(
      userId,
      limit ? parseInt(limit) : 100,
    );
  }
}
