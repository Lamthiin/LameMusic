// music-backend/src/auth/auth.module.ts (BẢN SỬA LỖI FINAL)
import { Module, forwardRef } from '@nestjs/common'; // <-- THÊM forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt'; 
import { TotpModule } from '../totp/totp.module'; // <-- (1) IMPORT TOTP
import { SharedModule } from '../shared/shared.module'; // <-- (2) IMPORT SHARED (chứa Mailer)
import { Otp } from '../totp/totp.entity'; // <-- (1) IMPORT OTP

// Imports Entity và DTO
import { UserModule } from '../user/user.module'; 
import { RoleModule } from '../role/role.module'; 
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import { JwtStrategy } from './jwt.strategy'; 
import { RateLimitModule } from '../common/rate-limit.module';
import { AuthController } from './auth.controller'; 
import { AuthService } from './auth.service';
import { Artist } from '../artist/artist.entity';
@Module({
  imports: [
    // Phá vỡ vòng lặp (Circular Dependency) với UserModule
    forwardRef(() => UserModule), 
    RateLimitModule,
    RoleModule, 
    TypeOrmModule.forFeature([User, Role, Otp, Artist]),
    
    // === (3) THÊM 2 MODULE BỊ THIẾU VÀO ĐÂY ===
    SharedModule, // Module chứa MailerModule đã cấu hình
    TotpModule,   // Module chứa TotpService
    // ======================================

    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'my_super_secure_lame_secret_12345', // (Phải khớp với jwt.strategy.ts)
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], 
  exports: [AuthService, PassportModule, JwtModule], 
})
export class AuthModule {}