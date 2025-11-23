// music-frontend/src/pages/Profile/PublicProfilePlaylists.jsx
import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FaLock, FaGlobe } from 'react-icons/fa';
import './Profile.css';

const PublicProfilePlaylists = () => {
  const { profile } = useOutletContext();
  const navigate = useNavigate();

  const playlists = profile?.playlists || [];

  // Hàm fix URL ảnh (dùng chung)
  const fixUrl = (url) => {
    if (!url) return '/images/default-album.png';
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url.replace('/images', '/media/images')}`;
  };

  if (!profile) {
    return <div className="pp-loading">Đang tải thông tin...</div>;
  }

  return (
    <div className="pp-container">
      {/* HEADER GIỐNG HỆT TRANG CỦA BẠN */}
      <div className="pp-header">
        <h2>Playlists công khai ({playlists.length})</h2>
        {/* Không có nút tạo vì là trang người khác */}
      </div>

      {/* GRID GIỐNG HỆT TRANG CỦA BẠN */}
      <div className="pp-grid">
        {playlists.length > 0 ? (
          playlists.map((pl) => (
            <div
              key={pl.id}
              className="pp-card"
              onClick={() => navigate(`/playlist/${pl.id}`)}
            >
              {/* Icon riêng tư/công khai */}
              <span className="pp-privacy-icon">
                {pl.is_private ? (
                  <FaLock size={14} title="Riêng tư" />
                ) : (
                  <FaGlobe size={14} title="Công khai" />
                )}
              </span>

              {/* Ảnh bìa playlist (nếu có) */}
              {pl.cover_url ? (
                <img
                  src={fixUrl(pl.cover_url)}
                  alt={pl.name}
                  className="pp-card-cover"
                  onError={(e) => (e.target.src = '/images/default-album.png')}
                />
              ) : (
                <div className="pp-card-placeholder">
                  <span>Playlist</span>
                </div>
              )}

              {/* Thông tin */}
              <div className="pp-card-info">
                <p className="pp-title">{pl.name}</p>
                <p className="pp-song-count">
                  {pl.songs?.length || 0} bài hát
                </p>
              </div>

              {/* Hover overlay (tùy chọn) */}
              <div className="pp-card-overlay">
                <span>Xem playlist</span>
              </div>
            </div>
          ))
        ) : (
          <p className="pp-subtle">
            Người dùng này chưa có playlist công khai nào.
          </p>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePlaylists;