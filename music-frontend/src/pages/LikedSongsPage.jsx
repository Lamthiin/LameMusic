// music-frontend/src/pages/LikedSongsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLikedSongs } from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import './LikedSongsPage.css';
import { FaPlay, FaHeart } from 'react-icons/fa';
import SongListTable from '../components/SongListTable'; // <-- IMPORT MỚI

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

  useEffect(() => {
    const loadLikedSongs = async () => {
      setLoading(true);
      const data = await fetchLikedSongs();

      const songsOnly = data
        .map((item) => {
          const song = item.song;
          if (song) {
            if (song.album) {
              song.album.cover_url = fixImageUrl(song.album.cover_url);
            }
            song.image_url = song.image_url
              ? fixImageUrl(song.image_url)
              : song.album?.cover_url;

            if (song.file_url) {
              song.file_url = `http://localhost:3000${song.file_url.replace(
                '/audio',
                '/media/audio'
              )}`;
            }
          }
          return song;
        })
        .filter(Boolean);

      setLikedSongs(songsOnly);
      setLoading(false);
    };

    loadLikedSongs();
  }, []);

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
      {/* Header Playlist */}
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

      {/* === Header cột === */}
      <div className="song-list-header">
        <div className="song-col-header">Bài hát</div>
        <div className="artist-col-header">Nghệ sĩ</div>
        <div className="album-col-header">Album</div>
      </div>

      {/* === Danh sách bài hát === */}
      <div className="song-list-detail">
        {likedSongs.length > 0 ? (
          likedSongs.map((song, index) => (
            <div
              key={song.id}
              className="song-row"
              onClick={() => playTrack(song, likedSongs, index)}
            >
              {/* Cột 1: Bài hát */}
              <div className="song-title-col">
                <span className="song-index">{index + 1}.</span>
                <img
                  src={
                    song.image_url ||
                    song.album?.cover_url ||
                    '/images/default-album.png'
                  }
                  alt={song.title}
                />
                <p className="song-row-title">{song.title}</p>
              </div>

              {/* Cột 2: Nghệ sĩ */}
              <div className="song-artist-col">
                <p>{song.artist?.stage_name}</p>
              </div>

              {/* Cột 3: Album */}
              <div className="song-album-col">
                <p>{song.album?.title}</p>
              </div>

              {/* Icon tim */}
              <FaHeart className="song-row-liked" />
            </div>
          ))
        ) : (
          <p className="subtle-text">Bạn chưa thích bài hát nào.</p>
        )}
      </div>
    </div>
  );
};

export default LikedSongsPage;
