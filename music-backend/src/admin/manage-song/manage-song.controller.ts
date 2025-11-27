// src/admin/managesong/manage-song.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ManageSongService } from './manage-song.service';

@Controller('admin/manage-song')
export class ManageSongController {
  constructor(private readonly manageSongService: ManageSongService) {}

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audioFile', maxCount: 1 },
      { name: 'imageFile', maxCount: 1 },
    ]),
  )
  async upload(
    @UploadedFiles() files: any,
    @Body() body: any,
  ) {
    return this.manageSongService.uploadSong(files, body);
  }
}
