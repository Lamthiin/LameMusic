// music-frontend/src/components/Sidebar.jsx (BẢN FINAL FULL CODE)
import React, { useState } from 'react'; // <-- (1) THÊM useState
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Vẫn cần để check login

// Import icons
import { MdOutlineExplore, MdExplore } from 'react-icons/md'; // Khám phá
import { FaUser, FaBlog } from 'react-icons/fa'; // Dành cho tôi, Trang blog
import { VscLibrary } from 'react-icons/vsc'; // Thư viện
import { GoHeartFill, GoPlus } from 'react-icons/go'; // Yêu, Plus

import CreatePlaylistModal from './CreatePlaylistModal'; // <-- (2) IMPORT MODAL MỚI

const Sidebar = () => {
  const { isAuthenticated } = useAuth(); // Lấy trạng thái đăng nhập
  const navigate = useNavigate();
  
  const activePage = 'discover'; // (Tạm thời)
    
  // === (3) STATE QUẢN LÝ MODAL ===
  const [isModalOpen, setIsModalOpen] = useState(false); 

  // === HÀM XỬ LÝ CLICK (GUARD) ===
  const handleProtectedClick = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };
    
  // === HÀM MỞ MODAL & CHECK AUTH ===
  const handleCreatePlaylistClick = () => {
    if (isAuthenticated) {
        setIsModalOpen(true); // Mở modal nếu đã đăng nhập
    } else {
        navigate('/login'); // Đá về Login nếu chưa
    }
  };

  // Hàm callback sau khi Playlist được tạo
  const handlePlaylistCreated = (newPlaylist) => {
      // alert(`Playlist "${newPlaylist.name}" đã được tạo thành công!`);
      // TODO: Sau này bạn có thể cập nhật state playlist ở đây
  };


  return (
    <div className="sidebar-container">
  <div className="sidebar-top-spacer"></div>
      
      {/* ===== KHU VỰC TRÊN: Điều hướng chính ===== */}
      <div className="sidebar-section sidebar-nav">
        <ul>
          {/* 1. Khám phá */}
          <li 
            className={activePage === 'discover' ? 'active' : ''} 
            onClick={() => navigate('/')}
          >
            {activePage === 'discover' ? <MdExplore size={28} /> : <MdOutlineExplore size={28} />}
            <span>Khám phá</span> 
          </li>
          
          {/* 2. Dành cho tôi */}
          <li 
            className={activePage === 'foryou' ? 'active' : ''}
            onClick={() => handleProtectedClick('/for-you')} 
          >
            <FaUser size={28} />
            <span>Dành cho tôi</span>
          </li>

          {/* 3. Trang blog */}
          <li 
            className={activePage === 'blog' ? 'active' : ''}
            onClick={() => navigate('/blog')} 
          >
            <FaBlog size={28} />
            <span>Trang blog</span>
          </li>
        </ul>
      </div>

      {/* ===== KHU VỰC GIỮA: Thư viện (Bảo vệ khi click) ===== */}
      <div className="sidebar-section sidebar-library">
          
        {/* 4. Tiêu đề "Thư viện" */}
        <div 
          className="library-heading" 
          onClick={() => handleProtectedClick('/library')} 
        >
          <VscLibrary size={28} />
          <span>Thư viện</span>
        </div>

        {/* Các mục con của Thư viện */}
        <ul className="sidebar-library-items">
          {/* 4a. Bài hát yêu thích (Bảo vệ khi click) */}
          <li 
            className={activePage === 'liked' ? 'active' : ''}
            onClick={() => handleProtectedClick('/liked-songs')} 
          >
            <div className="icon-box" style={{ background: 'linear-gradient(135deg, #450AF5, #C4EFD9)' }}>
              <GoHeartFill size={16} />
            </div>
            <span>Bài hát yêu thích</span>
          </li>

          {/* 4b. Tạo playlist (GỌI HÀM MỞ MODAL) */}
          <li onClick={handleCreatePlaylistClick}>
            <div className="icon-box" style={{ background: '#7F7F7F' }}>
              <GoPlus size={16} />
            </div>
            <span>Tạo playlist</span>
          </li>
        </ul>
      </div>
        
    {/* Component Modal */}
    <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
    />

    </div>
  );
};

export default Sidebar;