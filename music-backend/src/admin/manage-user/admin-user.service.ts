import { Injectable, NotFoundException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { User } from '../../user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt'; 
import { Role } from '../../role/role.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)                             // <--- THÊM
    private readonly roleRepo: Repository<Role>,        // <--- THÊM
 
  ) {}

  async getCustomers() {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .where('role.id IN (:...roles)', { roles: [2, 3] })
      .andWhere('user.active = :active', { active: 1 })   // Chỉ hiển thị active 1
      .select([
        'user.id AS id',
        'user.username AS username',
        'user.email AS email',
        'user.birth_year AS birth_year',
        'user.gender AS gender',
        'user.created_at AS created_at',
        'role.id AS role_id',
      ])
      .orderBy('user.id', 'ASC')
      .getRawMany();
  }

  async getAdmins() {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .where('role.id = :role', { role: 1 }) 
      .andWhere('user.active = :active', { active: 1 })   // Chỉ hiển thị active 1
      .select([
        'user.id AS id',
        'user.username AS username',
        'user.email AS email',
        'role.name AS role',         // <--- THÊM DÒNG NÀY
        'user.created_at AS created_at',
      ])
      .orderBy('user.id', 'ASC')
      .getRawMany();
  }

    // LẤY CHI TIẾT 1 USER (Popup XEM)
  async getUserDetail(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { role: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      birth_year: user.birth_year,
      gender: user.gender,
      created_at: user.created_at,
      role: user.role?.name ?? 'unknown',
    };
  }


  // TẠO ADMIN MỚI (role = 1, HASH PASSWORD)
  async createAdmin(dto: CreateAdminDto) {
    const exists = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newAdmin = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,      // ⬅️ LƯU MẬT KHẨU ĐÃ HASH
      role: { id: 1 },               // 1 = Super Admin
      gender: 'prefer not to say',
      active: 1,
    });

    await this.userRepo.save(newAdmin);

    return {
      message: 'Tạo admin thành công',
      user: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: 'admin',
      },
    };
  }

  // TẠO USER (listener – role = 2, HASH PASSWORD)
  async createUser(dto: CreateUserDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,      // ⬅️ LƯU MẬT KHẨU ĐÃ HASH
      role: { id: 2 },               // 2 = listener
      gender: 'prefer not to say',
      active: 1,
    });

    await this.userRepo.save(newUser);

    return {
      message: 'Tạo user thành công',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: 'listener',
      },
    };
  }

  async promoteUserToAdmin(userId: number) {
    // 1. Tìm user theo ID
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { role: true },
    });

    if (!user) throw new NotFoundException("Không tìm thấy người dùng");

    // 2. Chặn người không phải listener
    if (user.role?.id !== 2) {
      throw new BadRequestException("Chỉ người dùng (listener) mới được nâng quyền");
    }

    // 3. Lấy role admin
    const adminRole = await this.roleRepo.findOne({ where: { id: 1 } });

    if (!adminRole) {
      throw new BadRequestException("Không tìm thấy role Admin (id = 1)");
    }

    // 4. Cập nhật role
    user.role = adminRole;

    await this.userRepo.save(user);

    return {
      message: "Nâng quyền thành công!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: "admin",
      },
    };
  }

  async softDeleteAdmin(id: number) {
    const admin = await this.userRepo.findOne({
      where: { id },
      relations: ['role']
    });

    if (!admin) {
      throw new NotFoundException('Admin không tồn tại');
    }

    if (admin.role.id !== 1) {
      throw new BadRequestException('Chỉ có thể xoá admin (role = 1)');
    }

    admin.active = 0; // xoá mềm
    await this.userRepo.save(admin);

    return { message: 'Xoá admin thành công' };
  }


  async softDeleteUser(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { role: true },
    });

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    if (user.active === 0) {
      throw new BadRequestException("Người dùng đã bị xoá trước đó");
    }

    user.active = 0; // ← XÓA MỀM
    await this.userRepo.save(user);

    return { message: "Xoá người dùng thành công (soft delete)" };
  }


  async updateAdmin(id: number, dto: UpdateAdminDto) {
    const admin = await this.userRepo.findOne({
      where: { id },
      relations: { role: true },
    });

    if (!admin) throw new NotFoundException('Admin không tồn tại');

    // Chỉ cho update admin
    if (admin.role.id !== 1) {
      throw new BadRequestException('Chỉ admin mới được chỉnh sửa ở chức năng này');
    }

    // Kiểm tra email trùng
    if (dto.email) {
      const exists = await this.userRepo.findOne({
        where: { email: dto.email, id: Not(id) },  
      });
      if (exists) {
        throw new BadRequestException('Email đã tồn tại!');
      }
    }

    // Cập nhật cơ bản
    if (dto.username) admin.username = dto.username;
    if (dto.email) admin.email = dto.email;

    // Nếu có mật khẩu mới → hash lại
    if (dto.password && dto.password.trim() !== '') {
      const hashed = await bcrypt.hash(dto.password, 10);
      admin.password = hashed;
    }

    await this.userRepo.save(admin);

    return {
      message: "Cập nhật Admin thành công",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    };
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Cập nhật thông tin cơ bản
    if (dto.username) user.username = dto.username;
    if (dto.email) user.email = dto.email;
    if (dto.birth_year) user.birth_year =Number(dto.birth_year);
    if (dto.gender) user.gender = dto.gender;

    // Nếu FE có gửi mật khẩu mới → hash lại
    if (dto.password && dto.password.trim() !== "") {
      const bcrypt = require('bcrypt');
      const hashed = await bcrypt.hash(dto.password, 10);
      user.password = hashed;
    }

    await this.userRepo.save(user);

    return {
      message: "Cập nhật người dùng thành công",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        birth_year: user.birth_year,
        gender: user.gender,
      }
    };
  }


}
