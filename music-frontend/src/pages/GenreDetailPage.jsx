// music-frontend/src/pages/GenreDetailPage.jsx (FINAL VERSION)
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSongsByGenre } from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
import './GenreDetailPage.css'; // Dùng chung CSS
import { FaPlay } from 'react-icons/fa';

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
          background: 'linear-gradient(210deg, #007525ff 0%, var(--color-background) 100%)',
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

      {/* Danh sách bài hát */}
      <div className="song-list-detail">
        {/* === DÒNG TIÊU ĐỀ CỘT === */}
        <div className="song-list-header">
          <span className="col-song">BÀI HÁT</span>
          <span className="col-artist">NGHỆ SĨ</span>
          <span className="col-album">ALBUM</span>
        </div>

        {/* === NỘI DUNG === */}
        {songs.length > 0 ? (
          songs.map((song, index) => (
            <div
              key={song.id}
              className="song-row"
              onClick={() => playTrack(song, songs, index)}
            >
              <div className="col-song">
                <span className="song-index">{index + 1}.</span>
                <img
                  src={song.image_url || song.album?.cover_url || '/images/default-album.png'}
                  alt={song.title}
                />
                <p className="song-row-title">{song.title}</p>
              </div>

              <div className="col-artist">
                <p className="song-row-artist">{song.artist?.stage_name || 'Không rõ'}</p>
              </div>

              <div className="col-album">
                <p className="song-row-album">{song.album?.title || 'Không có'}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="subtle-text">Không tìm thấy bài hát nào thuộc thể loại này.</p>
        )}
      </div>
    </div>
  );
};

export default GenreDetailPage;
