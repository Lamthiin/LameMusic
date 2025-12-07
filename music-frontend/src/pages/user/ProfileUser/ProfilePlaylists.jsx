// music-frontend/src/pages/Profile/ProfilePlaylists.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { fetchMyPlaylists, deleteMyPlaylistApi } from '../../../utils/api';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { FaLock, FaGlobe, FaTrash, FaPlus } from 'react-icons/fa';
import CreatePlaylistModal from '../../../components/user/CreatePlaylistModal';

const showToast = (message) => alert(message);

const fixUrl = (url) => {
  if (!url) return '/images/default-album.png';
  if (url.startsWith('http')) return url;
  return `http://localhost:3000${url.replace('/images', '/media/images')}`;
};

const ProfilePlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchMyPlaylists();
      setPlaylists(response || []);
    } catch (error) {
      console.error('Lỗi tải playlist:', error);
      showToast('Không thể tải playlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handleCreatePlaylist = () => setIsCreateModalOpen(true);

  const handlePlaylistCreated = () => {
    setIsCreateModalOpen(false);
    loadPlaylists();
  };

  const handleDelete = async (e, playlistId, playlistName) => {
    e.stopPropagation();
    if (!window.confirm(`Xóa playlist "${playlistName}"?`)) return;
    try {
      await deleteMyPlaylistApi(playlistId);
      showToast(`Đã xóa "${playlistName}"`);
      loadPlaylists();
    } catch (error) {
      showToast(error.response?.data?.message || 'Xóa thất bại');
    }
  };

  if (loading) return <div className="pp-loading">Đang tải playlist của bạn...</div>;

  return (
    <div className="pp-container">
      {/* HEADER */}
      <div className="pp-header">
        <h2>Playlists của bạn ({playlists.length})</h2>
        <button className="pp-btn-create" onClick={handleCreatePlaylist}>
          <FaPlus /> Tạo Playlist Mới
        </button>
      </div>

      {/* GRID */}
      <div className="pp-grid">
        {playlists.length > 0 ? (
          playlists.map((pl) => (
            <div
              key={pl.id}
              className="pp-card"
              onClick={() => navigate(`/playlist/${pl.id}`)}
            >
              {/* Icon riêng tư / công khai */}
              <span className="pp-privacy-icon">
                {pl.is_private ? (
                  <FaLock size={14} title="Riêng tư" />
                ) : (
                  <FaGlobe size={14} title="Công khai" />
                )}
              </span>

              {/* Ảnh bìa hoặc placeholder */}
              {pl.cover_url ? (
                <img
                  src={fixUrl(pl.cover_url)}
                  alt={pl.name}
                  className="pp-card-cover"
                  onError={(e) => (e.target.src = '/images/default-album.png')}
                />
              ) : (
                <div className="pp-card-placeholder">
                  <span><p className="pp-title">{pl.name}</p></span>
                </div>
              )}

              {/* Thông tin */}
              <div className="pp-card-info">
                <p className="pp-title">{pl.name}</p>
                <p className="pp-song-count">
                  {/* {(pl.song_count ?? pl.songs?.length ?? 0)} bài hát */}
                </p>
              </div>

              {/* Hover overlay */}
              <div className="pp-card-overlay">
                <span>Xem playlist</span>
              </div>

              {/* Nút xóa */}
              <button
                className="pp-btn-delete"
                onClick={(e) => handleDelete(e, pl.id, pl.name)}
                title="Xóa playlist"
              >
                <FaTrash size={16} />
              </button>
            </div>
          ))
        ) : (
          <p className="pp-subtle">Bạn chưa tạo playlist nào.</p>
        )}
      </div>

      {/* Modal tạo playlist */}
      {isCreateModalOpen && (
        <CreatePlaylistModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPlaylistCreated={handlePlaylistCreated}
        />
      )}
    </div>
  );
};

export default ProfilePlaylists;