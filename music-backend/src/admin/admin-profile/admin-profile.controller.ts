import {
  Controller,
  Patch,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminProfileService } from "./admin-profile.service";

@Controller("admin/profile")
export class AdminProfileController {
  constructor(private readonly service: AdminProfileService) {}

  @Patch()
  @UseGuards(AuthGuard("jwt"))
  async updateProfile(@Req() req, @Body() dto: any) {
    const userId = req.user.userId;
  
    return this.service.updateProfile(userId, dto);
  }
}
