// music-frontend/src/components/Header.jsx (Sửa FINAL)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaUserCircle, FaBell, FaCheckCircle } from 'react-icons/fa'; // <-- IMPORT ICON CHUÔNG
import { fetchNotificationsApi, markNotificationAsReadApi } from '../../utils/api'; // <-- IMPORT API THÔNG BÁO
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // States hiện tại (ví dụ)
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // === STATE MỚI CHO THÔNG BÁO ===
  const [notifications, setNotifications] = useState([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  
  // Ref để đóng dropdown khi click bên ngoài
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const searchContainerRef = useRef(null); // Giả định có search container
  
  // ================================

  // Logic tải thông báo
  const loadNotifications = useCallback(async () => {
    if (isAuthenticated) {
        try {
            // Lấy 10 thông báo mới nhất
            const data = await fetchNotificationsApi(10);
            setNotifications(data);
        } catch (error) {
            console.error("Không thể tải thông báo:", error);
            setNotifications([]);
        }
    } else {
        setNotifications([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // Tải lại sau mỗi 60 giây
    return () => clearInterval(interval);
  }, [isAuthenticated, loadNotifications]);


  // Logic đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
        // Đóng User Menu
        if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
        // Đóng Notification Dropdown
        if (notifRef.current && !notifRef.current.contains(event.target)) {
            setIsNotifDropdownOpen(false);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Xử lý khi nhấn vào thông báo
  const handleNotificationClick = async (notif) => {
      // 1. Đánh dấu đã đọc
      if (!notif.is_read) {
          try {
              await markNotificationAsReadApi(notif.id);
              loadNotifications(); // Tải lại để cập nhật trạng thái
          } catch (error) {
              console.error("Lỗi khi đánh dấu đã đọc:", error);
          }
      }
      
      // 2. Chuyển hướng theo reference_id (Tùy chọn)
      if (notif.type === 'SONG_APPROVED' && notif.reference_id) {
          navigate(`/song/${notif.reference_id}`);
      } else if (notif.type === 'ARTIST_PROFILE_APPROVED' && notif.reference_id) {
          navigate(`/artist/dashboard`);
      }
      
      setIsNotifDropdownOpen(false); // Đóng dropdown
  };
  
  // Đếm thông báo chưa đọc
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="hdr-container">
      {/* CỘT 1: LOGO */}
      <div className="hdr-left">
        <h1 className="hdr-logo" onClick={() => navigate('/')}>
          🎧 MusicApp
        </h1>
      </div>

      {/* CỘT 2: SEARCH */}
      <div className="hdr-center" ref={searchContainerRef}>
        <form className="hdr-search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="hdr-search-btn">
            <FaSearch />
          </button>
        </form>
      </div>
      
      {/* CỘT 3: BÊN PHẢI (AUTH & NOTIF) */}
      <div className="hdr-right">
        {isAuthenticated ? (
          <>
            {/* === CHUÔNG THÔNG BÁO === */}
            <div className="notif-bell-container" ref={notifRef}>
                <button 
                    className="notif-btn-icon" 
                    onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                    title="Thông báo"
                >
                    <FaBell size={20} />
                    {/* Badge hiển thị số lượng chưa đọc */}
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
                
                {/* DROPDOWN HIỂN THỊ */}
                {isNotifDropdownOpen && (
                    <div className="notif-dropdown">
                        <h3>Thông báo mới</h3>
                        {notifications.length === 0 ? (
                            <div className="notif-item subtle-text">Không có thông báo mới.</div>
                        ) : (
                            notifications.map(notif => (
                                <div 
                                    key={notif.id} 
                                    className={`notif-item ${notif.is_read ? 'read' : 'unread'}`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <p className="notif-message">{notif.message}</p>
                                    <span className="notif-date">{new Date(notif.created_at).toLocaleTimeString()}</span>
                                </div>
                            ))
                        )}
                        <div className="notif-footer" onClick={() => {
                            navigate('/notifications'); // Chuyển đến trang tất cả thông báo
                            setIsNotifDropdownOpen(false);
                        }}>
                            Xem tất cả thông báo
                        </div>
                    </div>
                )}
            </div>
            {/* ======================= */}

            {/* === ARTIST BADGE HOẶC NÚT ĐĂNG KÝ === */}
            {user?.role === 'artist' ? (
              <div 
                className="hdr-artist-badge" 
                onClick={() => navigate('/artist-dashboard/info')}
                title="Quản lý kênh nghệ sĩ"
              >
                <FaCheckCircle size={15} />
                Nghệ sĩ
              </div>
            ) : (user?.role === 'listener' && (
              <button className="hdr-btn-become-artist" onClick={() => navigate('/artist-registration')}>
                Trở thành Nghệ sĩ
              </button>
            ))}
            {/* ===================================== */}

            {/* User Menu */}
            <div className="hdr-user-menu" ref={userMenuRef}>
              <button className="hdr-user-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <FaUserCircle size={24} />
                <span className="hdr-username">{user.username}</span>
              </button>
              {isMenuOpen && (
                <div className="hdr-user-dropdown">
                  <div className="hdr-menu-item" onClick={() => { navigate('/profile/info'); setIsMenuOpen(false); }}>Tài khoản cá nhân</div>
                  {user?.role === 'artist' && (
                    <div className="hdr-menu-item" onClick={() => { navigate('/artist-dashboard/info'); setIsMenuOpen(false); }}>Quản lý Kênh</div>
                  )}
                  <div className="hdr-menu-item hdr-logout" onClick={logout}>Đăng xuất</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="hdr-auth-buttons">
            <button className="hdr-btn-secondary" onClick={() => navigate('/login')}>
              Đăng nhập
            </button>
            <button className="hdr-btn-primary" onClick={() => navigate('/register')}>
              Đăng ký
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;