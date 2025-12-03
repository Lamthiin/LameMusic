// src/admin/manage-user/dto/create-admin.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(5)
  password: string;
}
