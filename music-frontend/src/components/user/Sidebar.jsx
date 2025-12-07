// music-frontend/src/components/Sidebar.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchMyFollowingApi, getRecommendedSongApi } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import './Sidebar.css';

import { MdOutlineExplore, MdExplore } from 'react-icons/md';
import { FaSearch, FaCompactDisc, FaUsers, FaAngleRight, FaUser } from 'react-icons/fa';
import { VscLibrary } from 'react-icons/vsc';
import { GoHeartFill, GoPlus } from 'react-icons/go';
import CreatePlaylistModal from './CreatePlaylistModal';

const Sidebar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { playTrack, currentPlaylist } = usePlayer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [isFollowMenuOpen, setIsFollowMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('');

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const loadFollowing = useCallback(async () => {
    if (!isAuthenticated) return setFollowingList([]);
    try {
      const data = await fetchMyFollowingApi();
      setFollowingList(data);
    } catch (e) {
      console.error(e);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFollowing();
    const handleFollowUpdate = () => loadFollowing();
    window.addEventListener('followStatusChanged', handleFollowUpdate);
    return () => window.removeEventListener('followStatusChanged', handleFollowUpdate);
  }, [isAuthenticated, loadFollowing]);

  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'home';
    setActivePage(path);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsFollowMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ----------------- Handle Dành cho tôi -----------------
  const handleForYouClick = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      const recommendedSong = await getRecommendedSongApi();
      if (recommendedSong?.file_url) {
        if (!recommendedSong.artist) {
          recommendedSong.artist = { stage_name: 'Nghệ sĩ' };
        }
        playTrack(recommendedSong, [recommendedSong], 0);
        alert(`Đang phát: ${recommendedSong.title} của ${recommendedSong.artist.stage_name}`);
      } else {
        alert('Hiện tại chưa có đề xuất phù hợp.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lấy bài đề xuất.');
    }
  };

  const followedArtists = followingList.filter(f => f.following).map(f => f.following);

  return (
    <div className="sidebar-container">
      <div className="sidebar-section sidebar-nav">
        <ul>
          <li className={activePage === 'home' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('/')}>
            {activePage === 'home' ? <MdExplore /> : <MdOutlineExplore />}
            <span>Khám phá</span>
          </li>
          <li className={activePage === 'for-you' ? 'nav-item active' : 'nav-item'} onClick={handleForYouClick}>
            <FaUser />
            <span>Dành cho tôi</span>
          </li>
          <li className={activePage === 'albums' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('/albums')}>
            <FaCompactDisc />
            <span>Albums</span>
          </li>
        </ul>
      </div>

      <hr className="sidebar-divider" />

      <div className="sidebar-section sidebar-library">
        <ul className="sidebar-library-items">
          <li className="library-item" onClick={() => navigate('/profile/info')}>
            <VscLibrary />
            <span>Thư viện</span>
          </li>

          {isAuthenticated && (
            <div className="dropdown-wrapper">
              <li
                ref={triggerRef}
                className={`dropdown-trigger ${isFollowMenuOpen ? 'active' : ''}`}
                onClick={() => setIsFollowMenuOpen(!isFollowMenuOpen)}
                aria-expanded={isFollowMenuOpen}
              >
                <FaUsers />
                <span>Quan tâm</span>
                <FaAngleRight className={`dropdown-arrow ${isFollowMenuOpen ? 'open' : ''}`} />
              </li>

              {/* DROPDOWN NHỎ GỌN – HIỆN BÊN PHẢI */}
              <div
                ref={dropdownRef}
                className={`following-dropdown ${isFollowMenuOpen ? 'open' : ''}`}
              >
                <div className="dropdown-header">Nghệ sĩ bạn quan tâm</div>
                <div className="dropdown-body">

                  {followedArtists.length > 0 ? (
                    <>
                      {/* chỉ hiển thị 3 nghệ sĩ đầu */}
                      {followedArtists.slice(0,3).map(artist => (
                        <div
                          key={artist.id}
                          className="dropdown-item"
                          onClick={() => {
                            navigate(`/artist/${artist.id}`);
                            setIsFollowMenuOpen(false);
                          }}
                        >
                          <img
                            src={
                              artist.avatar_url?.startsWith("http")
                                ? artist.avatar_url
                                : `http://localhost:3000${artist.avatar_url || "/images/default-avatar.png"}`
                            }
                            alt={artist.stage_name}
                            className="artist-mini-avatar"
                          />
                          <span>{artist.stage_name}</span>
                        </div>
                      ))}

                      {/* nếu có hơn 3 → show xem thêm */}
                      {followedArtists.length > 3 && (
                        <div
                          className="see-all-artists"
                          onClick={() => {
                            navigate("/profile/following");
                            setIsFollowMenuOpen(false);
                          }}
                        >
                          Xem thêm ({followedArtists.length - 3})
                        </div>
                      )}

                    </>
                  ) : (
                    <div className="dropdown-empty">Chưa theo dõi Artist nào</div>
                  )}

                </div>

              </div>
            </div>
          )}

          <li className="library-item" onClick={() => navigate('/liked-songs')}>
            <GoHeartFill />
            <span>Bài hát yêu thích</span>
          </li>
        </ul>
      </div>

      {/* {isModalOpen && (
        <CreatePlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPlaylistCreated={() => setIsModalOpen(false)}
        />
      )} */}
    </div>
  );
};

export default Sidebar;