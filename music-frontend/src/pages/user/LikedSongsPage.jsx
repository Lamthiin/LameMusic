// music-frontend/src/pages/ProfileUser/LikedSongsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLikedSongs, toggleLikeSongApi } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import './LikedSongsPage.css';
import { FaPlay, FaHeart } from 'react-icons/fa';
import SongListTable from '../../components/user/SongListTable';

// === DÙNG CHÍNH XÁC HÀM fixUrl CỦA BẠN (NHƯ CÁC TRANG KHÁC) ===
const fixUrl = (url, type = 'image') => {
  if (!url) {
    if (type === 'artist') return '/images/default-artist.png';
    if (type === 'audio') return ''; // Trả về rỗng nếu không có file nhạc
    return '/images/default-album.png';
  }
  if (url.startsWith('http')) {
    return url;
  }
  const prefix = type === 'image' ? '/media/images' : '/media/audio';
  const originalPath = type === 'image' ? '/images' : '/audio';

  if (url.startsWith(prefix)) {
    return `http://localhost:3000${url}`;
  }

  return `http://localhost:3000${url.replace(originalPath, prefix)}`;
};
// ====================================================================

const showToast = (message) => { alert(message); };

const LikedSongsPage = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const navigate = useNavigate();

  const loadLikedSongs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLikedSongs();

      const songsOnly = data
        .map((item) => {
          const song = item.song;
          if (!song) return null;

          return {
            ...song,
            // Ảnh: ưu tiên image_url → album.cover_url → default
            image_url: fixUrl(song.image_url || song.album?.cover_url, 'image'),
            // File nhạc: BẮT BUỘC phải fix để tải được
            file_url: fixUrl(song.file_url, 'audio'),
            // Giữ lại album cover nếu cần (cho SongListTable)
            album: song.album
              ? { ...song.album, cover_url: fixUrl(song.album.cover_url, 'image') }
              : null,
            is_liked: true,
          };
        })
        .filter(Boolean);

      setLikedSongs(songsOnly);
    } catch (err) {
      console.error("Lỗi tải danh sách yêu thích:", err);
      showToast("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLikedSongs();
  }, [loadLikedSongs]);

  const handleUnlikeSong = async (songId) => {
    if (!window.confirm('Bạn có muốn xóa bài hát này khỏi danh sách yêu thích?')) return;
    try {
      await toggleLikeSongApi(songId);
      showToast('Đã xóa khỏi danh sách yêu thích');
      loadLikedSongs(); // Refresh lại danh sách
    } catch (error) {
      showToast('Lỗi khi bỏ thích');
    }
  };

  const playAllLiked = () => {
    if (likedSongs.length > 0) {
      playTrack(likedSongs[0], likedSongs, 0);
    }
  };

  if (loading) {
    return <div className="loading-message">Đang tải danh sách yêu thích...</div>;
  }

  return (
    <div className="liked-songs-container">
      {/* Header */}
      <div className="playlist-header">
        <div className="playlist-cover-art">
          <FaHeart size={80} color="#ff4d8d" />
        </div>
        <div className="playlist-info">
          <p className="playlist-type">PLAYLIST</p>
          <h1 className="playlist-title">Bài hát đã thích</h1>
          <p className="playlist-owner">
            {user?.username || 'Bạn'} • {likedSongs.length} bài hát
          </p>
          <button className="playlist-play-button" onClick={playAllLiked}>
            <FaPlay size={20} /> PHÁT TẤT CẢ
          </button>
        </div>
      </div>

      {/* Danh sách bài hát */}
      <div className="song-list-wrapper">
        {likedSongs.length > 0 ? (
          <SongListTable
            songs={likedSongs}
            onUnlike={handleUnlikeSong} // Hiển thị nút bỏ thích
          />
        ) : (
          <div className="empty-state">
            <FaHeart size={60} color="#666" />
            <p>Chưa có bài hát nào được thích</p>
            <p className="subtle-text">Nhấn trái tim để thêm bài hát vào đây nhé!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongsPage;