// music-backend/src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// === ĐỊNH NGHĨA PAYLOAD (RẤT QUAN TRỌNG) ===
export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  email?: string;  // ⭐ thêm dòng này KHÔNG phá code cũ
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ignoreExpiration: false,
      secretOrKey: 'my_super_secure_lame_secret_12345', // PHẢI KHỚP VỚI AuthModule
    });
  }

  // Hàm này giải mã token và trả về payload
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return payload; 
  }
}