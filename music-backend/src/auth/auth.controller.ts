// music-backend/src/auth/auth.controller.ts (FULL + CLEAN)
import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';

import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordWithOtpDto } from './dto/reset-password-with-otp.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { JwtPayload } from './jwt.strategy';
import { Throttle } from '@nestjs/throttler';
import { Get } from '@nestjs/common';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * REGISTER — tạo user inactive và gửi OTP
   * POST /auth/register
   */
  @Post('/register')
  register(@Body(ValidationPipe) registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  /**
   * LOGIN — kiểm tra rate limit trong service
   * POST /auth/login
   */
  @Post('/login')
  async login(@Body(ValidationPipe) loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
  }

  /**
   * RESEND OTP — giới hạn 5 lần / 30 phút
   * POST /auth/resend-otp
   */
  @Throttle({ default: { limit: 5, ttl: 30 * 60 * 1000 } })
  @Post('/resend-otp')
  resendOtp(@Body(ValidationPipe) resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  /**
   * VERIFY OTP — kích hoạt tài khoản
   * POST /auth/verify-otp
   */
  @Post('/verify-otp')
  async verifyOtp(@Body(ValidationPipe) verifyOtpDto: VerifyOtpDto) {
    await this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otpCode);
    return { message: 'Xác nhận tài khoản thành công! Vui lòng đăng nhập.' };
  }

  /**
   * FORGOT PASSWORD — gửi OTP khôi phục mật khẩu
   * POST /auth/forgot-password
   */
  @Post('/forgot-password')
  forgotPassword(@Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPasswordOtp(forgotPasswordDto);
  }

  /**
   * RESET PASSWORD WITH OTP
   * POST /auth/reset-password-otp
   */
  @Post('/reset-password-otp')
  resetPassword(@Body(ValidationPipe) resetPasswordDto: ResetPasswordWithOtpDto) {
    return this.authService.resetPasswordOtp(resetPasswordDto);
  }

  /**
   * CHANGE PASSWORD (đã đăng nhập)
   * POST /auth/change-password
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/change-password')
  async changePassword(
    @Req() req: any,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ) {
    const userId = (req.user as JwtPayload).userId;
    return this.authService.changePassword(userId, changePasswordDto);
  }

  /**
   * REQUEST PASSWORD RESET OTP (đã đăng nhập)
   * POST /auth/request-reset-otp
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/request-reset-otp')
  async requestResetOtp(@Req() req: any) {
    const userId = (req.user as JwtPayload).userId;
    return this.authService.requestPasswordResetOtp(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  async getProfile(@Req() req: any) {
    const userId = (req.user as JwtPayload).userId;
    return this.authService.getProfile(userId);
  }
}