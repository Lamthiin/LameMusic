// src/pages/user/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePlayer } from "../../context/PlayerContext";
import {
  fetchSongs,
  fetchFeaturedArtists,
  fetchCategories,
} from "../../utils/api";
import "./Home.css";
import { FaPlay } from "react-icons/fa";
import Footer from "../../components/user/Footer";

// ==================== FIX URL THÔNG MINH (Local + R2) ====================
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const R2_BASE = import.meta.env.VITE_R2_BASE || "https://pub-1f9b74cb44204e84b3dd30bb4df6a1e2.r2.dev";

const fixUrl = (url, type = 'image') => {
    if (!url) { // Xử lý NULL
        if (type === 'artist') return '/images/default-artist.png';
        if (type === 'audio') return ''; // Trả về rỗng nếu không có file nhạc
        return '/images/default-album.png'; // Mặc định cho album/song
    }
    if (url.startsWith('http')) { // Nếu đã là URL tuyệt đối
        return url;
    }
    // Mặc định (ví dụ: /images/artist-1.jpg)
    const prefix = type === 'image' ? '/media/images' : '/media/audio';
    const originalPath = type === 'image' ? '/images' : '/audio';
    
    // Đảm bảo không thay thế 2 lần
    if (url.startsWith(prefix)) {
        return `http://localhost:3000${url}`;
    }
    
    return `http://localhost:3000${url.replace(originalPath, prefix)}`;
};

// ====================================================================

const Home = () => {
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(true);

  // ==================== LOAD BÀI HÁT ====================
  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      try {
        const data = await fetchSongs();

        const songsWithUrls = data.map((song) => ({
          ...song,
          image_url: fixUrl(song.image_url || song.album?.cover_url, "image"),
          file_url: fixUrl(song.file_url, "audio"), // 100% URL tuyệt đối
          album: song.album
            ? {
                ...song.album,
                cover_url: fixUrl(song.album.cover_url, "image"),
              }
            : null,
        }));

        setSongs(songsWithUrls);
      } catch (err) {
        console.error("Lỗi tải bài hát:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
  }, []);

  // ==================== LOAD NGHỆ SĨ ====================
  useEffect(() => {
    const loadArtists = async () => {
      setLoadingArtists(true);
      try {
        const data = await fetchFeaturedArtists();

        const artistsWithUrls = data.map((artist) => ({
          ...artist,
          avatar_url: fixUrl(artist.avatar_url, "artist"),
        }));

        setArtists(artistsWithUrls);
      } catch (err) {
        console.error("Lỗi tải nghệ sĩ:", err);
      } finally {
        setLoadingArtists(false);
      }
    };

    loadArtists();
  }, []);

  // ==================== LOAD THỂ LOẠI ====================
  useEffect(() => {
    const loadGenres = async () => {
      setLoadingGenres(true);
      try {
        const data = await fetchCategories();

        const genresWithUrls = data.map((genre) => ({
          ...genre,
          image_url: fixUrl(genre.image_url, "image"),
        }));

        setGenres(genresWithUrls);
      } catch (err) {
        console.error("Lỗi tải thể loại:", err);
      } finally {
        setLoadingGenres(false);
      }
    };

    loadGenres();
  }, []);

  return (
    <div className="home-page">
      {/* BÀI HÁT HÀNG ĐẦU */}
      <div className="home-section">
        <div className="home-section-header">
          <h3>Bài hát hàng đầu</h3>
          <a onClick={() => navigate("/songs")} className="see-more-link">
            Xem thêm
          </a>
        </div>

        {loading ? (
          <p className="loading-message">Đang tải bài hát...</p>
        ) : songs.length === 0 ? (
          <p className="loading-message">Không có bài hát nào</p>
        ) : (
          <div className="track-list">
            {songs.map((song) => (
              <div
                key={song.id}
                className="track-item"
                onClick={() => navigate(`/song/${song.id}`)}
              >
                <div className="track-image-container">
                  <img
                    src={song.image_url || "/images/default-album.png"}
                    alt={song.title}
                    className="track-image"
                  />
                  <button
                    className="play-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (song.file_url) {
                        playTrack({
                          ...song,
                          file_url: fixUrl(song.file_url, "audio"), // chắc chắn 100%
                        });
                      }
                    }}
                  >
                    <FaPlay />
                  </button>
                </div>
                <p className="track-title">{song.title}</p>
                <p className="track-artist">
                  {song.artist?.stage_name || "Nghệ sĩ không xác định"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NGHỆ SĨ NỔI BẬT */}
      <div className="home-section">
        <div className="home-section-header">
          <h3>Nghệ sĩ nổi bật</h3>
          <a onClick={() => navigate("/artists")} className="see-more-link">
            Xem thêm
          </a>
        </div>

        {loadingArtists ? (
          <p className="loading-message">Đang tải nghệ sĩ...</p>
        ) : (
          <div className="horizontal-scroll">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="artist-card"
                onClick={() => navigate(`/artist/${artist.id}`)}
              >
                <img
                  src={artist.avatar_url || "/images/default-artist.png"}
                  alt={artist.stage_name}
                />
                <p>{artist.stage_name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* THỂ LOẠI */}
      <div className="home-section">
        <div className="home-section-header">
          <h3>Thể loại</h3>
        </div>

        {loadingGenres ? (
          <p className="loading-message">Đang tải thể loại...</p>
        ) : (
          <div className="genres-grid">
            {genres.map((genre) => (
              <div
                key={genre.id}
                className="genre-card"
                onClick={() => navigate(`/genre/${genre.slug}`)}
              >
                <img
                  src={genre.image_url || "/images/default-genre.png"}
                  alt={genre.name}
                  className="genre-image"
                />
                <div className="genre-overlay">
                  <p>{genre.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Home;