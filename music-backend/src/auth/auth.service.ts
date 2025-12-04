// music-backend/src/auth/auth.service.ts (BẢN SỬA LỖI CUỐI CÙNG VỚI FORGOT PASSWORD DÙNG OTP)
import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer'; 
import { TotpService } from '../totp/totp.service'; 
import * as bcrypt from 'bcrypt';

import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordWithOtpDto } from './dto/reset-password-with-otp.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Otp } from '../totp/totp.entity';
import { RateLimitService } from '../common/rate-limit.service';
import { RoleEnum } from '../role/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private totpService: TotpService,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    private readonly rateLimitService: RateLimitService,
  ) {}

    private async sendOtpEmail(email: string, otpCode: string): Promise<void> {
    try {
        await this.mailerService.sendMail({
        to: email,
        subject: 'Mã xác nhận Lame Music',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="text-align: center; color: #00b35cff;">Lame Music</h2>
            <p>Xin chào,</p>
            <p>Bạn hoặc ai đó vừa yêu cầu <strong>xác thực tài khoản</strong> của mình trên Lame Music.</p>
            <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; padding: 15px 25px; color: #fff; background-color: #00b35cff; border-radius: 8px;">
                ${otpCode}
            </span>
            </div>
            <p style="text-align: center; color: #555;">Mã OTP này sẽ <strong>hết hạn sau 5 phút</strong>.</p>
            <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="text-align: center; font-size: 12px; color: #999;">© 2025 Lame Music. All rights reserved.</p>
        </div>
        `,
        });
    } catch (mailError) {
        console.error("LỖI GỬI MAIL SMTP:", mailError);
    }
    }

  // 1. REGISTER
  async register(registerAuthDto: RegisterAuthDto): Promise<Omit<User, 'password'>> {
    const { username, email, password, gender, birth_year } = registerAuthDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
      relations: ['otp']
    });

    if (existingUser) {
      if (existingUser.active === 1) {
        throw new ConflictException('Email đã tồn tại và đã được kích hoạt.');
      }
      if (existingUser.active === 0) {
        throw new ConflictException('Tài khoản đã bị khóa.');
      }
      if (existingUser.active === 2) {
        const otpCode = this.totpService.generateOtp();
        const expiryTime = this.totpService.getExpiryTime();

        await this.otpRepository.upsert({
          user_id: existingUser.id,
          code: otpCode,
          expires_at: expiryTime
        }, ['user_id']);

        await this.sendOtpEmail(email, otpCode);
        throw new ConflictException({
          message: 'Tài khoản đang chờ xác thực. Mã xác nhận mới đã được gửi lại.',
          status: 'pending_verification',
        });
      }
    }

    const listenerRole = await this.roleRepository.findOne({ where: { name: 'listener' } });
    if (!listenerRole) throw new InternalServerErrorException("Default role 'listener' not found");

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const otpCode = this.totpService.generateOtp();
    const expiryTime = this.totpService.getExpiryTime();

    const user = this.userRepository.create({
      username, email, password: hashedPassword,
      role: listenerRole,
      active: 2,
      gender: gender,
      birth_year: birth_year ? birth_year : null,
      otp: this.otpRepository.create({
        code: otpCode,
        expires_at: expiryTime
      })
    });

    try {
      const savedUser = await this.userRepository.save(user);
      await this.sendOtpEmail(savedUser.email!, otpCode);
      const { password, ...result } = savedUser;
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Failed to register user due to database error.');
    }
  }

//   // 2. LOGIN (thêm rate-limit)
//   async login(loginAuthDto: LoginAuthDto): Promise<{ accessToken: string }> {
//     const { email, password } = loginAuthDto;
//     const identifier = (email || '').toLowerCase();

//     this.rateLimitService.check('login_fail', identifier, 5);

//     const user = await this.userRepository
//       .createQueryBuilder('user')
//       .leftJoinAndSelect('user.role', 'role')
//       .addSelect('user.password')
//       .where('user.email = :email', { email })
//       .getOne();

//     if (!user) {
//       this.rateLimitService.addFail('login_fail', identifier);
//       throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
//     }

//     if (user.active !== 1) {
//       if (user.active === 0) {
//         this.rateLimitService.addFail('login_fail', identifier);
//         throw new UnauthorizedException('Tài khoản của bạn đã bị khóa.');
//       } else {
//         this.rateLimitService.addFail('login_fail', identifier);
//         throw new UnauthorizedException('Tài khoản chưa được kích hoạt. ');
//       }
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password!);
//     if (!isPasswordValid) {
//       this.rateLimitService.addFail('login_fail', identifier);
//       throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
//     }

//     this.rateLimitService.reset('login_fail', identifier);

//     const payload = {
//       userId: user.id,
//       username: user.username,
//       role: user.role.name,
//       email: user.email
//     };

//     const accessToken = this.jwtService.sign(payload);
//     return { accessToken };
//   }
async login(loginAuthDto: LoginAuthDto): Promise<{ accessToken: string }> {
    const { email, password } = loginAuthDto;
    const identifier = (email || '').toLowerCase();
    
    // 1. KIỂM TRA RATE LIMIT
    this.rateLimitService.check('login_fail', identifier, 5); // 5 lần sai trong 30 phút

    const user = await this.userRepository
      .createQueryBuilder('user')
      // Đảm bảo bạn đã Join Role (đúng)
      .leftJoinAndSelect('user.role', 'role')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      this.rateLimitService.addFail('login_fail', identifier);
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (user.active !== 1) {
      this.rateLimitService.addFail('login_fail', identifier);
      // Giả định user.active = 0 là bị khóa, và active != 1 là chưa kích hoạt
      const message = user.active === 0 ? 'Tài khoản của bạn đã bị khóa.' : 'Tài khoản chưa được kích hoạt.';
      throw new UnauthorizedException(message);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      this.rateLimitService.addFail('login_fail', identifier);
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Đăng nhập thành công -> Reset Limit
    this.rateLimitService.reset('login_fail', identifier);

    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role.name,
      email: user.email
    };

    // === FIX LOGIC JWT ADMIN EXPIRATION ===
    // Kiểm tra nếu người dùng là Admin (Giả định RoleEnum.ADMIN tồn tại)
    const isAdmin = user.role.name === RoleEnum.ADMIN;
    
    // Token sẽ hết hạn: 1 giờ (1h) cho Admin, 7 ngày (7d) cho User thường
    const expiresIn = isAdmin ? '30m' : '7d'; 

    const accessToken = this.jwtService.sign(payload, {
        expiresIn: expiresIn, // ÁP DỤNG THỜI GIAN TÙY CHỈNH
    });
    // ========================================

    return { accessToken };
  }

  // 3. VERIFY OTP (thêm rate-limit)
  async verifyOtp(email: string, otpCode: string): Promise<User> {
    const identifier = (email || '').toLowerCase();
    this.rateLimitService.check('verify_otp_fail', identifier, 5);

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['otp']
    });

    if (!user) {
      this.rateLimitService.addFail('verify_otp_fail', identifier);
      throw new NotFoundException('Tài khoản không tồn tại.');
    }

    if (user.active === 1) {
      this.rateLimitService.addFail('verify_otp_fail', identifier);
      throw new NotFoundException('Tài khoản đã được kích hoạt.');
    }
    if (user.active === 0) {
      this.rateLimitService.addFail('verify_otp_fail', identifier);
      throw new UnauthorizedException('Tài khoản đã bị khóa và không thể kích hoạt.');
    }

    if (!user.otp || user.otp.code !== otpCode) {
      this.rateLimitService.addFail('verify_otp_fail', identifier);
      throw new UnauthorizedException('Mã xác nhận không đúng.');
    }

    if (new Date() > user.otp.expires_at) {
      await this.otpRepository.delete({ user_id: user.id });
      this.rateLimitService.addFail('verify_otp_fail', identifier);
      throw new UnauthorizedException('Mã xác nhận đã hết hạn. Vui lòng gửi lại mã.');
    }

    user.active = 1;
    await this.otpRepository.delete({ user_id: user.id });
    delete (user as any).otp;

    this.rateLimitService.reset('verify_otp_fail', identifier);

    return this.userRepository.save(user);
  }

  // helper create/update otp
  private async createOrUpdateOtp(user: User): Promise<string> {
    const otpCode = this.totpService.generateOtp();
    const expiryTime = this.totpService.getExpiryTime();
    await this.otpRepository.upsert({
      user_id: user.id,
      code: otpCode,
      expires_at: expiryTime,
    }, ['user_id']);
    return otpCode;
  }

  // 4. RESEND OTP (giới hạn số lần gửi)
  async resendOtp(resendOtpDto: ResendOtpDto): Promise<{ message: string }> {
    const { email } = resendOtpDto;
    const identifier = (email || '').toLowerCase();

    this.rateLimitService.check('resend_otp', identifier, 5);

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || user.active === 1 || user.active === 0) {
      // dù không gửi thật cũng tính là 1 request đã xử lý (không tăng count)
      return { message: 'Yêu cầu gửi lại mã đã được xử lý.' };
    }

    const otpCode = await this.createOrUpdateOtp(user);
    await this.sendOtpEmail(user.email!, otpCode);

    this.rateLimitService.addFail('resend_otp', identifier);

    return { message: 'Mã xác nhận mới đã được gửi đến email của bạn.' };
  }

  // 5. FORGOT PASSWORD (gửi OTP để reset) - giới hạn gửi
  async forgotPasswordOtp(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const identifier = (email || '').toLowerCase();

    this.rateLimitService.check('forgot_password', identifier, 5);

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || user.active === 0) {
      this.rateLimitService.addFail('forgot_password', identifier);
      return { message: 'Nếu tài khoản tồn tại, mã đã được gửi.' };
    }

    const otpCode = await this.createOrUpdateOtp(user);
    await this.sendOtpEmail(user.email!, otpCode);

    this.rateLimitService.addFail('forgot_password', identifier);

    return { message: 'Mã OTP được gửi đến email của bạn.' };
  }

  // 6. REQUEST RESET OTP khi đã login (giới hạn theo userId)
  async requestPasswordResetOtp(userId: number): Promise<{ message: string }> {
    const identifier = userId.toString();

    this.rateLimitService.check('request_reset_otp', identifier, 5);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.active === 0) {
      this.rateLimitService.addFail('request_reset_otp', identifier);
      throw new NotFoundException('Không thể xử lý yêu cầu.');
    }

    const otpCode = await this.createOrUpdateOtp(user);
    await this.sendOtpEmail(user.email!, otpCode);

    this.rateLimitService.addFail('request_reset_otp', identifier);

    return { message: `Đã gửi mã OTP đến email ${user.email}.` };
  }

  // 7. RESET PASSWORD DÙNG OTP (thêm rate-limit cho nhập OTP sai)
  async resetPasswordOtp(resetPasswordDto: ResetPasswordWithOtpDto): Promise<{ message: string }> {
    const { email, otpCode, newPassword } = resetPasswordDto;
    const identifier = (email || '').toLowerCase();

    this.rateLimitService.check('reset_password', identifier, 5);

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['otp']
    });

    if (!user || user.active === 0) {
      this.rateLimitService.addFail('reset_password', identifier);
      throw new BadRequestException('Yêu cầu đặt lại mật khẩu không hợp lệ.');
    }

    if (!user.otp || user.otp.code !== otpCode) {
      this.rateLimitService.addFail('reset_password', identifier);
      throw new UnauthorizedException('Mã xác nhận (OTP) không đúng.');
    }

    if (new Date() > user.otp.expires_at) {
      await this.otpRepository.delete({ user_id: user.id });
      this.rateLimitService.addFail('reset_password', identifier);
      throw new UnauthorizedException('Mã xác nhận đã hết hạn.');
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    user.active = 1;
    await this.otpRepository.delete({ user_id: user.id });
    delete (user as any).otp;
    await this.userRepository.save(user);

    this.rateLimitService.reset('reset_password', identifier);

    return { message: 'Mật khẩu đã được đặt lại thành công.' };
  }

  // 8. CHANGE PASSWORD (thêm rate-limit cho nhập sai mật khẩu cũ)
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { oldPassword, newPassword } = changePasswordDto;
    const identifier = userId.toString();

    this.rateLimitService.check('change_password', identifier, 5);

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      this.rateLimitService.addFail('change_password', identifier);
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password!);
    if (!isPasswordValid) {
      this.rateLimitService.addFail('change_password', identifier);
      throw new UnauthorizedException('Mật khẩu cũ không chính xác.');
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);

    this.rateLimitService.reset('change_password', identifier);

    return { message: 'Đổi mật khẩu thành công.' };
  }

}
