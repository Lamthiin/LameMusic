import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../user/user.entity';

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
        'role.id AS role_id',
        'user.created_at AS created_at',
      ])
      .orderBy('user.id', 'ASC')
      .getRawMany();
  }


}
