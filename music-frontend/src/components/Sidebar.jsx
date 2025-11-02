// music-frontend/src/components/Sidebar.jsx (BẢN SỬA LỖI - HIỂN THỊ HẾT)
import React from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Vẫn cần để check login

// Import icons
import { MdOutlineExplore, MdExplore } from 'react-icons/md'; // Khám phá
import { FaUser } from 'react-icons/fa'; // Dành cho tôi
import { FaBlog } from 'react-icons/fa'; // Trang blog
import { VscLibrary } from 'react-icons/vsc'; // Thư viện
import { GoHeartFill, GoPlus } from 'react-icons/go'; // Yêu, Plus

const Sidebar = () => {
  const { isAuthenticated } = useAuth(); // Lấy trạng thái đăng nhập
  const navigate = useNavigate();
  
  const activePage = 'discover'; // (Tạm thời)

  // === HÀM XỬ LÝ CLICK MỚI ===
  // Hàm này sẽ kiểm tra đăng nhập TRƯỚC KHI chuyển trang
  const handleProtectedClick = (path) => {
    if (isAuthenticated) {
      // 1. Nếu đã đăng nhập -> đi đến trang
      navigate(path);
    } else {
      // 2. Nếu chưa đăng nhập -> chuyển đến trang login
      navigate('/login');
      // (Bạn có thể thêm alert ở đây nếu muốn)
      // alert('Vui lòng đăng nhập để sử dụng tính năng này!');
    }
  };

  return (
    <div className="sidebar-container">
      
      {/* ===== KHU VỰC TRÊN: Điều hướng chính ===== */}
      <div className="sidebar-section sidebar-nav">
        <ul>
          {/* 1. Khám phá (Công khai) */}
          <li 
            className={activePage === 'discover' ? 'active' : ''} 
            onClick={() => navigate('/')}
          >
            {activePage === 'discover' ? <MdExplore size={28} /> : <MdOutlineExplore size={28} />}
            <span>Khám phá</span> 
          </li>
          
          {/* 2. Dành cho tôi (Bảo vệ khi click) */}
          {/* Gỡ bỏ {isAuthenticated && ...} */}
          <li 
            className={activePage === 'foryou' ? 'active' : ''}
            onClick={() => handleProtectedClick('/for-you')} // <-- SỬ DỤNG HÀM MỚI
          >
            <FaUser size={28} />
            <span>Dành cho tôi</span>
          </li>

          {/* 3. Trang blog (Công khai) */}
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
      {/* Gỡ bỏ {isAuthenticated && ...} */}
      <div className="sidebar-section sidebar-library">
          
        {/* 4. Tiêu đề "Thư viện" (Bảo vệ khi click) */}
        <div 
          className="library-heading" 
          onClick={() => handleProtectedClick('/library')} // <-- SỬ DỤNG HÀM MỚI
        >
          <VscLibrary size={28} />
          <span>Thư viện</span>
        </div>

        {/* Các mục con của Thư viện */}
        <ul className="sidebar-library-items">
          {/* 4a. Bài hát yêu (Bảo vệ khi click) */}
          <li 
            className={activePage === 'liked' ? 'active' : ''}
            onClick={() => handleProtectedClick('/liked-songs')} // <-- SỬ DỤNG HÀM MỚI
          >
            <div className="icon-box" style={{ background: 'linear-gradient(135deg, #450AF5, #C4EFD9)' }}>
              <GoHeartFill size={16} />
            </div>
            <span>Bài hát yêu thích</span>
          </li>

          {/* 4b. Tạo playlist (Bảo vệ khi click) */}
          <li onClick={() => handleProtectedClick('/create-playlist')}> {/* <-- SỬ DỤNG HÀM MỚI */}
            <div className="icon-box" style={{ background: '#7F7F7F' }}>
              <GoPlus size={16} />
            </div>
            <span>Tạo playlist</span>
          </li>
        </ul>
      </div>

    </div>
  );
};

export default Sidebar;