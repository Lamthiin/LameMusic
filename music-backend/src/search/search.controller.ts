// music-backend/src/search/search.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') q: string,
    @Query('mode') mode: 'dropdown' | 'full' = 'dropdown', // default dropdown
  ) {
    if (!q || !q.trim()) {
      return {
        songs: [],
        artists: [],
        albums: [],
        users: [],
      };
    }

    const query = q.trim();

    if (mode === 'full') {
      // Đây là lúc cần gộp AI + DB + sort theo similarity
      return this.searchService.searchAll(query, 10); // 10 kết quả AI là đủ đẹp
    }

    // mode === 'dropdown' hoặc default
    return this.searchService.findAll(query, 'dropdown');
  }
}