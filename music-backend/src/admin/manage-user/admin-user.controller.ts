import { Controller, Get } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';

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

}
