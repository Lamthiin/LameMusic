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

  // DANH SÁCH PENDING
  findPending() {
    return this.artistRepository.find({
      where: { registrationStatus: 'PENDING', active: 1 },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  // DANH SÁCH APPROVED
  findApproved() {
    return this.artistRepository.find({
      where: { registrationStatus: 'APPROVED', active: 1 },
      relations: ['user'],
      order: { updated_at: 'DESC' },
    });
  }

  // DANH SÁCH REJECTED
  findRejected() {
    return this.artistRepository.find({
      where: { registrationStatus: 'REJECTED' },
      relations: ['user'],
      order: { updated_at: 'DESC' },
    });
  }

  // LẤY 1 ARTIST
  async findOne(id: number) {
    const artist = await this.artistRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!artist) throw new NotFoundException('Artist không tồn tại');
    return artist;
  }

  // DUYỆT / PHÊ DUYỆT LẠI
  async approve(id: number) {
    const artist = await this.artistRepository.findOne({ where: { id } });

    if (!artist) throw new NotFoundException('Artist không tồn tại');

    artist.registrationStatus = 'APPROVED';
    artist.active = 1;

    return this.artistRepository.save(artist);
  }

  // TỪ CHỐI ARTIST
  async reject(id: number) {
    const artist = await this.artistRepository.findOne({
      where: { id, registrationStatus: 'PENDING' },
    });

    if (!artist)
      throw new NotFoundException('Không tìm thấy hồ sơ hoặc đã xử lý');

    artist.registrationStatus = 'REJECTED';
    artist.active = 1; // ⭐ GIỮ ACTIVE = 1 (để hiện bên tab Rejected)

    return this.artistRepository.save(artist);
  }

  // THÊM ARTIST (Admin thêm)
  async createArtist(data: any) {
    const newArtist = this.artistRepository.create({
      stage_name: data.stage_name,
      bio: data.bio || '',
      avatar_url: data.avatar_url || null,
      registrationStatus: 'APPROVED',
      active: 1,
      user: null,
    });

    return this.artistRepository.save(newArtist);
  }

  // UPDATE ARTIST
  async updateArtist(id: number, data: any) {
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) throw new NotFoundException('Artist không tồn tại');

    artist.stage_name = data.stage_name ?? artist.stage_name;
    artist.bio = data.bio ?? artist.bio;

    if (data.avatar_url !== undefined) {
      artist.avatar_url = data.avatar_url;
    }

    return this.artistRepository.save(artist);
  }

  // XOÁ HỒ SƠ (soft delete)
  async deleteArtist(id: number) {
    const artist = await this.artistRepository.findOne({ where: { id } });

    if (!artist) throw new NotFoundException('Artist không tồn tại');

    artist.active = 0; // ⭐ XÓA = active=0, giữ nguyên status

    return this.artistRepository.save(artist);
  }
}
