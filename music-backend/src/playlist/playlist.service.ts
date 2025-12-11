// music-backend/src/playlist/playlist.service.ts (FULL CODE)
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './playlist.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { User } from '../user/user.entity';
import { Song } from '../song/song.entity'; // <-- (1) IMPORT SONG
import { PlaylistSong } from './playlist-song.entity';
import { In } from 'typeorm';


@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Song) // <-- (2) INJECT SONG REPO
    private songRepository: Repository<Song>,
    @InjectRepository(PlaylistSong)
    private readonly playlistSongRepository: Repository<PlaylistSong>,
  ) {}

  /**
   * TẠO PLAYLIST MỚI (Đã fix logic Public/Private)
   */
  async create(userId: number, createPlaylistDto: CreatePlaylistDto): Promise<Playlist> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    
    const privateStatus = createPlaylistDto.isPrivate ? 1 : 0; 

    const newPlaylist = this.playlistRepository.create({
      name: createPlaylistDto.name,
      user: user,
      is_active: 1,      
      is_private: privateStatus, 
    });

    return this.playlistRepository.save(newPlaylist);
  }

  /**
   * === HÀM MỚI: Lấy tất cả playlist của 1 user ===
   */
  async findMyPlaylists(userId: number): Promise<Playlist[]> {
    return this.playlistRepository.find({
      where: { 
        user: { id: userId },
        is_active: 1 
      },
      order: { created_at: 'DESC' } // Playlist mới nhất lên đầu
    });
  }

  /**
   * === HÀM MỚI: Tìm playlist theo ID (kèm bài hát) ===
   */
  async findPublicById(id: number): Promise<Playlist> {
    const playlist = await this.playlistRepository
      .createQueryBuilder('playlist')
      .leftJoinAndSelect('playlist.user', 'user')
      .leftJoinAndSelect('playlist.playlistSongs', 'ps', 'ps.is_active = 1')
      .leftJoinAndSelect('ps.song', 'song')
      .leftJoinAndSelect('song.songArtists', 'sa', 'sa.active = 1')
      .leftJoinAndSelect('sa.artist', 'artist', 'artist.active = 1')
      .leftJoinAndSelect('song.album', 'album')
      .where('playlist.id = :id', { id })
      .andWhere('playlist.is_active = 1')
      .getOne();

    
    if (!playlist) {
      throw new NotFoundException('Không tìm thấy playlist.');
    }
    
    // Kiểm tra nếu Playlist là Riêng tư
    if (playlist.is_private === 1) {
        // (Trong tương lai, bạn có thể check 'userId' (optional auth) ở đây)
        throw new UnauthorizedException('Bạn không có quyền xem playlist riêng tư này.');
    }

    // Xóa thông tin nhạy cảm của chủ sở hữu
    if (playlist.user) {
      const { password, ...safeUser } = playlist.user;
      playlist.user = safeUser as User;
    }
    
    return playlist;
  }
