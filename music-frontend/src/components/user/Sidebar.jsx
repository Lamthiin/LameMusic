// music-frontend/src/components/Sidebar.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  fetchMyFollowingApi,
  fetchListenHistoryApi,
  getRecommendedSongApi
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

  // ================= FOLLOWING =================
  const loadFollowing = useCallback(async () => {
    if (!isAuthenticated) return setFollowingList([]);
    const data = await fetchMyFollowingApi();
    setFollowingList(data || []);
  }, [isAuthenticated]);

  useEffect(() => {
    loadFollowing();
    const handler = () => loadFollowing();
    window.addEventListener('followStatusChanged', handler);
    return () =>
      window.removeEventListener('followStatusChanged', handler);
  }, [loadFollowing]);

  // ================= HISTORY =================
  useEffect(() => {
    if (!isAuthenticated) return setListenHistory([]);

    const loadHistory = async () => {
      const data = await fetchListenHistoryApi(10);
      setListenHistory(data || []);
    };

    loadHistory();
  }, [isAuthenticated]);

  // Create a unique ordered list of recent songs to use as the playlist
  const uniqueHistorySongs = useMemo(() => {
    return listenHistory
      .filter((item, index, self) => index === self.findIndex((t) => t.song.id === item.song.id))
      .map(h => {
        const s = { ...h.song };
        s.image_url = s.image_url?.startsWith('http') ? s.image_url : `http://localhost:3000${s.image_url || '/images/default.png'}`;
        return s;
      });
  }, [listenHistory]);

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
    if (song?.file_url) playTrack(song, [song], 0);
  };

  const followedArtists = followingList
    .filter(f => f.following)
    .map(f => f.following);

  return (
    <div className="sidebar-container">

      {/* ================= NAV ================= */}
      <div className="sidebar-section sidebar-nav">
        <ul>
          <li
            className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            {activePage === 'home' ? <MdExplore /> : <MdOutlineExplore />}
            <span>Khám phá</span>
          </li>

          <li className="nav-item" onClick={handleForYouClick}>
            <FaUser />
            <span>Dành cho tôi</span>
          </li>

          <li
            className={`nav-item ${activePage === 'albums' ? 'active' : ''}`}
            onClick={() => navigate('/albums')}
          >
            <FaCompactDisc />
            <span>Albums</span>
          </li>
        </ul>
      </div>

      <hr className="sidebar-divider" />

      {/* ================= LIBRARY ================= */}
      <div className="sidebar-section sidebar-library">
        <ul>
          {/* <li className="library-item" onClick={() => navigate('/profile/info')}>
            <VscLibrary />
            <span>Thư viện</span>
          </li> */}

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
                    <>
                      {followedArtists.slice(0, 3).map(artist => (
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
                                : `http://localhost:3000${artist.avatar_url || '/images/default-avatar.png'}`
                            }
                            className="artist-mini-avatar"
                          />
                          <span>{artist.stage_name}</span>
                        </div>
                      ))}

                      {followedArtists.length > 3 && (
                        <div
                          className="see-all-artists"
                          onClick={() => {
                            navigate('/profile/following');
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

      {/* ================= HISTORY ================= */}
{/* ================= HISTORY ================= */}
{isAuthenticated && (
  <div className="sidebar-history">
    <div className="sidebar-title">Nghe gần đây</div>

    <div className="sidebar-history-list">
      {uniqueHistorySongs.length > 0 ? (
        uniqueHistorySongs.map((song, idx) => (
          <div
            key={song.id}
            className="history-item"
            onClick={() => playTrack(song, uniqueHistorySongs, idx)}
          >
            <img
              src={song.image_url}
              alt={song.title}
            />
            <div>
              <div className="history-title">{song.title}</div>
              <div className="history-artist">
                {(() => {
                  const primaryArtist = song.songArtists?.find(a => a.is_primary)?.artist;
                  const fallbackArtist = song.songArtists?.[0]?.artist;
                  return primaryArtist?.stage_name || fallbackArtist?.stage_name || "Nghệ sĩ";
                })()}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="history-empty">Chưa có lịch sử nghe</div>
      )}
    </div>
  </div>
)}
    </div>
  );
};

export default Sidebar;
