// music-backend/src/search/search.controller.ts (TẠO MỚI)
import { SearchService } from './search.service';
import { Controller, Get, Query, Patch, Body, UseGuards, Req, ValidationPipe, Param } from '@nestjs/common';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

@Get()
search(
  @Query('q') q: string,
  @Query('mode') mode?: 'dropdown' | 'full'
) {
  return this.searchService.findAll(q, mode || 'dropdown');
}

}