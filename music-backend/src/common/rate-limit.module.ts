// src/common/rate-limit.module.ts (TẠO MỚI)
import { Module } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';

@Module({
  providers: [RateLimitService],
  exports: [RateLimitService], // Export để các module khác có thể sử dụng
})
export class RateLimitModule {}