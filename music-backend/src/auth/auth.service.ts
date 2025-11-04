// music-backend/src/auth/auth.service.ts (BẢN SỬA LỖI CUỐI CÙNG VỚI FORGOT PASSWORD DÙNG OTP)
import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer'; 
import { TotpService } from '../totp/totp.service'; 
import * as bcrypt from 'bcrypt';

// Imports Entity và DTOs
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto'; // <-- IMPORT MỚI
import { ResetPasswordWithOtpDto } from './dto/reset-password-with-otp.dto'; // <-- IMPORT MỚI
import { ChangePasswordDto } from './dto/change-password.dto'; // <-- IMPORT MỚI


@Injectable()
export class AuthService {
  constructor(
@InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>, // <-- (Repo cho Role)
    private jwtService: JwtService,
    private mailerService: MailerService, 
    private totpService: TotpService,
  ) {}
  
  // ===============================================
  // HÀM HELPER: GỬI EMAIL
  // ===============================================
  private async sendOtpEmail(email: string, otpCode: string): Promise<void> {
      try {
          // HIỂN THỊ DỰ PHÒNG TRONG TERMINAL
          // console.log(`\n\n[=== MÃ OTP VÀ KÍCH HOẠT CHO ${email} ===]`);
          // console.log(`MÃ OTP: ${otpCode}`);
          // console.log(`=========================================\n`);

          await this.mailerService.sendMail({
              to: email,
              subject: 'Mã xác nhận Lame Music',
              html: `<p>Mã xác nhận (OTP) của bạn là:</p> <h1>${otpCode}</h1> <p>Mã này sẽ hết hạn sau 5 phút.</p>`,
          });
      } catch (mailError) {
          console.error("LỖI GỬI MAIL SMTP:", mailError);
      }
  }

