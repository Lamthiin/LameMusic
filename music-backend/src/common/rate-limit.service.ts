// src/common/rate-limit.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class RateLimitService {
  private store = new Map<string, { count: number; expire: number }>();
  private WINDOW = 30 * 60 * 1000; // 30 phút

  private getKey(action: string, identifier: string): string {
    return `${action}:${identifier}`;
  }

  check(action: string, identifier: string, limit = 5) {
    const key = this.getKey(action, identifier);
    const record = this.store.get(key);
    const now = Date.now();

    if (record && now < record.expire && record.count >= limit) {
      throw new BadRequestException(`Bạn đã thử quá ${limit} lần. Vui lòng thử lại sau 30 phút.`);
    }
  }

  addFail(action: string, identifier: string) {
    const key = this.getKey(action, identifier);
    const record = this.store.get(key);
    const now = Date.now();

    if (!record || now > record.expire) {
      this.store.set(key, { count: 1, expire: now + this.WINDOW });
    } else {
      this.store.set(key, {
        count: record.count + 1,
        expire: record.expire,
      });
    }
  }

  reset(action: string, identifier: string) {
    const key = this.getKey(action, identifier);
    this.store.delete(key);
  }
}
