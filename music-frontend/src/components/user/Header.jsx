// music-frontend/src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchNotificationsApi,
  markNotificationAsReadApi,
  searchApi
} from "../../utils/api";
import { useNavigate, useLocation } from "react-router-dom";

import {
  FaSearch,
  FaUserCircle,
  FaBell,
  FaCheckCircle
} from "react-icons/fa";

import "./Header.css";

// ------------------------------------------------------
// FIX ẢNH (BẮT BUỘC PHẢI CÓ)
// ------------------------------------------------------
const fixImageUrl = (url) => {
  if (!url) return "/images/default.png";
  if (url.startsWith("http")) return url;

  return `http://localhost:3000${url}`;
};

// ------------------------------------------------------
// HEADER COMPONENT
// ------------------------------------------------------
const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  // ---------------- SEARCH STATE ----------------
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);

  // ---------------- DROPDOWN ----------------
  const searchRef = useRef(null);
  const userRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();

  // ---------------- NOTIFICATION ----------------
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  // ------------------------------------------------------
  // LOAD NOTIFICATION
  // ------------------------------------------------------
  const loadNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      const data = await fetchNotificationsApi(10);
      setNotifications(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  // ------------------------------------------------------
  // HANDLE CLICK NOTIFICATION
  // ------------------------------------------------------
  const handleNotifClick = async (n) => {
    try {
      if (!n.is_read) {
        await markNotificationAsReadApi(n.id);
        loadNotifications();
      }

      if (n.type === "SONG_APPROVED") {
        navigate(`/song/${n.reference_id}`);
      } else if (n.type === "ARTIST_PROFILE_APPROVED") {
        navigate("/artist-dashboard");
      }
    } catch (err) {}

    setNotifOpen(false);
  };

  const unread = notifications.filter(n => !n.is_read).length;

  // ------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------
  useEffect(() => {
    if (location.pathname === "/search") return;

    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchApi(query, "dropdown");

        data.songs = data.songs.map(s => ({
          ...s,
          image_url: fixImageUrl(s.image_url || s.album?.cover_url)
        }));
        data.artists = data.artists.map(a => ({
          ...a,
          avatar_url: fixImageUrl(a.avatar_url)
        }));
        data.albums = data.albums.map(a => ({
          ...a,
          cover_url: fixImageUrl(a.cover_url)
        }));

        setResults(data);
      } catch {}
    }, 400);

    return () => clearTimeout(timer);
  }, [query, location.pathname]);

  // ------------------------------------------------------
  // CLICK OUTSIDE
  // ------------------------------------------------------
  useEffect(() => {
    const handler = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults(null);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ------------------------------------------------------
  // RESULT CLICK
  // ------------------------------------------------------
  const go = (path, e) => {
    e.stopPropagation();
    setResults(null);
    setQuery("");
    navigate(path);
  };

  // ------------------------------------------------------
  // USER MENU
  // ------------------------------------------------------
  const [userOpen, setUserOpen] = useState(false);

  const submitSearch = (e) => {
    if (e.key === "Enter" && query.trim()) {
      const q = query.trim();
      setQuery("");        // 🔥 QUAN TRỌNG
      setResults(null);    // 🔥 QUAN TRỌNG
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  // ------------------------------------------------------
  // RENDER
  // ------------------------------------------------------
  return (
    <header className="header">

      {/* LEFT: LOGO */}
      <div
        className="header-left header-logo galaxy-text"
        onClick={() => navigate("/")}
      >
        🎧 Lame
      </div>

      {/* CENTER: SEARCH */}
      <div className="header-center" ref={searchRef}>

        <div className="search-box">
          <FaSearch />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={submitSearch}
            placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
          />
        </div>

        {results && (
          <div className="search-dropdown">

            {/* SONGS */}
            {results.songs.map(song => {
              const artistNames = song.songArtists?.map(sa => sa.artist?.stage_name).join(", ") || song.artist?.stage_name;
              return (
                <div
                  key={song.id}
                  className="result-item"
                  onClick={e => go(`/song/${song.id}`, e)}
                >
                  <img src={song.image_url} />
                  <div>
                    <p>{song.title}</p>
                    <span>{artistNames}</span>
                  </div>
                </div>
              );
            })}

            {/* ARTISTS */}
            {results.artists.length > 0 && (
              <>
                <h4>Nghệ sĩ</h4>
                {results.artists.map(a => (
                  <div
                    key={a.id}
                    className="result-item"
                    onClick={e => go(`/artist/${a.id}`, e)}
                  >
                    <img src={a.avatar_url} />
                    <div>
                      <p>{a.stage_name}</p>
                      <span>Nghệ sĩ</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ALBUMS */}
            {results.albums.length > 0 && (
              <>
                <h4>Album</h4>
                {results.albums.map(alb => (
                  <div
                    key={alb.id}
                    className="result-item"
                    onClick={e => go(`/album/${alb.id}`, e)}
                  >
                    <img src={alb.cover_url} />
                    <div>
                      <p>{alb.title}</p>
                      <span>{alb.artist?.stage_name}</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {results.users?.length > 0 && (
             <>
                <h4>Người dùng</h4>
                {results.users.map(u => (
                  <div
                    key={u.id}
                    className="result-item"
                    onClick={e => go(`/profile/${u.username}`, e)}
                  >
                    <FaUserCircle className="user-icon" />
                    <div>
                      <p>{u.username}</p>
                      <span>{u.role?.name}</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {results.songs.length + results.artists.length + results.albums.length === 0 && (
              <div className="no-result">Không tìm thấy gì 😢</div>
            )}

          </div>
        )}

      </div>

      {/* RIGHT: USER + NOTIF */}
      <div className="header-right">

        {/* NOTIF */}
        {isAuthenticated && (
          <div className="notif" ref={notifRef}>
            <button onClick={() => setNotifOpen(!notifOpen)}>
              <FaBell />
              {unread > 0 && <span className="badge">{unread}</span>}
            </button>

            {notifOpen && (
              <div className="notif-dropdown">
                {notifications.length === 0 && (
                  <div className="notif-empty">Không có thông báo</div>
                )}


                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`notif-item ${n.is_read ? "" : "unread"}`}
                    onClick={() => handleNotifClick(n)}
                  >
                    {n.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ARTIST BADGE */}
        {isAuthenticated && user?.role === "artist" && (
          <div className="artist-badge">
            <FaCheckCircle/> Nghệ sĩ
          </div>
        )}

        {/* NÚT TRỞ THÀNH NGHỆ SĨ */}
        {isAuthenticated && user?.role === "listener" && (
          <button className="btn-become-artist" onClick={() => navigate("/artist-registration")}>
            Trở thành Nghệ sĩ
          </button>
        )}

        {/* USER MENU */}
        {isAuthenticated ? (
          <div className="user" ref={userRef}>
            <button onClick={() => setUserOpen(!userOpen)}>
              <FaUserCircle />
              {user.username}
            </button>

            {userOpen && (
              <div className="user-dropdown">
                <div onClick={() => navigate("/profile/info")}>Tài khoản</div>
                {user.role==="artist" && (
                  <div onClick={() => navigate("/artist-dashboard")}>Quản lý kênh nghệ sĩ</div>
                )}
                <div onClick={logout}>Đăng xuất</div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <button onClick={() => navigate("/login")}>Đăng nhập</button>
            <button onClick={() => navigate("/register")}>Đăng ký</button>
          </div>
        )}

      </div>

    </header>
  );
};

export default Header;
