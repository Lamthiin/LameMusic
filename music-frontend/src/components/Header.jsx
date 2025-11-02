// music-frontend/src/components/Header.jsx (BẢN NÂNG CẤP DROPDOWN)
import React, { useState } from 'react'; // <-- (1) Import useState
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Cần để lấy role
import { FaSearch } from 'react-icons/fa';
import { FaUserCircle } from "react-icons/fa"; // Icon user
import './Header.css'; 

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth(); // (2) Lấy 'user' (chứa role)
  const navigate = useNavigate();
  
  // (3) State để quản lý việc mở/đóng dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Hàm xử lý khi click "Đăng ký nghệ sĩ"
  const handleRegisterArtist = () => {
    // (Sau này bạn sẽ thay bằng navigate('/register-artist'))
    alert('Tính năng Đăng ký Nghệ sĩ sắp ra mắt!');
  };

  // Hàm xử lý khi click "Thông tin cá nhân"
  const handleProfile = () => {
    navigate('/profile'); // (Tạo trang này sau)
    setDropdownOpen(false); // Đóng dropdown
  };

  // Hàm xử lý "Đăng xuất"
  const handleLogout = () => {
    logout();
    setDropdownOpen(false); // Đóng dropdown
  };

  return (
    <header className="header-container">
      {/* 1. Bên trái: Logo */}
      <div className="header-left">
        <h1 className="header-logo" onClick={() => navigate('/')}>
          lame 🎵
        </h1>
      </div>

      {/* 2. Ở giữa: Thanh tìm kiếm */}
      <div className="header-center">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Tìm kiếm bài hát, nghệ sĩ, album..." />
        </div>
      </div>

      {/* 3. Bên phải: User Icon / Nút Auth (ĐÃ CẬP NHẬT) */}
      <div className="header-right">
        {isAuthenticated ? (
          // (Khi đã đăng nhập)
          <div className="user-profile-area">
            
            {/* YÊU CẦU 1: Nút "Đăng ký nghệ sĩ" */}
            {user && user.role === 'listener' && (
              <button 
                onClick={handleRegisterArtist} 
                className="header-button register-artist"
              >
                Đăng ký nghệ sĩ
              </button>
            )}

            {/* YÊU CẦU 2: User Icon Dropdown */}
            <FaUserCircle 
              size={32} // Cho icon to hơn 1 chút
              onClick={() => setDropdownOpen(!dropdownOpen)} // Bật/tắt dropdown
              className="user-avatar" 
            />

            {/* Menu Dropdown (Chỉ hiện khi dropdownOpen = true) */}
            {dropdownOpen && (
              <div className="user-dropdown">
                <ul>
                  <li onClick={handleProfile}>Thông tin cá nhân</li>
                  <li onClick={handleLogout}>Đăng xuất</li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          // (Khi chưa đăng nhập)
          <div className="auth-buttons">
            <button 
              onClick={() => navigate('/register')} 
              className="header-button register"
            >
              Đăng ký
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="header-button login"
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;