// music-frontend/src/pages/GenreDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSongsByGenre } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import './GenreDetailPage.css';
import { FaPlay } from 'react-icons/fa';

// ✅ Import SongListTable
import SongListTable from '../../components/user/SongListTable';

// === HÀM FIX ẢNH ===
const fixImageUrl = (url) => {
  if (!url) return '/images/default-album.png';
  if (url.startsWith('http')) return url;
  const correctedUrl = url.replace('/images', '/media/images');
  return `http://localhost:3000${correctedUrl}`;
};

const GenreDetailPage = () => {
  const { genreName } = useParams();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      const data = await fetchSongsByGenre(genreName);

      const songsWithUrls = data.map((song) => ({
        ...song,
        album: song.album
          ? { ...song.album, cover_url: fixImageUrl(song.album.cover_url) }
          : null,
        image_url: song.image_url
          ? fixImageUrl(song.image_url)
          : fixImageUrl(song.album?.cover_url),
        file_url: song.file_url
          ? `http://localhost:3000${song.file_url.replace('/audio', '/media/audio')}`
          : null,
      }));

      setSongs(songsWithUrls);
      setLoading(false);
    };

    loadSongs();
  }, [genreName]);

  const playAll = () => {
    if (songs.length > 0) playTrack(songs[0], songs, 0);
  };

  if (loading) {
    return <div className="loading-message">Đang tải thể loại: {genreName}...</div>;
  }

  return (
    <div className="liked-songs-container">
      {/* Header */}
      <div
        className="playlist-header"
        style={{
          background: 'linear-gradient(210deg, #444444ff 0%, var(--color-background) 100%)',
        }}
      >
        <div className="playlist-info">
          <p className="playlist-type">THỂ LOẠI</p>
          <h1>{genreName}</h1>
          <p className="playlist-owner">{songs.length} bài hát</p>
          <button className="playlist-play-button" onClick={playAll}>
            <FaPlay size={20} /> PHÁT TẤT CẢ
          </button>
        </div>
      </div>

      {/* Song List */}
      <div className="song-list-detail">
        {songs.length > 0 ? (
          // ✅ Tái sử dụng SongListTable, slice nếu muốn giới hạn số bài
          <SongListTable songs={songs} />
        ) : (
          <p className="subtle-text">Không tìm thấy bài hát nào thuộc thể loại này.</p>
        )}
      </div>
    </div>
  );
};

export default GenreDetailPage;
