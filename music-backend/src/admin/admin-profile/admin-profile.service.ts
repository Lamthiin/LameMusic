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
    if (!user.role || user.role.id !== 1) {
      throw new BadRequestException("Bạn không có quyền cập nhật!");
    }

    // Email trùng
    if (dto.email) {
      const exists = await this.userRepo.findOne({
        where: { email: dto.email, id: Not(id) },
      });

      if (exists) {
        throw new BadRequestException("Email đã được sử dụng!");
      }
    }

    // ========================
    // Update name, email
    // ========================
    if (dto.username) user.username = dto.username.trim();
    if (dto.email) user.email = dto.email.trim();

    // ========================
    // Update gender
    // ========================
    if (dto.gender) {
      const g = dto.gender.toLowerCase();

      if (g === "male") user.gender = "male";
      else if (g === "female") user.gender = "female";
      else user.gender = "prefer not to say"; // giá trị mặc định
    }


    // ========================
    // Update birth_year
    // ========================
    if (dto.birth_year !== undefined) {
      if (dto.birth_year === null || dto.birth_year === "") {
        user.birth_year = null;
      } else {
        const by = Number(dto.birth_year);
        if (!Number.isNaN(by)) {
          user.birth_year = by;
        }
      }
    }

    // ========================
    // Update password (nếu có)
    // ========================
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
        gender: user.gender,
        birth_year: user.birth_year,
      }
    };
  }
}
