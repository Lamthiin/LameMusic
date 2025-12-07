// music-frontend/src/pages/ProfileUser/LikedSongsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLikedSongs, toggleLikeSongApi } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import './LikedSongsPage.css';
import { FaPlay, FaHeart } from 'react-icons/fa';
import SongListTable from '../../components/user/SongListTable';

const fixUrl = (url, type = 'image') => {
  if (!url) {
    if (type === 'artist') return '/images/default-artist.png';
    if (type === 'audio') return '';
    return '/images/default-album.png';
  }
  if (url.startsWith('http')) return url;
  const prefix = type === 'image' ? '/media/images' : '/media/audio';
  const originalPath = type === 'image' ? '/images' : '/audio';
  if (url.startsWith(prefix)) return `http://localhost:3000${url}`;
  return `http://localhost:3000${url.replace(originalPath, prefix)}`;
};

const showToast = (message) => alert(message);

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
            image_url: fixUrl(song.image_url || song.album?.cover_url, 'image'),
            file_url: fixUrl(song.file_url, 'audio'),
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
      loadLikedSongs();
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
    return <div className="liked-page-loading">Đang tải danh sách yêu thích...</div>;
  }

  return (
    <div className="liked-page">
      <div className="liked-header">
        <div className="liked-header-icon">
          <FaHeart size={70} color="#ff4d8d" />
        </div>

        <div className="liked-header-info">
          <p className="liked-header-type">PLAYLIST</p>
          <h1 className="liked-header-title">Bài hát đã thích</h1>
          <p className="liked-header-owner">
            {user?.username || 'Bạn'} • {likedSongs.length} bài hát
          </p>

          <button className="liked-play-btn" onClick={playAllLiked}>
            <FaPlay size={18} /> Phát tất cả
          </button>
        </div>
      </div>

      <div className="liked-song-table">
        {likedSongs.length > 0 ? (
          <SongListTable songs={likedSongs} onUnlike={handleUnlikeSong} />
        ) : (
          <div className="liked-empty">
            <FaHeart size={55} color="#999" />
            <p>Chưa có bài hát yêu thích</p>
            <p className="liked-empty-sub">Hãy thích một bài hát để thêm vào danh sách!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongsPage;
