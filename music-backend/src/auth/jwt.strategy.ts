// music-backend/src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from '../artist/artist.entity'; // Đảm bảo đường dẫn Entity Artist đúng
// import { User } from '../../user/entities/user.entity'; // Có thể cần nếu bạn truy cập User Repository

// === 1. CẬP NHẬT INTERFACE PAYLOAD ===
export interface JwtPayload {
    userId: number;
    username: string;
    role: string;
    email?: string;
    artistId?: number | null; // ⭐ THÊM TRƯỜNG artistId
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    // === 2. INJECT ArtistRepository ===
    constructor(
        @InjectRepository(Artist)
        private artistRepository: Repository<Artist>,
        // Có thể cần User Repository nếu bạn cần kiểm tra User, nhưng Artist là đủ
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
            ignoreExpiration: false,
            secretOrKey: 'my_super_secure_lame_secret_12345',
        });
    }

    // === 3. CẬP NHẬT HÀM VALIDATE ===
    async validate(payload: JwtPayload): Promise<JwtPayload> {
        // Nếu người dùng không phải là Artist, ta không cần tìm Artist ID
        if (payload.role !== 'artist') {
            return payload; // Trả về Payload gốc (chỉ có userId)
        }

        // Nếu là Artist, tìm Artist ID dựa trên User ID
        // (Ví dụ: userId=28, tìm artist.id=23)
        const artist = await this.artistRepository.findOne({
            where: { user: { id: payload.userId } }, // Giả định quan hệ với User
            select: ['id'], // Chỉ lấy ID Artist
            relations: { user: true } // Cần load quan hệ user để query theo user.id
        });

        if (!artist) {
            // Đây là trường hợp hiếm: User là 'artist' trong token nhưng không có hồ sơ Artist trong DB
            // Tùy chọn: ném lỗi hoặc chỉ trả về payload gốc. Ta nên trả về lỗi nếu role là 'artist'
            // throw new UnauthorizedException('Hồ sơ Artist không hợp lệ.');
            
            // Tạm thời trả về payload gốc, nhưng thêm artistId: null để Frontend biết
            return {
                ...payload,
                artistId: null // Gửi null nếu không tìm thấy, Frontend sẽ báo lỗi "ID Nghệ sĩ không hợp lệ"
            };
        }

        // Gắn Artist ID tìm thấy (23) vào Payload
        return {
            ...payload,
            artistId: artist.id, // artistId = 23
        };
    }
}