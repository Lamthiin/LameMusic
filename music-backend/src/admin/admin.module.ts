import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Artist } from '../artist/artist.entity';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';

import { AdminArtistController } from './artist/artist.controller';
import { AdminArtistService } from './artist/artist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Artist, User, Role]) // ⭐ QUAN TRỌNG
  ],
  controllers: [AdminArtistController],
  providers: [AdminArtistService],
})
export class AdminModule {}
