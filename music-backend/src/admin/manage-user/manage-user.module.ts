// src/admin/manage-user/manage-user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../user/user.entity';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { Role } from '../../role/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),   // <-- IMPORTANT
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class ManageUserModule {}
