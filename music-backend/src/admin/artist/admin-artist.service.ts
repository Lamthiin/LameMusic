import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Artist } from '../../artist/artist.entity';
import { User } from '../../user/user.entity';
import { Role } from '../../role/role.entity';
import { R2Service } from 'src/shared/r2.service';

@Injectable()
export class AdminArtistService {
  constructor(
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private readonly r2: R2Service, 
  ) {}

  async findAll() {
    return this.artistRepository.find({
      order: { stage_name: "ASC" }
    });
  }


  // DANH SÁCH PENDING
  findPending() {
    return this.artistRepository.find({
      where: { registrationStatus: 'PENDING', active: 1 },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }
    findApproved() {
      return this.artistRepository.find({
        where: { registrationStatus: 'APPROVED', active: 1, user: Not(IsNull()) },
        relations: ['user', 'albums', 'songArtists', 'songArtists.song', 'songArtists.song.album'],
        order: { updated_at: 'DESC' },
      })
      .then(list =>
        list.map(a => ({
          ...a,
          total_albums: a.albums?.length || 0,
          total_songs: a.songArtists?.length || 0,
          songs: a.songArtists?.map(sa => ({
            id: sa.song.id,
            title: sa.song.title,
            duration: sa.song.duration,
            album_id: sa.song.album?.id || null,
            album_title: sa.song.album?.title || null,
            album_cover_url: this.normalizeUrl(sa.song.album?.cover_url || null),
          })) || []
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

  // 🔥 LẤY TẤT CẢ NGHỆ SĨ APPROVED (không lọc user_id)
  async findAllApprovedArtists() {
    return this.artistRepository.find({
      where: { registrationStatus: 'APPROVED', active: 1 },
      order: { stage_name: 'ASC' },
    });
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

  private normalizeUrl(url: string | null): string | null {
  if (!url) return null;

  // Nếu là đường dẫn local → convert sang BE host
  if (url.startsWith("\\") || url.startsWith("/")) {
    return `http://localhost:3000${url.replace(/\\/g, "/")}`;
  }

  return url; // Cloudflare URL giữ nguyên
}
  // THÊM ARTIST (Admin thêm)
  async createArtist(data: any, file?: Express.Multer.File) {
  let avatarUrl: string | null = null;

  if (file) {
    const uploaded = await this.r2.uploadFile(
      "artistscover",
      file.originalname,
      file.buffer,
      file.mimetype,
    );
    avatarUrl = uploaded.url;
  } else {
    // fallback ảnh mặc định
    avatarUrl = "/uploads/defaults/default-artist.png";
  }

  const artist = this.artistRepository.create({
    stage_name: data.stage_name,
    bio: data.bio || "",
    avatar_url: avatarUrl,
    registrationStatus: "APPROVED",
    active: 1,
    user: null,
  });

  return this.artistRepository.save(artist);
}



  // UPDATE ARTIST
  async updateArtist(id: number, data: any, file?: Express.Multer.File) {
  const artist = await this.artistRepository.findOne({ where: { id } });
  if (!artist) throw new NotFoundException("Artist không tồn tại");

  if (data.stage_name !== undefined) artist.stage_name = data.stage_name;
  if (data.bio !== undefined) artist.bio = data.bio;

  // ⭐ Nếu có ảnh mới → upload lên Cloudflare R2
  if (file) {

    // XÓA ẢNH CŨ nếu có
    if (artist.avatar_url && artist.avatar_url.includes("r2.dev")) {
      try {
        await this.r2.deleteFileByUrl(artist.avatar_url);
      } catch (err) {
        console.warn("Không thể xoá ảnh cũ R2:", err.message);
      }
    }

    // UPLOAD ẢNH MỚI
    const uploaded = await this.r2.uploadFile(
      "artistscover",
      file.originalname,
      file.buffer,
      file.mimetype,
    );

    artist.avatar_url = uploaded.url; // ⭐ URL thật từ Cloudflare
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
      "followers",
      "songs.album",
    ],
  });

  if (!artist) throw new NotFoundException("Artist không tồn tại");

  return {
    id: artist.id,
    stage_name: artist.stage_name,
    bio: artist.bio,
    avatar_url: this.normalizeUrl(artist.avatar_url),

    created_at: artist.created_at,
    updated_at: artist.updated_at,
    registrationStatus: artist.registrationStatus,
    user_id: artist.user_id,

    total_albums: artist.albums?.length || 0,
    total_songs: artist.songArtists?.length || 0,
    songs: artist.songArtists.map(sa => ({
      id: sa.song.id,
      title: sa.song.title,
      duration: sa.song.duration,
      image_url: this.normalizeUrl(sa.song.image_url),
      album_id: sa.song.album?.id || null,
      album_title: sa.song.album?.title || null,
      album_cover_url: this.normalizeUrl(sa.song.album?.cover_url || null),
      status: sa.song.status || 'UNKNOWN',
    })),
    total_followers: artist.followers?.length || 0,

    // ⭐ FIX ALBUM COVER URL HERE
    albums: artist.albums.map(a => ({
      id: a.id,
      title: a.title,
      cover_url: this.normalizeUrl(a.cover_url),
      created_at: a.created_at,
    })),

    // // ⭐ FIX SONG IMAGE_URL + ALBUM COVER
    // songs: artist.songs.map(s => ({
    //   id: s.id,
    //   title: s.title,
    //   duration: s.duration,

    //   image_url: this.normalizeUrl(s.image_url),

    //   album_id: s.album?.id || null,
    //   album_title: s.album?.title || null,
    //   album_cover_url: this.normalizeUrl(s.album?.cover_url || null),

    //   status: s.status || "UNKNOWN",
    // }))
  };
}
}

