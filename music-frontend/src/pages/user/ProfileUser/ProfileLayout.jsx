// music-frontend/src/pages/Profile/ProfileLayout.jsx (TẠO MỚI)
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Profile.css';
import { useAuth } from '../../context/AuthContext';

const ProfileLayout = () => {
  const { user } = useAuth();

  return (
    <div className="profile-layout-container">
      
      {/* 1. HEADER ĐẸP (Không Avatar) */}
      <div className="profile-header no-avatar">
        <div className="profile-header-overlay">
          <div className="profile-header-info">
            <p className="profile-header-sub">HỒ SƠ NGƯỜI DÙNG</p>
            <h1 className="profile-header-name">{user?.username || 'Người dùng'}</h1>
          </div>
        </div>
      </div>

      {/* 2. THANH TABS NGANG */}
      <nav className="profile-tabs">
        <ul>
          <li>
            <NavLink to="/profile/info" end>
              Thông tin Chung
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile/likes">
              Bài hát Yêu thích
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile/playlists">
              Playlist Của bạn
            </NavLink>
          </li>
          {/* === (2) TAB MỚI === */}
          <li>
            <NavLink to="/profile/following">
              Đang theo dõi
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* 3. NỘI DUNG (Render trang con) */}
      <div className="profile-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;