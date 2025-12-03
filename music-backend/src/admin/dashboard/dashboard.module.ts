import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import { User } from '../../user/user.entity';
import { Artist } from '../../artist/artist.entity';
import { Song } from '../../song/song.entity';
import { Album } from '../../album/album.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Artist, Song, Album])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
