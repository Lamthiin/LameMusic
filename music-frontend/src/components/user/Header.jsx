// music-frontend/src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchNotificationsApi,
  markNotificationAsReadApi,
  searchApi,
} from "../../utils/api";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"; // THÊM useSearchParams

import {
  FaSearch,
  FaUserCircle,
  FaBell,
  FaCheckCircle,
} from "react-icons/fa";

import "./Header.css";

const fixImageUrl = (url) => {
  if (!url) return "/images/default.png";
  if (url.startsWith("http")) return url;
  return `http://localhost:3000${url}`;
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams(); // THÊM: lấy params từ URL
  const { isAuthenticated, user, logout } = useAuth();

  // Lấy query từ URL (nếu đang ở trang /search)
  const urlQuery = searchParams.get("q")?.trim() || "";

  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState(null);

  const searchRef = useRef(null);
  const userRef = useRef(null);
  const notifRef = useRef(null);

  // Đồng bộ query từ URL mỗi khi thay đổi (back/forward hoặc vào trang search)
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  // ==================== NOTIFICATIONS ====================
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

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

  const unread = notifications.filter((n) => !n.is_read).length;

  // ==================== SEARCH LOGIC (DROPDOWN) ====================
  useEffect(() => {
    // Không hiện dropdown khi đang ở trang search full
    if (location.pathname === "/search") {
      setResults(null);
      return;
    }

    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchApi(query, "dropdown");

        // Fix ảnh cho songs (DB + AI)
        data.songs = data.songs.map((s) => ({
          ...s,
          image_url:
            s.source === "AI"
              ? s.image_url || "/images/ai-placeholder.jpg"
              : fixImageUrl(s.image_url || s.album?.cover_url),
        }));

        // Fix ảnh cho artists & albums
        data.artists = data.artists.map((a) => ({
          ...a,
          avatar_url: fixImageUrl(a.avatar_url),
        }));

        data.albums = data.albums.map((alb) => ({
          ...alb,
          cover_url: fixImageUrl(alb.cover_url),
        }));

        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, location.pathname]);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handler = (e) => {
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

  const go = (path, e) => {
    e?.stopPropagation();
    setResults(null);
    setQuery("");
    navigate(path);
  };

  const [userOpen, setUserOpen] = useState(false);

  // Khi bấm Enter → chuyển sang trang search full
  const submitSearch = (e) => {
    if (e.key === "Enter" && query.trim()) {
      const searchTerm = query.trim();
      setQuery(""); // Clear input sau khi search
      setResults(null);
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="header">
      {/* LOGO */}
      <div
        className="header-left header-logo galaxy-text"
        onClick={() => navigate("/")}
      >
        🎧 Lame
      </div>

      {/* SEARCH BAR */}
      <div className="header-center" ref={searchRef}>
        <div className="search-box">
          <FaSearch />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={submitSearch}
            placeholder={
              urlQuery
                ? `Đang tìm: "${urlQuery}"`
                : "Tìm bài hát, lời bài hát, nghệ sĩ, album..."
            }
            autoFocus={location.pathname === "/search"}
          />
        </div>

        {/* DROPDOWN RESULTS */}
        {results && (
          <div className="search-dropdown">
            {/* SONGS */}
            {results.songs.length > 0 && (
              <>
                <h4>Bài hát</h4>
                {results.songs.map((song) => {
                  const isAI = song.source === "AI";
                  const title = song.title;
                  const artistNames = isAI
                    ? song.artist_name
                    : song.songArtists?.map((sa) => sa.artist?.stage_name).join(", ") ||
                      "Unknown";

                  const handleClick = (e) => {
                    if (isAI) {
                      // AI → chuyển sang trang search full
                      setQuery("");
                      setResults(null);
                      navigate(`/search?q=${encodeURIComponent(query)}`);
                    } else {
                      go(`/song/${song.id}`, e);
                    }
                  };

                  return (
                    <div
                      key={isAI ? `ai-${title}-${artistNames}` : song.id}
                      className="result-item"
                      onClick={handleClick}
                    >
                      <img src={song.image_url} alt={title} />
                      <div>
                        <p>
                          {title}
                          {isAI && (
                            <small style={{ color: "#1db954", marginLeft: "8px" }}>
                              (AI match)
                            </small>
                          )}
                        </p>
                        <span>{artistNames}</span>
                        {isAI && (
                          <small style={{ display: "block", color: "#b3b3b3" }}>
                            Độ tương đồng: {(song.similarity * 100).toFixed(0)}%
                          </small>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* ARTISTS */}
            {results.artists.length > 0 && (
              <>
                <h4>Nghệ sĩ</h4>
                {results.artists.map((a) => (
                  <div
                    key={a.id}
                    className="result-item"
                    onClick={(e) => go(`/artist/${a.id}`, e)}
                  >
                    <img src={a.avatar_url} alt={a.stage_name} />
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
                {results.albums.map((alb) => (
                  <div
                    key={alb.id}
                    className="result-item"
                    onClick={(e) => go(`/album/${alb.id}`, e)}
                  >
                    <img src={alb.cover_url} alt={alb.title} />
                    <div>
                      <p>{alb.title}</p>
                      <span>{alb.artist?.stage_name}</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* USERS */}
            {results.users?.length > 0 && (
              <>
                <h4>Người dùng</h4>
                {results.users.map((u) => (
                  <div
                    key={u.id}
                    className="result-item"
                    onClick={(e) => go(`/profile/${u.username}`, e)}
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

            {/* NO RESULTS */}
            {results.songs.length +
              results.artists.length +
              results.albums.length +
              (results.users?.length || 0) ===
              0 && <div className="no-result">Không tìm thấy gì 😢</div>}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="header-right">
        {/* NOTIFICATION */}
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
                {notifications.map((n) => (
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
            <FaCheckCircle /> Nghệ sĩ
          </div>
        )}

        {/* BECOME ARTIST */}
        {isAuthenticated && user?.role === "listener" && (
          <button
            className="btn-become-artist"
            onClick={() => navigate("/artist-registration")}
          >
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
                {user.role === "artist" && (
                  <div onClick={() => navigate("/artist-dashboard")}>
                    Quản lý kênh nghệ sĩ
                  </div>
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