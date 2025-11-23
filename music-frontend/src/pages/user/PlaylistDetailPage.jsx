// music-frontend/src/pages/PlaylistDetailPage.jsx (TẠO MỚI)
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPlaylistApi } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import './LikedSongsPage.css'; // Dùng chung CSS
import { FaPlay } from 'react-icons/fa';

// (Hàm helper fix URL)
const fixUrl = (url, type = 'image') => { 
    if (!url) return '/images/default-album.png';
    if (url.startsWith('http')) return url;
    const correctedUrl = url.replace('/images', '/media/images');
    return `http://localhost:3000${correctedUrl}`;
 };

const PlaylistDetailPage = () => {
  const { id } = useParams(); // Lấy 'id' (Playlist ID)
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    const loadPlaylist = async () => {
      setLoading(true);
      const data = await getPublicPlaylistApi(id); // API MỚI
      
      // Sửa URL cho Player (BẮT BUỘC)
      const songsWithUrls = data.songs.map(song => {
        if (song.album) song.album.cover_url = fixUrl(song.album.cover_url, 'album');
        return {
            ...song,
            image_url: song.image_url ? fixUrl(song.image_url, 'song') : null, 
            file_url: fixUrl(song.file_url, 'audio')
        };
      });
      
      setPlaylist(data);
      setSongs(songsWithUrls);
      setLoading(false);
    };
    loadPlaylist();
  }, [id]); 

  const playAll = () => {
    if (songs.length > 0) {
      playTrack(songs[0], songs, 0); 
    }
  };

  if (loading) return <div className="loading-message">Đang tải playlist...</div>;

  return (
    <div className="liked-songs-container">
      <div className="playlist-header">
        <img src="/images/default-playlist-cover.jpg" alt={playlist.name} />
        <div className="playlist-info">
          <p className="playlist-type">PLAYLIST CÔNG KHAI</p>
          <h1>{playlist.name}</h1>
          <p className="playlist-owner">
              Tạo bởi {playlist.user?.username} • {songs.length} bài hát
          </p>
          <button className="playlist-play-button" onClick={playAll}>
            <FaPlay size={20} /> PHÁT TẤT CẢ
          </button>
        </div>
      </div>

      {/* Danh sách bài hát */}
      <div className="song-list-detail">
        {songs.length > 0 ? (
          songs.map((song, index) => (
            <div key={song.id} className="song-row" onClick={() => playTrack(song, songs, index)}>
              {/* ... (Hiển thị 1 hàng bài hát) ... */}
            </div>
          ))
        ) : (
          <p className="subtle-text">Playlist này không có bài hát nào.</p>
         )}
      </div>
    </div>
  );
};

export default PlaylistDetailPage;