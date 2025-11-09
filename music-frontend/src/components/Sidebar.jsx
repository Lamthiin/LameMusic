// music-frontend/src/components/Sidebar.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyFollowingApi, getRecommendedSongApi } from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
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

            // ---- FIX ARTIST NULL ----
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
          <li className={activePage === 'home' ? 'active' : ''} onClick={() => navigate('/')}>
            {activePage === 'home' ? <MdExplore /> : <MdOutlineExplore />}
            <span>Khám phá</span>
          </li>
          <li className={activePage === 'for-you' ? 'active' : ''} onClick={handleForYouClick}>
            <FaUser />
            <span>Dành cho tôi</span>
          </li>
          <li className={activePage === 'albums' ? 'active' : ''} onClick={() => navigate('/albums')}>
            <FaCompactDisc />
            <span>Albums</span>
          </li>
        </ul>
      </div>

      <hr className="sidebar-divider" />

      <div className="sidebar-section sidebar-library">
        
        <ul className="sidebar-library-items">

          <li onClick={() => navigate('/profile/info')}>
          <VscLibrary />
          <span>Thư viện</span>
          </li>
          {/* <li onClick={() => setIsModalOpen(true)}>
            <GoPlus />
            <span>Tạo playlist</span>
           */}
          <li onClick={() => navigate('/liked-songs')}>
            <GoHeartFill />
            <span>Bài hát yêu thích</span>
          </li>

        {isAuthenticated && (
          <div className="sidebar-dropdown-parent">
            <li
              ref={triggerRef}
              className={`follow-header ${isFollowMenuOpen ? 'active' : ''}`}
              onClick={() => setIsFollowMenuOpen(!isFollowMenuOpen)}
              aria-expanded={isFollowMenuOpen}
            >
              <FaUsers />
              <span>Quan tâm</span>
              <FaAngleRight className="dropdown-arrow" />
            </li>

            <div 
              className={`dropdown-content ${isFollowMenuOpen ? 'open' : ''}`}
              ref={dropdownRef}
              style={{
                '--dropdown-top': triggerRef.current 
                  ? `${triggerRef.current.getBoundingClientRect().top + window.pageYOffset -200}px`
                  : '200px'
              }}
            >
              <div className="dropdown-items-container">
                {followedArtists.length > 0 ? (
                  <>
                    {followedArtists.map(artist => (
                      <div
                        key={artist.id}
                        className="dropdown-item"
                        onClick={() => {
                          navigate(`/artist/${artist.id}`);
                          setIsFollowMenuOpen(false);
                        }}
                      >
                        <img
                          src={artist.avatar_url?.startsWith('http') 
                            ? artist.avatar_url 
                            : `http://localhost:3000${artist.avatar_url || '/images/default-avatar.png'}`}
                          alt={artist.stage_name}
                          className="artist-mini-avatar"
                          onError={e => e.target.src = '/images/default-avatar.png'}
                        />
                        <span>{artist.stage_name}</span>
                        <div className="mini-wave">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    ))}
                    <div 
                      className="see-all-artists"
                      onClick={() => {
                        navigate('/following');
                        setIsFollowMenuOpen(false);
                      }}
                    >
                      Xem tất cả
                    </div>
                  </>
                ) : (
                  <div style={{padding: '32px 20px', textAlign: 'center', color: '#80d8d0', fontSize: '14px'}}>
                    Chưa theo dõi Artist nào
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </ul>
      </div>

      {/* {isModalOpen && (
        <CreatePlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPlaylistCreated={() => setIsModalOpen(false)}
        /> */}
      {/* )} */}
    </div>
  );
};

export default Sidebar;
