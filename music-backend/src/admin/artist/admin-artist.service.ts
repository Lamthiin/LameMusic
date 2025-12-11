import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull, Not } from 'typeorm';
import { Artist } from '../../artist/artist.entity';
import { User } from '../../user/user.entity';
import { Role } from '../../role/role.entity';
import { R2Service } from 'src/shared/r2.service';
import { NotificationType } from 'src/notification/notification.entity';
import { NotificationService } from '../../notification/notification.service';
import { Album } from '../../album/album.entity'; // Thêm dòng này
import { Song } from '../../song/song.entity'; // Thêm dòng này

@Injectable()
export class AdminArtistService {
  constructor(
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    // 💡 THÊM REPOSITORIES CẦN THIẾT CHO CASCADE
    @InjectRepository(Album)
    private albumRepository: Repository<Album>, // THÊM DÒNG NÀY
    @InjectRepository(Song)
    private songRepository: Repository<Song>, // THÊM DÒNG NÀY
    // 💡 THÊM DATASOURCE ĐỂ SỬ DỤNG TRANSACTION
    private dataSource: DataSource, // THÊM DÒNG NÀY
    private readonly r2: R2Service,
    private notificationService: NotificationService,
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

  // DANH SÁCH APPROVED
  findApproved() {
    return this.artistRepository.find({
      where: { registrationStatus: 'APPROVED', active: 1, user: Not(IsNull()) },
      // 🔧 Artist không còn quan hệ 'songs' → dùng songArtists
      relations: ['user', 'albums', 'songArtists', 'songArtists.song'],
      order: { updated_at: 'DESC' },
    })
    .then(list =>
      list.map(a => ({
        ...a,
        total_albums: a.albums?.length || 0,
        // 🔧 Đếm theo số record songArtists (số bài hát của artist)
        total_songs: a.songArtists?.length || 0,
      }))
    );
  }
  
  findInactive() {
    return this.artistRepository.find({
      where: { registrationStatus: 'APPROVED', active: 1, user: (IsNull()) },
      // 🔧 đổi 'songs' → 'songArtists'
      relations: ['user', 'albums', 'songArtists', 'songArtists.song'],
      order: { updated_at: 'DESC' },
    })
    .then(list =>
      list.map(a => ({
        ...a,
        total_albums: a.albums?.length || 0,
        total_songs: a.songArtists?.length || 0,
      }))
    );
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
  // Trong AdminArtistService.ts

  // DUYỆT / PHÊ DUYỆT LẠI
  async approve(id: number) {
    // ⭐ SỬA LỖI 1: Tải mối quan hệ 'user' để lấy user_id
    const artist = await this.artistRepository.findOne({ 
      where: { id },
      relations: ['user'] // THÊM DÒNG NÀY
    });

    if (!artist) throw new NotFoundException('Artist không tồn tại');

    artist.registrationStatus = 'APPROVED';
    artist.active = 1;
    
    // Lưu trước để đảm bảo trạng thái đã được cập nhật
    const savedArtist = await this.artistRepository.save(artist); 

    // Lấy user ID từ trường trực tiếp hoặc mối quan hệ
    const userId = artist.user_id || artist.user?.id; 

    if (userId) {
      await this.notificationService.createNotificationForUser(
        userId, // Dùng userId đã xác định
        artist.id,
        // ⭐ SỬA LỖI 2: Dùng ARTIST_APPROVED
        NotificationType.ARTIST_PROFILE_APPROVED, 
        `Hồ sơ đăng ký nghệ sỹ của bạn đã được duyệt!.`,
        artist.id
      );
    }
    
    return { artist: savedArtist, message: 'Đã phê duyệt nghệ sĩ thành công.' };
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

    const savedArtist = await this.artistRepository.save(artist);
    return { artist: savedArtist, message: 'Đã từ chối hồ sơ nghệ sĩ thành công.' }; // ⭐ Log thành công
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
    const savedArtist = await this.artistRepository.save(artist);
    return { artist: savedArtist, message: 'Đã thêm nghệ sĩ nội bộ thành công.' }; // ⭐ Log thành công
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
        } catch (err: any) {
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
    const savedArtist = await this.artistRepository.save(artist);
    return { artist: savedArtist, message: 'Đã cập nhật thông tin nghệ sĩ thành công.' }; // ⭐ Log thành công
  }


  async deleteArtist(id: number) {
  // Dùng transaction để nếu lỗi thì rollback toàn bộ
  return await this.artistRepository.manager.transaction(async (manager) => {
    // 1️⃣ Lấy artist kèm albums + songs trong album + songArtists (collab)
    const artist = await manager.findOne(Artist, {
      where: { id },
      relations: [
        'albums',
        'albums.songs',
        'songArtists',
        'songArtists.song',
        'songArtists.song.album',
      ],
    });

    if (!artist) {
      throw new NotFoundException('Artist không tồn tại');
    }

    // 2️⃣ Soft delete artist
    artist.active = 0;
    // registrationStatus thêm trạng thái REMOVED
    artist.registrationStatus = 'REMOVED' as any;
    await manager.save(artist);

    // 3️⃣ Albums của nghệ sĩ + các bài hát trong album đó
    if (artist.albums && artist.albums.length > 0) {
      for (const album of artist.albums) {
        album.active = false;

        if (album.songs && album.songs.length > 0) {
          for (const song of album.songs) {
            // giả sử Song có field active + status
            (song as any).active = false;
            (song as any).status = 'REMOVED';
          }
          await manager.save(album.songs);
        }
      }
      await manager.save(artist.albums);
    }

    // 4️⃣ Bài hát KHÔNG thuộc album nào nhưng có collab với artist này
    if (artist.songArtists && artist.songArtists.length > 0) {
      const standaloneSongsMap = new Map<number, Song>();

      for (const sa of artist.songArtists) {
        const song = sa.song;
        if (!song) continue;

        // chỉ xử lý bài không có album
        if (!song.album) {
          if (!standaloneSongsMap.has(song.id)) {
            standaloneSongsMap.set(song.id, song);
          }
        }
      }

      const standaloneSongs = Array.from(standaloneSongsMap.values());

      if (standaloneSongs.length > 0) {
        for (const song of standaloneSongs) {
          (song as any).active = false;
          (song as any).status = 'REMOVED';
        }
        await manager.save(standaloneSongs);
      }
    }

    return {
      message:
        'Đã xoá (soft delete) nghệ sĩ và cập nhật album, bài hát liên quan thành công.',
    };
  });
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
    const savedArtist = await this.artistRepository.save(artist);
    return { artist: savedArtist, message: 'Đã chuyển trạng thái nghệ sĩ sang chờ duyệt (Pending) thành công.' }; // ⭐ Log thành công
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

  async findRemoved() {
    const artists = await this.artistRepository.find({
      where: { active: 0 },
      // 🔧 đổi 'songs' → 'songArtists'
      relations: ['user', 'albums', 'songArtists', 'songArtists.song'],
      order: { updated_at: 'DESC' },
    });

    // Tính tổng albums và tổng songs
    return artists.map(a => ({
      ...a,
      total_albums: a.albums?.length || 0,
      total_songs: a.songArtists?.length || 0,
    }));
  }


  async findFullDetail(id: number) {
    const artist = await this.artistRepository.findOne({
      where: { id },
      relations: [
        "user",
        "albums",
        // 🔧 Artist không còn 'songs' trực tiếp
        "songArtists",
        "songArtists.song",
        "songArtists.song.album",
        "followers",
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
      // 🔧 tổng bài hát từ songArtists
      total_songs: artist.songArtists?.length || 0,
      total_followers: artist.followers?.length || 0,

      // ⭐ FIX ALBUM COVER URL HERE
      albums: artist.albums.map(a => ({
        id: a.id,
        title: a.title,
        cover_url: this.normalizeUrl(a.cover_url),
        created_at: a.created_at,
      })),

      // ⭐ FIX SONG IMAGE_URL + ALBUM COVER
      // 🔧 map từ artist.songArtists -> song
      songs: (artist.songArtists || []).map(sa => {
        const s = sa.song;
        // giả định luôn có s, giống logic cũ (không xử lý null)
        const minutes = Math.floor((s.duration || 0) / 60).toString().padStart(2, '0');
        const seconds = ((s.duration || 0) % 60).toString().padStart(2, '0');
        const durationStr = `${minutes}:${seconds}`;

        return {
          id: s.id,
          title: s.title,
          duration: durationStr, // giờ là mm:ss
          image_url: this.normalizeUrl(s.image_url),

          album_id: s.album?.id || null,
          album_title: s.album?.title || null,
          album_cover_url: this.normalizeUrl(s.album?.cover_url || null),

          status: s.status || "UNKNOWN",
        };
      })

    };
  }

  async getPaginatedArtists(page: number, take: number = 15) {
    
    // Tính toán vị trí bắt đầu bỏ qua (skip)
    const skip = (page - 1) * take;

    // Lấy danh sách nghệ sĩ và tổng số lượng cùng lúc
    const [artists, total] = await this.artistRepository.findAndCount({
      take, // Số lượng mỗi trang (mặc định 15)
      skip, // Vị trí bắt đầu
      order: { id: 'DESC' }, // Sắp xếp theo ID mới nhất
      // Tải các mối quan hệ cơ bản thường dùng
      // 🔧 đổi 'songs' → 'songArtists'
      relations: ['user', 'albums', 'songArtists', 'songArtists.song'] 
    });

    // Tính toán và định dạng dữ liệu trả về (tính thêm tổng album/song)
    const formattedArtists = artists.map(a => ({
      ...a,
      total_albums: a.albums?.length || 0,
      total_songs: a.songArtists?.length || 0,
      // Dọn dẹp mối quan hệ albums và songArtists nếu chúng quá lớn
      albums: undefined,
      songArtists: undefined,
    }));
    
    return {
      data: formattedArtists,
      currentPage: page,
      totalPages: Math.ceil(total / take),
      totalItems: total
    };
  }
  
}
