// src/components/SearchResult.jsx – FULL HOÀN CHỈNH + CÓ PHẦN NGƯỜI DÙNG

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchApi } from "../../utils/api";
import { FaUserCircle } from "react-icons/fa"; // THÊM ICON NÀY
import "./SearchResult.css";

const fixImageUrl = (url) => {
  if (!url) return "/images/default-song.jpg";
  if (url.startsWith("http")) return url;
  return `http://localhost:3000${url}`;
};

const SearchResult = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q")?.trim() || "";

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      try {
        const data = await searchApi(q, "full");

        // Fix ảnh cho songs
        data.songs = data.songs.map((song, index) => ({
          ...song,
          image_url: fixImageUrl(song.image_url || song.album?.cover_url),
          _tempIndex: index,
        }));

        // Fix ảnh artist & album
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
        setResults({ songs: [], artists: [], albums: [], users: [] });
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [q]);

  if (!q) {
    return <div className="search-result-page">Nhập từ khóa để tìm kiếm nhé 🎵</div>;
  }

  if (loading) {
    return <div className="search-result-page search-result-loading">Đang tìm "{q}"...</div>;
  }

  // Tính hasResults bao gồm cả users
  const hasResults =
    results.songs.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.users?.length > 0;

  return (
    <div className="search-result-page">
      <h2>
        Kết quả tìm kiếm cho: <strong>"{q}"</strong>
      </h2>

      {/* ==================== BÀI HÁT ==================== */}
      {results.songs.length > 0 && (
        <section className="search-result-section">
          <h3>Bài hát ({results.songs.length})</h3>
          <div className="search-result-grid">
            {results.songs.map((song) => {
              const isAI = song.source === "AI";

              const title = song.title;
              const artistNames =
                song.songArtists
                  ?.map((sa) => sa.artist?.stage_name)
                  .filter(Boolean)
                  .join(", ") || "Nghệ sĩ không rõ";

              const albumName = song.album?.title || "";

              return (
                <div
                  key={song.id ? song.id : `ai-${song._tempIndex}-${title}`}
                  className={`search-result-card ${isAI ? "search-result-ai-card" : ""}`}
                  onClick={() => song.id && navigate(`/song/${song.id}`)}
                  style={{
                    cursor: song.id ? "pointer" : "default",
                    opacity: song.id ? 1 : 0.85,
                  }}
                >
                  <img src={song.image_url} alt={title} loading="lazy" />

                  <div className="search-result-info">
                    <p className="search-result-title">
                      {title}
                      
                    </p>

                    <p className="search-result-artist">{artistNames}</p>
                    

                    {albumName && <small className="search-result-album">{albumName}</small>}

                    {isAI && (
                      <small className="search-result-ai-note">
                        Tìm bằng AI
                      </small>
                    )}
                    {isAI && (
                        <span className="search-result-ai-tag">
                          AI Match {(song.similarity * 100).toFixed(0)}%
                        </span>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================== NGHỆ SĨ ==================== */}
      {results.artists.length > 0 && (
        <section className="search-result-section">
          <h3>Nghệ sĩ ({results.artists.length})</h3>
          <div className="search-result-grid">
            {results.artists.map((a) => (
              <div
                key={a.id}
                className="search-result-card"
                onClick={() => navigate(`/artist/${a.id}`)}
              >
                <img src={a.avatar_url} alt={a.stage_name} loading="lazy" />
                <div className="search-result-info">
                  <p className="search-result-title">{a.stage_name}</p>
                  <small>Nghệ sĩ</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== ALBUM ==================== */}
      {results.albums.length > 0 && (
        <section className="search-result-section">
          <h3>Album ({results.albums.length})</h3>
          <div className="search-result-grid">
            {results.albums.map((alb) => (
              <div
                key={alb.id}
                className="search-result-card"
                onClick={() => navigate(`/album/${alb.id}`)}
              >
                <img src={alb.cover_url} alt={alb.title} loading="lazy" />
                <div className="search-result-info">
                  <p className="search-result-title">{alb.title}</p>
                  <small>{alb.artist?.stage_name || "Không rõ"}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== NGƯỜI DÙNG ==================== */}
      {results.users?.length > 0 && (
        <section className="search-result-section">
          <h3>Người dùng ({results.users.length})</h3>
          <div className="search-result-grid">
            {results.users.map((u) => (
              <div
                key={u.id}
                className="search-result-card"
                onClick={() => navigate(`/profile/${u.username}`)}
                style={{ cursor: "pointer" }}
              >
                {u.avatar_url ? (
                  <img src={fixImageUrl(u.avatar_url)} alt={u.username} loading="lazy" />
                ) : (
                  <div className="search-result-user-placeholder">
                    <FaUserCircle size={80} color="#b3b3b3" />
                  </div>
                )}
                <div className="search-result-info">
                  <p className="search-result-title">{u.username}</p>
                  <small>{u.role?.name || "Người nghe"}</small>
                  {u.bio && <p className="search-result-user-bio">{u.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== KHÔNG CÓ KẾT QUẢ ==================== */}
      {!hasResults && (
        <div className="search-result-no-result">
          Không tìm thấy gì cho "<strong>{q}</strong>" 😢
          <br />
          <small>
            Thử tìm tên bài hát, nghệ sĩ, người dùng hoặc gõ một đoạn lời bài hát nhé!
          </small>
        </div>
      )}
    </div>
  );
};

export default SearchResult;