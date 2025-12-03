import { Controller, Get, Param, Post, Body} from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { CreateUserDto } from './dto/create-user.dto';

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

  @Post('create')
  async createUser(@Body() dto: CreateUserDto) {
    return this.adminUserService.createUser(dto);
  }

}
