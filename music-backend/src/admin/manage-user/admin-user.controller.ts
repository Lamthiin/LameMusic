import { Controller, Get, Param, Post, Body, Patch, ParseIntPipe} from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';



@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  // LẤY DANH SÁCH USER (artist + listener)
  @Get('customers')
  async getCustomers() {
    return this.adminUserService.getCustomers();
  }

  @Get('admins')
  async getAdmins() {
    return this.adminUserService.getAdmins();
  }

  @Get(':id')
  getUserDetail(@Param('id') id: string) {
    return this.adminUserService.getUserDetail(Number(id));
  }

  @Post('admins/create')
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminUserService.createAdmin(dto);
  }

  @Post('create')
  async createUser(@Body() dto: CreateUserDto) {
    return this.adminUserService.createUser(dto);
  }

  @Patch(':id/promote')
  async promote(@Param('id', ParseIntPipe) id: number) {
    return await this.adminUserService.promoteUserToAdmin(id);
  }

  @Patch(':id/soft-delete')
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    return await this.adminUserService.softDeleteUser(id);
  }

  @Patch('admins/:id/soft-delete')
  async deleteAdmin(@Param('id') id: number) {
    return this.adminUserService.softDeleteAdmin(Number(id));
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() dto: UpdateUserDto
  ) {
    return this.adminUserService.updateUser(id, dto);
  }

  @Patch('admins/:id')
  async updateAdmin(
    @Param('id') id: number,
    @Body() dto: UpdateAdminDto
  ) {
    return this.adminUserService.updateAdmin(id, dto);
  }

}
