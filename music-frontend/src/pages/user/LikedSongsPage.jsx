// music-frontend/src/pages/ProfileUser/LikedSongsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLikedSongs, toggleLikeSongApi } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import './LikedSongsPage.css';
import { FaPlay, FaHeart } from 'react-icons/fa';
import SongListTable from '../../components/user/SongListTable'; 

const showToast = (message) => { alert(message); };

const fixImageUrl = (url) => {
  if (!url) return '/images/default-album.png';
  if (url.startsWith('http')) return url;
  const correctedUrl = url.replace('/images', '/media/images');
  return `http://localhost:3000${correctedUrl}`;
};

const LikedSongsPage = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const navigate = useNavigate();

  const loadLikedSongs = useCallback(async () => {
    setLoading(true);
    const data = await fetchLikedSongs();

    const songsOnly = data
      .map((item) => {
        const song = item.song;
        if (!song) return null;

        const coverUrl = song.image_url 
          ? fixImageUrl(song.image_url) 
          : (song.album?.cover_url ? fixImageUrl(song.album.cover_url) : '/images/default-album.png');

        return {
          ...song,
          cover_url: coverUrl,
          is_liked: true
        };
      })
      .filter(Boolean);

    setLikedSongs(songsOnly);
    setLoading(false);
  }, []);

  useEffect(() => { loadLikedSongs(); }, [loadLikedSongs]);

  const handleUnlikeSong = async (songId) => {
    if (!window.confirm('Bạn có muốn xóa bài hát này khỏi danh sách yêu thích?')) return;
    try {
      await toggleLikeSongApi(songId);
      showToast('Đã xóa bài hát khỏi danh sách yêu thích.');
      loadLikedSongs();
    } catch (error) {
      showToast('Lỗi hủy yêu thích.', 'error');
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
      {/* Header Playlist (giữ nguyên) */}
      <div className="playlist-header">
        <div className="playlist-cover-art">
          <FaHeart size={60} />
        </div>
        <div className="playlist-info">
          <p className="playlist-type">PLAYLIST</p>
          <h1>Bài hát đã thích</h1>
          <p className="playlist-owner">
            {user?.username} • {likedSongs.length} bài hát
          </p>
          <button className="playlist-play-button" onClick={playAllLiked}>
            <FaPlay size={20} /> PHÁT TẤT CẢ
          </button>
        </div>
      </div>

      {/* Song List - tái sử dụng SongListTable */}
      <div className="song-list-wrapper">
        <SongListTable 
          songs={likedSongs} 
          onUnlike={handleUnlikeSong} 
        />
      </div>
    </div>
  );
};

export default LikedSongsPage;
