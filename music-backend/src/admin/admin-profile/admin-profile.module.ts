import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../user/user.entity";
import { AdminProfileController } from "./admin-profile.controller";
import { AdminProfileService } from "./admin-profile.service";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AdminProfileController],
  providers: [AdminProfileService]
})
export class AdminProfileModule {}