async findMyPlaylistById(userId: number, playlistId: number): Promise<Playlist> {
    const playlist = await this.playlistRepository.createQueryBuilder('playlist')
        .leftJoinAndSelect('playlist.user', 'user')
        .leftJoinAndSelect('playlist.playlistSongs', 'playlistSong', 'playlistSong.is_active = :activeStatus', { activeStatus: 1 })
        .leftJoinAndSelect('playlistSong.song', 'song')
        .leftJoinAndSelect(
            'song.songArtists',
            'songArtist',
            'songArtist.active = 1'
        )
        .leftJoinAndSelect(
            'songArtist.artist',
            'artist',
            'artist.active = 1'
        )       // lấy tất cả artist
        .leftJoinAndSelect('song.album', 'album')
        .where('playlist.id = :playlistId', { playlistId })
        .andWhere('user.id = :userId', { userId })
        .andWhere('playlist.is_active = 1')
        .orderBy('playlistSong.order', 'ASC')
        .getOne();

    if (!playlist) {
        throw new NotFoundException('Playlist không tồn tại hoặc không thuộc về bạn.');
    }

    // Gỡ bỏ playlistSongs, tạo mảng songs với đầy đủ artist
    const songs = (playlist.playlistSongs || []).map(ps => ({
        ...ps.song,
        order: ps.order,
        artists: (ps.song.songArtists || []).map(sa => sa.artist),
    }));

    (playlist as any).songs = songs;

    return playlist;
}

  /**
   * (USER) Xóa Playlist (Soft Delete: Đặt is_active = 0)
   */
  async deleteMyPlaylist(userId: number, playlistId: number): Promise<{ message: string }> {
    // 1. Tìm Playlist để kiểm tra quyền sở hữu
    const playlist = await this.playlistRepository.findOne({
      where: { id: playlistId, user: { id: userId }, is_active: 1 }, // Chỉ tìm playlist đang active
    });

    if (!playlist) {
      throw new NotFoundException('Playlist không tồn tại hoặc bạn không có quyền xóa.');
    }

    // 2. THỰC HIỆN SOFT DELETE (Chuyển is_active = 0)
    // Dùng update để chỉ cập nhật cột này
    const updateResult = await this.playlistRepository.update(playlistId, { is_active: 0 }); 

    if (updateResult.affected === 0) {
         // Trường hợp lỗi bất ngờ (có thể đã bị xóa/ẩn rồi)
         throw new NotFoundException('Xóa thất bại (Không tìm thấy bản ghi active).');
    }

    return { message: 'Playlist đã được ẩn thành công (Soft Deleted).' };
  }

  /**
   * (USER) Xóa bài hát khỏi Playlist (Soft Delete liên kết: Đặt is_active = 0)
   */
  async removeSongFromPlaylist(userId: number, playlistId: number, songId: number): Promise<{ message: string }> {
    // Kiểm tra quyền sở hữu Playlist (giữ nguyên logic cũ)
    const playlist = await this.playlistRepository.findOne({
      where: { id: playlistId, user: { id: userId }, is_active: 1 },
    });
    if (!playlist) {
      throw new NotFoundException('Playlist không tồn tại hoặc bạn không có quyền sửa.');
    }
    
    // 1. Tìm bản ghi liên kết trong bảng trung gian (Playlist_Songs)
    const playlistSong = await this.playlistSongRepository.findOne({
        where: { playlist: { id: playlistId }, song: { id: songId }, is_active: 1 }
    });

    if (!playlistSong) {
      throw new NotFoundException('Bài hát không tồn tại trong Playlist này.');
    }
    
    // 2. SOFT DELETE: Đặt is_active = 0 trên bản ghi liên kết
    await this.playlistSongRepository.update(playlistSong.id, { is_active: 0 });

    return { message: 'Bài hát đã được ẩn khỏi Playlist thành công.' };
  }
  /**
   * HÀM MỚI: Thêm bài hát HÀNG LOẠT vào Playlist
   */
async addSongToPlaylist(
  userId: number, 
  playlistId: number, 
  songId: number // Chỉ 1 bài hát
): Promise<Playlist> {

  // 1. Tìm Playlist và kiểm tra quyền
  const playlist = await this.playlistRepository.findOne({
    where: { id: playlistId, is_active: 1 },
    relations: ['user', 'playlistSongs', 'playlistSongs.song']
  });

  if (!playlist) throw new NotFoundException('Playlist không tồn tại.');
  if (playlist.user.id !== userId) {
    throw new UnauthorizedException('Bạn không có quyền sửa playlist này.');
  }

  // 2. Lấy bài hát cần thêm
  const song = await this.songRepository.findOne({
      where: { id: songId, active: true, status: 'APPROVED' }
  });
  if (!song) throw new NotFoundException('Bài hát không tồn tại.');

  // 3. Kiểm tra duplicate trong playlist
  const existing = playlist.playlistSongs.find(
    ps => ps.song.id === song.id
  );

  if (existing) {
    if (existing.is_active === 1) {
      throw new BadRequestException('Bài hát đã có trong playlist.');
    } else {
      // Nếu trước đây đã soft delete, bật lại
      existing.is_active = 1;
      await this.playlistSongRepository.save(existing);
    }
  } else {
    // Thêm mới vào playlist
    const newPlaylistSong = this.playlistSongRepository.create({
      playlist,
      song,
      is_active: 1,
      order: playlist.playlistSongs.length
    });
    await this.playlistSongRepository.save(newPlaylistSong);
  }

  // 4. Tải lại playlist để trả về
  const updatedPlaylist = await this.playlistRepository.findOne({
    where: { id: playlistId },
    relations: ['user', 'playlistSongs', 'playlistSongs.song']
  });

  if (!updatedPlaylist) throw new NotFoundException('Playlist không tồn tại');

  return updatedPlaylist;
}

}