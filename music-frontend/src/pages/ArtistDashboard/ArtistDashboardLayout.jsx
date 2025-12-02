// music-frontend/src/pages/ArtistDashboard/ArtistDashboardLayout.jsx (TẠO MỚI)
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../user/ProfileUser/Profile.css'; // Dùng chung CSS Profile (Tabs)
import './ArtistDashboard.css'; // CSS riêng
import { useAuth } from '../../context/AuthContext';
import { FaUserEdit, FaMusic, FaCompactDisc, FaHeart, FaUsers } from 'react-icons/fa';

const fixUrl = (url, type = 'image') => {
    if (!url) { // Xử lý NULL
        if (type === 'artist') return '/images/default-artist.png';
        if (type === 'audio') return ''; // Trả về rỗng nếu không có file nhạc
        return '/images/default-album.png'; // Mặc định cho album/song
    }
    if (url.startsWith('http')) { // Nếu đã là URL tuyệt đối
        return url;
    }
    // Mặc định (ví dụ: /images/artist-1.jpg)
    const prefix = type === 'image' ? '/media/images' : '/media/audio';
    const originalPath = type === 'image' ? '/images' : '/audio';
    
    // Đảm bảo không thay thế 2 lần
    if (url.startsWith(prefix)) {
        return `http://localhost:3000${url}`;
    }
    
    return `http://localhost:3000${url.replace(originalPath, prefix)}`;
};

const ArtistDashboardLayout = () => {
  const { user } = useAuth(); 

  // (Chúng ta sẽ tải profile Artist ở đây thay vì ở trang con)
  // (Tạm thời dùng 'user' cho Header)
  const avatarUrl = user?.avatar_url ? fixUrl(user.avatar_url, 'artist') : '/images/default-artist.png';

  return (
    <div className="profile-layout-container">
      
      {/* 1. HEADER (Lấy từ User) */}
      <div className="profile-header artist-dashboard-header"> {/* Thêm class mới */}
        <div className="profile-header-overlay">
            {/* <img src={avatarUrl} alt={user?.username} className="profile-avatar" /> */}
            <div className="profile-header-info">
                <p className="profile-header-sub">TRANG QUẢN LÝ NGHỆ SĨ</p>
                <h1 className="profile-header-name">{user?.username}</h1>
            </div>
        </div>
      </div>

      {/* 2. THANH TABS NGANG (KHÁC VỚI PROFILE) */}
      <nav className="profile-tabs">
        <ul>
          <li>
            <NavLink to="/artist-dashboard/info" end> <FaUserEdit /> Thông tin chung </NavLink>
          </li>
          <li>
            <NavLink to="/artist-dashboard/songs"> <FaMusic /> Bài hát của tôi </NavLink>
          </li>
          <li>
            <NavLink to="/artist-dashboard/albums"> <FaCompactDisc /> Album của tôi </NavLink>
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

export default ArtistDashboardLayout;