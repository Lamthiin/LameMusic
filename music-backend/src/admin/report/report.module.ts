import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Report } from '../../report/report.entity';
import { User } from '../../user/user.entity';
import { Song } from '../../song/song.entity';
import { Notification } from '../../notification/notification.entity';

import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Notification, Song, User]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
