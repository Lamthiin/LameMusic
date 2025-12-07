// music-frontend/src/pages/GenreDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSongsByGenre } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import './GenreDetailPage.css';
import { FaPlay } from 'react-icons/fa';

// Import SongListTable
import SongListTable from '../../components/user/SongListTable';

// === DÙNG CHÍNH XÁC HÀM fixUrl CỦA BẠN ===
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

const GenreDetailPage = () => {
  const { genreName } = useParams();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      try {
        const data = await fetchSongsByGenre(genreName);

        // Dùng fixUrl thay vì xử lý thủ công
        const songsWithUrls = data.map((song) => ({
          ...song,
          image_url: fixUrl(song.image_url || song.album?.cover_url, 'image'),
          file_url: fixUrl(song.file_url, 'audio'), // Chuẩn, sạch, không lỗi
          album: song.album
            ? {
                ...song.album,
                cover_url: fixUrl(song.album.cover_url, 'image'),
              }
            : null,
        }));

        setSongs(songsWithUrls);
      } catch (err) {
        console.error("Lỗi tải bài hát theo thể loại:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
  }, [genreName]);

  const playAll = () => {
    if (songs.length > 0) {
      playTrack(songs[0], songs, 0);
    }
  };

  if (loading) {
    return <div className="loading-message">Đang tải thể loại: {genreName}...</div>;
  }

  return (
<div className="genre-page">

  {/* HEADER */}
  <div
    className="genre-header"
    style={{
      background: 'linear-gradient(210deg, #444444ff 0%, var(--color-background) 100%)',
    }}
  >
    <div className="genre-header-info">
      <p className="genre-label">THỂ LOẠI</p>
      <h1 className="genre-title">{genreName}</h1>
      <p className="genre-count">{songs.length} bài hát</p>
      <button className="genre-play-btn" onClick={playAll}>
        <FaPlay size={20} /> PHÁT TẤT CẢ
      </button>
    </div>
  </div>

  {/* SONG LIST */}
  <div className="genre-songlist">
    {songs.length > 0 ? (
      <SongListTable songs={songs} />
    ) : (
      <p className="genre-empty">Không tìm thấy bài hát nào thuộc thể loại này.</p>
    )}
  </div>
</div>

  );
};

export default GenreDetailPage;