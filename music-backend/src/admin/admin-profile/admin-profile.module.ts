import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "../../user/user.entity";
import { Role } from "../../role/role.entity";

import { AdminProfileController } from "./admin-profile.controller";
import { AdminProfileService } from "./admin-profile.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]), // ⭐ Quan trọng
  ],
  controllers: [AdminProfileController],
  providers: [AdminProfileService],
})
export class AdminProfileModule {}
