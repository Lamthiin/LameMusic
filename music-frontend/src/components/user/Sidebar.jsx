import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  fetchMyFollowingApi,
  getRecommendedSongApi,
  fetchListenHistoryApi
} from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import './Sidebar.css';

import { MdOutlineExplore, MdExplore } from 'react-icons/md';
import { FaCompactDisc, FaUsers, FaAngleRight, FaUser } from 'react-icons/fa';
import { VscLibrary } from 'react-icons/vsc';
import { GoHeartFill } from 'react-icons/go';

const Sidebar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { playTrack } = usePlayer();

  const [followingList, setFollowingList] = useState([]);
  const [listenHistory, setListenHistory] = useState([]);
  const [isFollowMenuOpen, setIsFollowMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('');

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // ================= LOAD FOLLOWING =================
  const loadFollowing = useCallback(async () => {
    if (!isAuthenticated) return setFollowingList([]);
    try {
      const data = await fetchMyFollowingApi();
      setFollowingList(data);
    } catch (e) {
      console.error(e);
    }
  }, [isAuthenticated]);

  // ================= LOAD HISTORY (NGHE GẦN NHẤT) =================
  useEffect(() => {
    if (!isAuthenticated) {
      setListenHistory([]);
      return;
    }

    const loadHistory = async () => {
      const data = await fetchListenHistoryApi(10);

      // 🔥 SẮP XẾP NGHE GẦN NHẤT TRÊN CÙNG (CHO CHẮC)
      const sorted = [...data].sort(
        (a, b) => new Date(b.listenedAt) - new Date(a.listenedAt)
      );

      setListenHistory(sorted);
    };

    loadHistory();
  }, [isAuthenticated]);

  // ================= ACTIVE PAGE =================
  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'home';
    setActivePage(path);
  }, [location.pathname]);

  // ================= CLICK OUTSIDE =================
  useEffect(() => {
    const handler = e => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsFollowMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleForYouClick = async () => {
    if (!isAuthenticated) return navigate('/login');
    const song = await getRecommendedSongApi();
    if (song?.file_url) {
      playTrack(song, [song], 0);
    }
  };

  const followedArtists = followingList
    .filter(f => f.following)
    .map(f => f.following);

  return (
    <div className="sidebar-container">

      {/* ================= NAV ================= */}
      <div className="sidebar-section sidebar-nav">
        <ul>
          <li className={`nav-item ${activePage === 'home' ? 'active' : ''}`} onClick={() => navigate('/')}>
            {activePage === 'home' ? <MdExplore /> : <MdOutlineExplore />}
            <span>Khám phá</span>
          </li>

          <li className="nav-item" onClick={handleForYouClick}>
            <FaUser />
            <span>Dành cho tôi</span>
          </li>

          <li className={`nav-item ${activePage === 'albums' ? 'active' : ''}`} onClick={() => navigate('/albums')}>
            <FaCompactDisc />
            <span>Albums</span>
          </li>
        </ul>
      </div>

      <hr className="sidebar-divider" />

      {/* ================= LIBRARY ================= */}
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
              >
                <FaUsers />
                <span>Quan tâm</span>
                <FaAngleRight className={`dropdown-arrow ${isFollowMenuOpen ? 'open' : ''}`} />
              </li>

              <div
                ref={dropdownRef}
                className={`following-dropdown ${isFollowMenuOpen ? 'open' : ''}`}
              >
                <div className="dropdown-header">Nghệ sĩ bạn quan tâm</div>
                <div className="dropdown-body">
                  {followedArtists.length > 0 ? (
                    followedArtists.slice(0, 3).map(artist => (
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
                            artist.avatar_url?.startsWith('http')
                              ? artist.avatar_url
                              : `http://localhost:3000${artist.avatar_url}`
                          }
                          className="artist-mini-avatar"
                        />
                        <span>{artist.stage_name}</span>
                      </div>
                    ))
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

      {/* ================= HISTORY ================= */}
      {isAuthenticated && (
        <>
          <hr className="sidebar-divider" />
          <div className="sidebar-section sidebar-history">
            <div className="sidebar-title">Nghe gần đây</div>

            {listenHistory.length > 0 ? (
              listenHistory.slice(0, 5).map(h => (
                <div
                  key={h.id}
                  className="history-item"
                  onClick={() => playTrack(h.song, [h.song], 0)}
                >
                  <img
                    src={
                      h.song.image_url?.startsWith('http')
                        ? h.song.image_url
                        : `http://localhost:3000${h.song.image_url || '/images/default.png'}`
                    }
                  />
                  <div>
                    <p className="history-title">{h.song.title}</p>
                    <span className="history-artist">
                      {h.song.artist?.stage_name}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="history-empty">Chưa có lịch sử nghe</div>
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default Sidebar;
