import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from '../../artist/artist.entity';
import { User } from '../../user/user.entity';
import { Role } from '../../role/role.entity';

@Injectable()
export class AdminArtistService {
  constructor(
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // ADMIN: Danh sách nghệ sĩ chờ duyệt
  findPending() {
    return this.artistRepository.find({
      where: { registrationStatus: 'PENDING' },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  // ADMIN: Danh sách đã duyệt
  findApproved() {
    return this.artistRepository.find({
      where: { registrationStatus: 'APPROVED' },
      relations: ['user'],
      order: { updated_at: 'DESC' },
    });
  }

  // ADMIN: Chi tiết 1 nghệ sĩ
  async findOne(id: number) {
    const artist = await this.artistRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!artist) throw new NotFoundException('Artist không tồn tại');
    return artist;
  }

  // ADMIN: Duyệt nghệ sĩ
  async approve(id: number) {
    const artist = await this.artistRepository.findOne({
      where: { id, registrationStatus: 'PENDING' },
      relations: ['user', 'user.role'],
    });

    if (!artist)
      throw new NotFoundException('Không tìm thấy hồ sơ hoặc đã duyệt');

    // Cập nhật trạng thái
    artist.registrationStatus = 'APPROVED';

    // Đổi role user → artist
    const artistRole = await this.roleRepository.findOne({
      where: { name: 'artist' },
    });

    if (artistRole) {
      artist.user.role = artistRole;
      await this.userRepository.save(artist.user);
    }

    return this.artistRepository.save(artist);
  }

  // ADMIN: Từ chối nghệ sĩ
  async reject(id: number) {
    const artist = await this.artistRepository.findOne({
      where: { id, registrationStatus: 'PENDING' },
    });

    if (!artist)
      throw new NotFoundException('Không tìm thấy hồ sơ hoặc đã xử lý');

    artist.registrationStatus = 'REJECTED';
    artist.active = 0;

    return this.artistRepository.save(artist);
  }
}
