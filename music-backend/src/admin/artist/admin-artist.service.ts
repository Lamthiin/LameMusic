import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
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
      where: { registrationStatus: 'APPROVED', active: 1, user: Not(IsNull()) },
      relations: ['user', 'albums', 'songs'],
      order: { updated_at: 'DESC' },
    })
    .then(list =>
    list.map(a => ({
      ...a,
      total_albums: a.albums?.length || 0,
      total_songs: a.songs?.length || 0,
    }))
  );
  }

  findInactive() {
    return this.artistRepository.find({
      where: { registrationStatus: 'APPROVED', active: 1, user: IsNull() },
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
  async updateArtist(id: number, data: any, file?: Express.Multer.File) {
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) throw new NotFoundException('Artist không tồn tại');

    if (data.stage_name !== undefined) artist.stage_name = data.stage_name;
    if (data.bio !== undefined) artist.bio = data.bio;

    if (file) {
      artist.avatar_url = `/uploads/avatars/${file.filename}`;
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

  

  async setPending(id: number) {
    // 1. Tìm Artist
    const artist = await this.artistRepository.findOne({ where: { id } });

    if (!artist) {
      throw new NotFoundException('Artist không tồn tại');
    }

    // 2. Cập nhật trạng thái
    artist.registrationStatus = 'PENDING';
    artist.active = 1; // Đảm bảo active = 1 (trừ khi bạn muốn active=0 khi pending)

    // 3. Lưu thay đổi
    return this.artistRepository.save(artist);
  }

  // DANH SÁCH NGHỆ SĨ TRỰC THUỘC LAME MUSIC (user_id = null)
  async findInternal() {
    return this.artistRepository.find({
      where: {
        user: IsNull(),  // 🔥 CHUẨN | không user_id -> true
        active: 1,
      },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  async findFullDetail(id: number) {
  const artist = await this.artistRepository.findOne({
    where: { id },
    relations: [
      "user",
      "albums",
      "songs",
      "followers", // nếu cần dùng followers.length
      "songs.album", // để lấy album title
    ],
  });

  if (!artist) {
    throw new NotFoundException("Artist không tồn tại");
  }

  return {
    id: artist.id,
    stage_name: artist.stage_name,
    bio: artist.bio,
    avatar_url: artist.avatar_url,
    created_at: artist.created_at,
    updated_at: artist.updated_at,
    registrationStatus: artist.registrationStatus,
    user_id: artist.user_id,

    total_albums: artist.albums?.length || 0,
    total_songs: artist.songs?.length || 0,
    total_followers: artist.followers?.length || 0,

    albums: artist.albums.map(a => ({
      id: a.id,
      title: a.title,
      cover_url: a.cover_url,
      created_at: a.created_at,
    })),

    songs: artist.songs.map(s => ({
      id: s.id,
      title: s.title,
      duration: s.duration,
      album_id: s.album?.id || null,
      album_title: s.album?.title || null,

      status: s.status || "UNKNOWN"
    }))
  };
}


}