 // ===============================================
  // 1. HÀM REGISTER (ĐĂNG KÝ)
  // ===============================================
  async register(registerAuthDto: RegisterAuthDto): Promise<Omit<User, 'password'>> {
    const { username, email, password, gender, birth_year } = registerAuthDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });

    // (Logic xử lý user đã tồn tại - giữ nguyên)
    if (existingUser) {
        if (existingUser.active === 1) { 
             throw new ConflictException('Email đã tồn tại và đã được kích hoạt.');
        }
        if (existingUser.active === 0) {
            throw new ConflictException('Tài khoản đã bị khóa.');
        }
        if (existingUser.active === 2) {
            // (Logic gửi lại OTP - giữ nguyên)
          const otpCode = this.totpService.generateOtp();
          const expiryTime = this.totpService.getExpiryTime();
          existingUser.verification_token = otpCode;
          existingUser.otp_expiry = expiryTime;
          await this.userRepository.save(existingUser);
          await this.sendOtpEmail(email, otpCode);
          throw new ConflictException({
                message: 'Tài khoản đang chờ xác thực. Mã xác nhận mới đã được gửi lại.',
                status: 'pending_verification', 
            });
        }
    }

    // === SỬA LỖI 500 (DÙNG SAI REPO) ===
    const listenerRole = await this.roleRepository.findOne({ where: { name: 'listener' } });
    // ===================================
    if (!listenerRole) throw new InternalServerErrorException("Default role 'listener' not found");

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const otpCode = this.totpService.generateOtp(); 
    const expiryTime = this.totpService.getExpiryTime();

    const user = this.userRepository.create({
      username, email, password: hashedPassword, 
      role: listenerRole,
      active: 2, 
      verification_token: otpCode, 
      otp_expiry: expiryTime,      
      gender: gender, 
      birth_year: birth_year ? birth_year : null,
    });

    try {
          const savedUser = await this.userRepository.save(user); 
          // Tách mail ra try riêng
          try {
              await this.sendOtpEmail(savedUser.email, otpCode);
          } catch (mailError) {
              console.error('Lỗi gửi mail:', mailError);
          }
          
          const { password, ...result } = savedUser;
          return result;
      } catch (error) {
          console.error('Lỗi khi save user:', error);
          throw new InternalServerErrorException('Failed to register user due to database error.');
      }
  }

  // ===============================================
  // 2. HÀM LOGIN (SỬA LỖI PAYLOAD)
  // ===============================================
  async login(loginAuthDto: LoginAuthDto): Promise<{ accessToken: string }> {
    const { email, password } = loginAuthDto;

    const user = await this.userRepository
      .createQueryBuilder('user') 
      .leftJoinAndSelect('user.role', 'role') 
      .addSelect('user.password') 
      .where('user.email = :email', { email }) 
      .getOne(); 

    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    if (user.active !== 1) {
        if (user.active === 0) throw new UnauthorizedException('Tài khoản của bạn đã bị khóa.');
        else throw new UnauthorizedException('Tài khoản chưa được kích hoạt. ');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    // === SỬA LỖI: THÊM EMAIL VÀO PAYLOAD ===
    const payload = { 
        userId: user.id, 
        username: user.username, 
        role: user.role.name,
        email: user.email // <-- DÒNG BỊ THIẾU
    };
    // ====================================

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  // // ===============================================
  // // 1. HÀM REGISTER (ĐĂNG KÝ)
  // // ===============================================
  // async register(registerAuthDto: RegisterAuthDto): Promise<Omit<User, 'password'>> {
  //   const { username, email, password, gender, birth_year } = registerAuthDto;

  //   const existingUser = await this.userRepository.findOne({ where: { email } });

  //   if (existingUser) {
  //       if (existingUser.active === 1) { 
  //            throw new ConflictException('Email đã tồn tại và đã được kích hoạt.');
  //       }
        
  //       if (existingUser.active === 0) {
  //           throw new ConflictException('Tài khoản đã bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.');
  //       }
        
  //       if (existingUser.active === 2) {
  //           const otpCode = this.totpService.generateOtp();
  //           const expiryTime = this.totpService.getExpiryTime();
            
  //           existingUser.verification_token = otpCode;
  //           existingUser.otp_expiry = expiryTime;
  //           await this.userRepository.save(existingUser);
  //           await this.sendOtpEmail(email, otpCode);

  //           throw new ConflictException({
  //               message: 'Tài khoản đang chờ xác thực. Mã xác nhận mới đã được gửi lại.',
  //               status: 'pending_verification', 
  //           });
  //       }
  //   }

  //   const listenerRole = await this.roleRepository.findOne({ where: { name: 'listener' } });
  //   if (!listenerRole) throw new InternalServerErrorException("Default role 'listener' not found");

  //   const salt = await bcrypt.genSalt();
  //   const hashedPassword = await bcrypt.hash(password, salt);

  //   const otpCode = this.totpService.generateOtp(); 
  //   const expiryTime = this.totpService.getExpiryTime();

  //   const user = this.userRepository.create({
  //     username, email, password: hashedPassword, 
  //     role: listenerRole!,
  //     active: 2, 
  //     verification_token: otpCode, 
  //     otp_expiry: expiryTime,      
  //     gender: gender, birth_year: birth_year,
  //   });

  //   try {
  //     const savedUser = await this.userRepository.save(user); 
  //     await this.sendOtpEmail(savedUser.email, otpCode); 
      
  //     const { password, ...result } = savedUser;
  //     return result;
  //   } catch (error) {
  //     throw new InternalServerErrorException('Failed to register user due to database error.');
  //   }
  // }

  // // ===============================================
  // // 2. HÀM LOGIN (ĐĂNG NHẬP)
  // // ===============================================
  // async login(loginAuthDto: LoginAuthDto): Promise<{ accessToken: string }> {
  //   const { email, password } = loginAuthDto;

  //   const user = await this.userRepository
  //     .createQueryBuilder('user') 
  //     .leftJoinAndSelect('user.role', 'role') 
  //     .addSelect('user.password') 
  //     .where('user.email = :email', { email }) 
  //     .getOne(); 

  //   if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

  //   if (user.active !== 1) {
  //       if (user.active === 0) {
  //           throw new UnauthorizedException('Tài khoản của bạn đã bị khóa.');
  //       } else { // user.active === 2 (đang chờ xác thực)
  //           throw new UnauthorizedException('Tài khoản chưa được kích hoạt. ');
  //       }
  //   }
    
  //   const isPasswordValid = await bcrypt.compare(password, user.password);
  //   if (!isPasswordValid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

  //   const payload = { userId: user.id, username: user.username, role: user.role.name };
  //   const accessToken = this.jwtService.sign(payload);
  //   return { accessToken };
  // }

  // 2. HÀM LOGIN (SỬA LỖI PAYLOAD)
//   // ===============================================
//   async login(loginAuthDto: LoginAuthDto): Promise<{ accessToken: string }> {
//     const { email, password } = loginAuthDto;

//     const user = await this.userRepository
//       .createQueryBuilder('user') 
//       .leftJoinAndSelect('user.role', 'role') 
//       .addSelect('user.password') 
//       .where('user.email = :email', { email }) 
//       .getOne(); 

//     if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

//     if (user.active !== 1) {
//         if (user.active === 0) {
//             throw new UnauthorizedException('Tài khoản của bạn đã bị khóa.');
//         } else { 
//             throw new UnauthorizedException('Tài khoản chưa được kích hoạt. ');
//         }
//     }
//     
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

//     // === SỬA LỖI: THÊM EMAIL VÀO PAYLOAD ===
//     const payload = { 
//         userId: user.id, 
//         username: user.username, 
//         role: user.role.name,
//         email: user.email // <-- DÒNG BỊ THIẾU
//     };
//     // ====================================

//     const accessToken = this.jwtService.sign(payload);
//     return { accessToken };
//   }

  // ===============================================
  // 3. HÀM VERIFY OTP (XÁC THỰC MÃ)
  // ===============================================
  async verifyOtp(email: string, otpCode: string): Promise<User> {
    const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect(['user.verification_token', 'user.otp_expiry']) 
        .where('user.email = :email', { email })
        .getOne();

    if (!user || user.active === 1 || user.active === 0) {
        if (!user) throw new NotFoundException('Tài khoản không tồn tại.');
        if (user.active === 1) throw new NotFoundException('Tài khoản đã được kích hoạt.');
        if (user.active === 0) throw new UnauthorizedException('Tài khoản đã bị khóa và không thể kích hoạt.');
    }
    
    if (user.verification_token !== otpCode) {
      throw new UnauthorizedException('Mã xác nhận không đúng.');
    }
    
    if (user.otp_expiry && new Date() > user.otp_expiry) {
      user.verification_token = null; 
      user.otp_expiry = null;
      await this.userRepository.save(user);
      throw new UnauthorizedException('Mã xác nhận đã hết hạn. Vui lòng gửi lại mã.');
    }
    
    user.active = 1; 
    user.verification_token = null; 
    user.otp_expiry = null;

    return this.userRepository.save(user);
  }

  // ===============================================
  // 4. HÀM RESEND OTP (GỬI LẠI MÃ)
  // ===============================================
  async resendOtp(resendOtpDto: ResendOtpDto): Promise<{ message: string }> {
    const { email } = resendOtpDto;
    
    const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect(['user.verification_token', 'user.otp_expiry']) 
        .where('user.email = :email', { email })
        .getOne();

    if (!user || user.active === 1 || user.active === 0) {
      return { message: 'Yêu cầu gửi lại mã đã được xử lý (nếu tài khoản cần xác thực).' };
    }
    
    const otpCode = this.totpService.generateOtp();
    const expiryTime = this.totpService.getExpiryTime();

    user.verification_token = otpCode;
    user.otp_expiry = expiryTime;
    await this.userRepository.save(user);

    await this.sendOtpEmail(email, otpCode);

    return { message: 'Mã xác nhận mới đã được gửi đến email của bạn.' };
  }
  
  // ===============================================
  // 5. HÀM FORGOT PASSWORD (DÙNG OTP)
  // ===============================================
  async forgotPasswordOtp(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    
    const user = await this.userRepository.findOne({ where: { email } });

    // 1. Nếu user không tồn tại hoặc bị cấm (active=0), trả về thông báo chung (bảo mật)
    if (!user || user.active === 0) {
      return { message: 'Nếu tài khoản tồn tại và không bị khóa, mã đặt lại mật khẩu đã được gửi.' };
    }
    
    // 2. TẠO OTP mới và lưu vào cột sẵn có
    const otpCode = this.totpService.generateOtp(); 
    const expiryTime = this.totpService.getExpiryTime(); // Hạn ngắn (thường 5 phút)
    
    user.verification_token = otpCode;
    user.otp_expiry = expiryTime;
    
    // Đảm bảo trạng thái không bị khóa sau khi gửi OTP
    if (user.active !== 1) {
        user.active = 2; // Đặt về trạng thái chờ xác thực (nếu đang là active khác 1)
    }

    await this.userRepository.save(user);

    // 3. Gửi EMAIL chứa Mã OTP
    this.sendOtpEmail(user.email, otpCode);

    return { message: 'Mã OTP được gửi đến email của bạn.' };
  }
  
  // ===============================================
  // 6. HÀM RESET PASSWORD (DÙNG OTP)
  // ===============================================
  async resetPasswordOtp(resetPasswordDto: ResetPasswordWithOtpDto): Promise<{ message: string }> {
    const { email, otpCode, newPassword } = resetPasswordDto;
    
    const user = await this.userRepository.findOne({ 
        where: { email },
        select: ['id', 'email', 'password', 'verification_token', 'otp_expiry', 'active']
    });

    // 1. Kiểm tra user tồn tại và không bị cấm
    if (!user || user.active === 0) {
      throw new BadRequestException('Yêu cầu đặt lại mật khẩu không hợp lệ.');
    }
    
    // 2. Kiểm tra OTP có khớp không
    if (user.verification_token !== otpCode) {
      throw new UnauthorizedException('Mã xác nhận (OTP) không đúng.');
    }
    
    // 3. Kiểm tra OTP hết hạn
    if (user.otp_expiry && new Date() > user.otp_expiry) {
      user.verification_token = null; 
      user.otp_expiry = null;
      await this.userRepository.save(user);
      throw new UnauthorizedException('Mã xác nhận đã hết hạn. Vui lòng yêu cầu lại.');
    }

    // 4. Hash mật khẩu mới và lưu
    const salt = await bcrypt.genSalt();
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = newHashedPassword;
    user.verification_token = null; // Xóa token sau khi dùng
    user.otp_expiry = null;         // Xóa thời gian hết hạn
    user.active = 1;                // Kích hoạt user (active=1) sau khi đặt lại thành công

    await this.userRepository.save(user);

    return { message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập.' };
  }

  /**
   * 7. HÀM MỚI: ĐỔI MẬT KHẨU (Khi đã đăng nhập)
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.id = :userId', { userId })
        .getOne();

    if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng.');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedException('Mật khẩu cũ không chính xác.');
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);

    await this.userRepository.save(user);
    
    return { message: 'Đổi mật khẩu thành công.' };
  }
/**
 * 8. HÀM MỚI: Yêu cầu OTP đổi pass (Khi ĐÃ ĐĂNG NHẬP)
 * Chỉ áp dụng cho user đã active (active=1)
 */
async requestPasswordResetOtp(userId: number): Promise<{ message: string }> {
  // 1. Tìm user bằng ID
  const user = await this.userRepository.findOne({ where: { id: userId } });

  // 2. Nếu user không tồn tại hoặc chưa active
  if (!user || user.active !== 1) {
    throw new NotFoundException(
      'Chỉ có thể yêu cầu đổi mật khẩu cho tài khoản đã kích hoạt.'
    );
  }

  // 3. Tạo OTP mới và lưu vào cột verification_token + otp_expiry
  const otpCode = this.totpService.generateOtp();
  const expiryTime = this.totpService.getExpiryTime(); // Hạn 5 phút

  user.verification_token = otpCode;
  user.otp_expiry = expiryTime;

  await this.userRepository.save(user);

  // 4. Gửi mail OTP (dùng hàm sendOtpEmail đã có)
  await this.sendOtpEmail(user.email, otpCode);

  return { message: `Đã gửi mã OTP đến email ${user.email}.` };
}

}