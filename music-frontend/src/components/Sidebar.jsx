// src/components/Sidebar.jsx (BẢN SỬA LỖI FINAL - CÓ NÚT TẠO PLAYLIST)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyFollowingApi } from '../utils/api';
import './Sidebar.css';
import { MdOutlineExplore, MdExplore } from 'react-icons/md';
import { FaSearch, FaCompactDisc, FaHeart, FaUsers, FaAngleRight } from 'react-icons/fa';
import { VscLibrary } from 'react-icons/vsc';
import { GoHeartFill, GoPlus } from 'react-icons/go';
import CreatePlaylistModal from './CreatePlaylistModal';

// HÀM HELPER SNAGS PLAYER (Giữ nguyên)
const audioPreview = new Audio();
const playPreview = (url) => { /* ... */ };
const stopPreview = () => { /* ... */ };
const fixImageUrl = (url) => url?.startsWith('http') ? url : `http://localhost:3000${url}`;

const Sidebar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false); // <-- STATE TẠO PLAYLIST
  const [followingList, setFollowingList] = useState([]);
  const [isFollowMenuOpen, setIsFollowMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('');
  
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const loadFollowing = useCallback(async () => {
        if (isAuthenticated) {
            try {
                const data = await fetchMyFollowingApi(); // API trả về mảng [Follow]
                setFollowingList(data); 
            } catch (error) {
                console.error('Lỗi tải danh sách theo dõi:', error);
            }
        } else {
            setFollowingList([]);
        }
    }, [isAuthenticated]);

  // === (1) TẢI FOLLOWING VÀ LẮNG NGHE EVENT ===
  useEffect(() => {
    loadFollowing();

    const handleFollowUpdate = () => {
        loadFollowing(); // Kích hoạt hàm tải lại
    };
    
    window.addEventListener('followStatusChanged', handleFollowUpdate);

    return () => {
        window.removeEventListener('followStatusChanged', handleFollowUpdate);
    };
  }, [isAuthenticated, loadFollowing]); 
    
  // ACTIVE PAGE
  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'home';
    setActivePage(path);
  }, [location.pathname]);

  // ĐÓNG DROPDOWN KHI CLICK RA NGOÀI
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsFollowMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProtectedClick = (path) => {
    if (isAuthenticated) navigate(path);
    else navigate('/login');
  };
    
  // === (2) HÀM TẠO PLAYLIST MỚI (MỞ MODAL) ===
  const handleCreatePlaylistClick = () => {
    if (isAuthenticated) {
        setIsModalOpen(true); // <-- MỞ MODAL
    } else {
        navigate('/login');
    }
  };
    
  const handlePlaylistCreated = () => {
      setIsModalOpen(false); // Đóng Modal
      // TODO: Nếu cần tải lại danh sách playlists dưới dạng LI, gọi API tải lại ở đây
  };
    // ===========================================

  // === (1) LOGIC LỌC VÀ TRUY CẬP DỮ LIỆU ĐÃ SỬA ===
  const followedArtists = followingList // followingList là mảng [Follow]
    .filter(f => f.following) // Lọc những object Follow có quan hệ Artist hợp lệ
    .map(f => f.following); // Lấy trực tiếp Artist Entity ra khỏi Follow object

  return (
    <div className="sidebar-container">
      {/* NAV CHÍNH */}
      <div className="sidebar-section sidebar-nav">
        <ul>
          <li className={activePage === 'home' ? 'active' : ''} onClick={() => navigate('/')}>
            {activePage === 'home' ? <MdExplore size={24} /> : <MdOutlineExplore size={24} />}
            <span>Khám phá</span>
          </li>
         
          <li className={activePage === 'albums' ? 'active' : ''} onClick={() => navigate('/albums')}>
            <FaCompactDisc size={24} />
            <span>Albums</span>
          </li>
        </ul>
      </div>

      <hr className="sidebar-divider" />

      {/* THƯ VIỆN - BẤM ĐƯỢC */}
      <div className="sidebar-section sidebar-library">
        <div 
          className="library-heading clickable" 
          
        >
          <VscLibrary size={24} />
          <span>Thư viện</span>
        </div>

        <ul className="sidebar-library-items">
          
{/*           TẠO PLAYLIST
          <li onClick={handleCreatePlaylistClick} style={{ cursor: 'pointer' }}>
            <div className="icon-box" style={{ background: '#7F7F7F', borderRadius: '4px' }}>
              <GoPlus size={16} />
            </div>
            <span>Tạo playlist</span>
          </li> */}

          {/* YÊU THÍCH */}
          <li className={activePage === 'liked-songs' ? 'active' : ''} onClick={() => handleProtectedClick('/liked-songs')}>
            <div className="icon-box" style={{ background: 'linear-gradient(135deg, #ff0000ff, #C4EFD9)' }}>
              <GoHeartFill size={16} />
            </div>
            <span>Bài hát yêu thích</span>
          </li>

          {/* QUAN TÂM - DROPDOWN HIỆN ĐÚNG CHỖ */}
          {isAuthenticated && (
            <div className="sidebar-dropdown-parent">
              <li
                ref={triggerRef}
                className={`follow-header ${activePage === 'following' ? 'active' : ''}`}
                onClick={() => setIsFollowMenuOpen(!isFollowMenuOpen)}
              >
                <FaUsers size={24} />
                <span>Quan tâm</span>
                <FaAngleRight size={12} className="dropdown-arrow" />
              </li>

              {isFollowMenuOpen && (
              <div className="dropdown-content" ref={dropdownRef}>
                <div className="dropdown-items-container">
                  {followedArtists.length > 0 ? (
                    followedArtists.map((artist) => (
                      <div
                        key={artist.id}
                        className="dropdown-item"
                        onClick={() => {
                          navigate(`/artist/${artist.id}`);
                          setIsFollowMenuOpen(false);
                        }}
                        onMouseEnter={() => playPreview(artist.preview_url)}
                        onMouseLeave={stopPreview}
                      >
                        <img src={fixImageUrl(artist.avatar_url)} alt="" className="artist-mini-avatar" />
                        <span>{artist.stage_name}</span>
                        <div className="mini-wave">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-item empty">Chưa theo dõi Artist nào.</div>
                  )}
                </div>

                <div
                  className="dropdown-item view-all"
                  onClick={() => {
                    handleProtectedClick('/profile/following');
                    setIsFollowMenuOpen(false);
                  }}
                >
                  Xem tất cả
                </div>
              </div>

              )}
            </div>
          )}
        </ul>
      </div>

      {isModalOpen && <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Sidebar;