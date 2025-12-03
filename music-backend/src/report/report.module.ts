import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { AuthModule } from '../auth/auth.module';
import { Song } from '../song/song.entity'; // Cần Song Repository

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Song]),
    AuthModule, // Bảo vệ route
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}