// music-frontend/src/pages/PlaylistDetailPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicPlaylistApi, removeSongFromPlaylistApi } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import SongListTable from '../../components/user/SongListTable';
import './LikedSongsPage.css';
import './AlbumDetailPage.css';
import { FaPlay } from 'react-icons/fa';

// ──────────────────────────────────────────────────────────────
// HÀM fixUrl CHÍNH XÁC NHƯ BẠN ĐÃ DÙNG Ở CÁC TRANG KHÁC
// ──────────────────────────────────────────────────────────────
const fixUrl = (url, type = 'image') => {
  if (!url) {
    if (type === 'artist') return '/images/default-artist.png';
    if (type === 'audio') return ''; // Không có file nhạc
    return '/images/default-album.png';
  }
  if (url.startsWith('http')) return url;

  const prefix = type === 'image' ? '/media/images' : '/media/audio';
  const originalPath = type === 'image' ? '/images' : '/audio';

  if (url.startsWith(prefix)) {
    return `http://localhost:3000${url}`;
  }
  return `http://localhost:3000${url.replace(originalPath, prefix)}`;
};

const showToast = (message) => alert(message);
// ──────────────────────────────────────────────────────────────

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tải lại playlist (có thể gọi lại khi xóa bài)
  const loadPlaylist = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicPlaylistApi(id);

      // Fix toàn bộ URL một cách sạch sẽ và nhất quán
      const fixedSongs = (data.songs || []).map((song) => ({
        ...song,
        // Ảnh bài hát hoặc album
        image_url: fixUrl(song.image_url || song.album?.cover_url, 'image'),
        // File nhạc – BẮT BUỘC phải fix để phát/tải được
        file_url: fixUrl(song.file_url, 'audio'),
        // Fix cover album nếu có
        album: song.album
          ? { ...song.album, cover_url: fixUrl(song.album.cover_url, 'image') }
          : null,
      }));

      setPlaylist(data);
      setSongs(fixedSongs);
    } catch (err) {
      console.error(err);
      showToast('Không tìm thấy playlist hoặc bạn không có quyền truy cập');
      setPlaylist(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  // XÓA BÀI KHỎI PLAYLIST (chỉ chủ sở hữu mới được)
  const handleRemoveSong = async (songId) => {
    if (!window.confirm('Xóa bài hát này khỏi playlist?')) return;

    try {
      await removeSongFromPlaylistApi(playlist.id, songId);
      showToast('Đã xóa bài hát khỏi playlist');
      loadPlaylist(); // Refresh lại danh sách
    } catch (err) {
      showToast(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const playAll = () => {
    if (songs.length > 0) {
      playTrack(songs[0], songs, 0);
    }
  };

  // Kiểm tra quyền sở hữu
  const isOwner = user && playlist?.user?.id === user.userId;

  // ─────────────────────── RENDER ───────────────────────
  if (loading) {
    return <div className="loading-message">Đang tải playlist...</div>;
  }

  if (!playlist) {
    return <div className="error-message">Playlist không tồn tại hoặc đã bị xóa.</div>;
  }

  return (
    <div className="liked-songs-container">
      {/* HEADER PLAYLIST */}
      <div className="playlist-header">
        <div className="playlist-cover-art">
          {playlist.cover_url ? (
            <img src={fixUrl(playlist.cover_url, 'image')} alt={playlist.name} />
          ) : (
            <div className="default-cover">
              <FaPlay size={60} />
            </div>
          )}
        </div>

        <div className="playlist-info">
          <p className="playlist-type">
            PLAYLIST {playlist.is_private ? '(RIÊNG TƯ)' : '(CÔNG KHAI)'}
          </p>
          <h1 className="playlist-title">{playlist.name}</h1>
          <p className="playlist-owner">
            Tạo bởi <strong>{playlist.user?.username || 'Ẩn danh'}</strong> •{' '}
            {songs.length} bài hát
          </p>
          <button className="playlist-play-button" onClick={playAll}>
            <FaPlay size={20} /> PHÁT TẤT CẢ
          </button>
        </div>
      </div>

      {/* DANH SÁCH BÀI HÁT */}
      <div className="song-list-wrapper">
        {songs.length > 0 ? (
          <SongListTable
            songs={songs}
            // Chỉ hiện nút xóa nếu là chủ sở hữu
            onRemoveSong={isOwner ? handleRemoveSong : null}
          />
        ) : (
          <div className="empty-state">
            <p>Playlist này chưa có bài hát nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetailPage;