import { Injectable, NotFoundException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';


@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getCustomers() {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .where('role.id IN (:...roles)', { roles: [2, 3] })
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
      .where('role.id = :role', { role: 1 })   // CHỈ lấy Super Admin
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

  async createUser(dto: CreateUserDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    const newUser = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      password: dto.password,
      role: { id: 2 },               // ROLE 2 = LISTENER
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
        role: 'listener',            // Trả đúng theo role 2
      }
    };
  }



}
