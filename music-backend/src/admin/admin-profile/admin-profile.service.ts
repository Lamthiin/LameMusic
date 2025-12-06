import {
  Injectable,
  NotFoundException,
  BadRequestException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { User } from "../../user/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminProfileService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  async updateProfile(id: number, dto: any) {
    // Lấy user kèm password
    const user = await this.userRepo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .addSelect("user.password")
      .where("user.id = :id", { id })
      .getOne();

    if (!user) throw new NotFoundException("Không tìm thấy tài khoản");

    // Check quyền admin
    if (user.role.id !== 1) {
      throw new BadRequestException("Bạn không có quyền cập nhật!");
    }

    // Email trùng
    if (dto.email) {
      const exists = await this.userRepo.findOne({
        where: { email: dto.email, id: Not(id) },
      });

      if (exists)
        throw new BadRequestException("Email đã được sử dụng!");
    }

    // Update name, email
    if (dto.username) user.username = dto.username;
    if (dto.email) user.email = dto.email;

    // Update password
    if (dto.password && dto.password.trim() !== "") {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    await this.userRepo.save(user);

    return {
      status: 200,
      message: "Cập nhật thành công!",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    };
  }
}
