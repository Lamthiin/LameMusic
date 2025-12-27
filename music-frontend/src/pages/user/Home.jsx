// src/pages/user/Home.jsx – FULL, ĐẸP, KHÔNG TRÙNG CLASS
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

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const R2_BASE = import.meta.env.VITE_R2_BASE || "https://pub-1f9b74cb44204e84b3dd30bb4df6a1e2.r2.dev";

const fixUrl = (url, type = 'image') => {
    if (!url) { 
        if (type === 'artist') return '/images/default-artist.png';
        if (type === 'audio') return '';
        return '/images/default-album.png';
    }
    if (url.startsWith('http')) return url;

    const prefix = type === 'image' ? '/media/images' : '/media/audio';
    const originalPath = type === 'image' ? '/images' : '/audio';
    
    if (url.startsWith(prefix)) {
        return `http://localhost:3000${url}`;
    }
    
    return `http://localhost:3000${url.replace(originalPath, prefix)}`;
};

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

  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      try {
        const data = await fetchSongs();
        const songsWithUrls = data.map((song) => ({
          ...song,
          image_url: fixUrl(song.image_url || song.album?.cover_url, "image"),
          file_url: fixUrl(song.file_url, "audio"),
          album: song.album
            ? { ...song.album, cover_url: fixUrl(song.album.cover_url, "image") }
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
    <div className="home-wrapper">
      {/* BÀI HÁT HÀNG ĐẦU */}
      <section className="home-section">
        <div className="home-section-header">
          <h3 className="home-section-title">Bài hát hàng đầu</h3>
          <button onClick={() => navigate("/songs")} className="home-see-more">
            Xem thêm
          </button>
        </div>

        {loading ? (
          <p className="home-loading">Đang tải bài hát...</p>
        ) : songs.length === 0 ? (
          <p className="home-empty">Không có bài hát nào</p>
        ) : (
          <div className="home-track-grid">
            {songs.map((song) => (
              <div
                key={song.id}
                className="home-track-card"
                onClick={() => navigate(`/song/${song.id}`)}
              >
                <div className="home-track-image-wrapper">
                  <img
                    src={song.image_url || "/images/default-album.png"}
                    alt={song.title}
                    className="home-track-image"
                  />
                  <button
                    className="home-play-overlay"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (song.file_url) {
                        playTrack({
                          ...song,
                          file_url: fixUrl(song.file_url, "audio"),
                        }, songs, songs.indexOf(song));
                      }
                    }}
                  >
                    <FaPlay size={24} />
                  </button>
                </div>
                <p className="home-track-title">{song.title}</p>
                <p className="home-track-artist">
                  {song.songArtists && song.songArtists.length > 0
                    ? song.songArtists.map((sa, index) => (
                        <span
                          key={sa.artist?.id || index}
                          className="home-artist-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (sa.artist?.id) {
                              navigate(`/artist/${sa.artist.id}`);
                            }
                          }}
                        >
                          {sa.artist?.stage_name}
                          {index < song.songArtists.length - 1 ? ", " : ""}
                        </span>
                      ))
                    : "Nghệ sĩ không xác định"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NGHỆ SĨ NỔI BẬT */}
      <section className="home-section">
        <div className="home-section-header">
          <h3 className="home-section-title">Nghệ sĩ nổi bật</h3>
          <button onClick={() => navigate("/artists")} className="home-see-more">
            Xem thêm
          </button>
        </div>

        {loadingArtists ? (
          <p className="home-loading">Đang tải nghệ sĩ...</p>
        ) : (
          <div className="home-artist-scroll">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="home-artist-card"
                onClick={() => navigate(`/artist/${artist.id}`)}
              >
                <img
                  src={artist.avatar_url || "/images/default-artist.png"}
                  alt={artist.stage_name}
                  className="home-artist-avatar"
                />
                <p className="home-artist-name">{artist.stage_name}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* THỂ LOẠI */}
      <section className="home-section">
        <div className="home-section-header">
          <h3 className="home-section-title">Khám phá thể loại</h3>
        </div>

        {loadingGenres ? (
          <p className="home-loading">Đang tải thể loại...</p>
        ) : (
          <div className="home-genre-grid">
            {genres.map((genre) => (
              <div
                key={genre.id}
                className="home-genre-card"
                onClick={() => navigate(`/genre/${genre.slug}`)}
              >
                <img
                  src={genre.image_url || "/images/default-genre.png"}
                  alt={genre.name}
                  className="home-genre-image"
                />
                <div className="home-genre-overlay">
                  <h4 className="home-genre-name">{genre.name}</h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Home;
