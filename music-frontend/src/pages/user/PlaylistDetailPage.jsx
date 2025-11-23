// music-frontend/src/pages/PlaylistDetailPage.jsx (BẢN SỬA LỖI FINAL)
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// IMPORT API MỚI
import { getPublicPlaylistApi, removeSongFromPlaylistApi } from '../../utils/api'; 
import { usePlayer } from '../../context/PlayerContext';
import SongListTable from '../../components/user/SongListTable';
import { useAuth } from '../../context/AuthContext'; // Cần để kiểm tra quyền
import './LikedSongsPage.css'; 
import './AlbumDetailPage.css'; // Dùng chung CSS grid/header
import { FaPlay } from 'react-icons/fa';

// (Hàm helper fix URL)
const fixUrl = (url, type = 'image') => { /* ... */ return `http://localhost:3000${url.replace('/images', '/media/images')}`; };
const showToast = (message) => { alert(message); };


const PlaylistDetailPage = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();
  const { user } = useAuth(); // Lấy user

  // Hàm tải lại dữ liệu (Dùng useCallback)
  const loadPlaylist = useCallback(async () => {
    setLoading(true);
    let data;
    try {
        // API này đã được sửa để quyết định Public/Private ở Controller
        data = await getPublicPlaylistApi(id); 

        // Fix URL ảnh/audio (Giữ nguyên logic mapping của bạn)
        data.songs.forEach(song => {
            if (song.album) song.album.cover_url = fixUrl(song.album.cover_url, 'album');
            song.cover_url = song.image_url ? fixUrl(song.image_url, 'song') : song.album?.cover_url;
            song.file_url = fixUrl(song.file_url, 'audio');
        });
        
        setPlaylist(data);
        setSongs(data.songs);
    } catch (error) {
        showToast('Không tìm thấy Playlist hoặc không có quyền truy cập.', 'error');
        setPlaylist(null);
    } finally {
        setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);


  // === HÀM MỚI: XỬ LÝ XÓA BÀI HÁT KHỎI PLAYLIST ===
  const handleRemoveSong = async (songId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài hát này khỏi Playlist?')) return;
    
    try {
        await removeSongFromPlaylistApi(playlist.id, songId);
        showToast('Bài hát đã được xóa khỏi Playlist.', 'success');
        loadPlaylist(); // Tải lại dữ liệu
    } catch (error) {
        showToast(error.response?.data?.message || 'Xóa thất bại.', 'error');
    }
  };
  // ===============================================

  const playAll = () => {
    if (songs.length > 0) {
      playTrack(songs[0], songs, 0);
    }
  };

  // Quyền: Chỉ chủ sở hữu mới có quyền xóa
  const isOwner = user && playlist?.user?.id === user.userId;

  if (loading) return <div className="loading-message">Đang tải playlist...</div>;
  if (!playlist) return <div className="error-message">Playlist không tồn tại hoặc đã bị xóa.</div>;

  return (
    <div className="liked-songs-container">
      {/* Header Playlist */}
      <div className="playlist-header">
        {/* ... (Ảnh và thông tin giữ nguyên) ... */}
        <div className="playlist-info">
          <p className="playlist-type">PLAYLIST {playlist.is_private ? '(RIÊNG TƯ)' : '(CÔNG KHAI)'}</p>
          <h1>{playlist.name}</h1>
          <p className="playlist-owner">
            Tạo bởi {playlist.user?.username} • {songs.length} bài hát
          </p>
          <button className="playlist-play-button" onClick={playAll}>
            <FaPlay size={20} /> PHÁT TẤT CẢ
          </button>
        </div>
      </div>

      {/* Song list - tái sử dụng SongListTable */}
      <SongListTable 
        songs={songs} 
        // === TRUYỀN HÀM XÓA VÀ CHECK QUYỀN SỞ HỮU ===
        onRemoveSong={isOwner ? handleRemoveSong : null} 
        // ==============================================
      />
    </div>
  );
};

export default PlaylistDetailPage;