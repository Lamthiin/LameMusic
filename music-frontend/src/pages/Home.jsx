import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { fetchSongs, fetchFeaturedArtists, fetchCategories } from "../utils/api";
import "./Home.css";
import { FaPlay } from "react-icons/fa";
import Footer from "../components/Footer";

// Dữ liệu giả (Tin hot)
const mockPosts = [
  { id: 1, title: "Tin tức: Lame Music ra mắt", image: "/images/blog-1.jpg" },
  { id: 2, title: "Top 10 bài hát 2025", image: "/images/blog-2.jpg" },
];

// Hàm sửa URL ảnh
const fixImageUrl = (url) => {
  if (!url) return "/images/default-album.png";
  if (url.startsWith("http")) return url;
  const correctedUrl = url.replace("/images", "/media/images");
  return `http://localhost:3000${correctedUrl}`;
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

  // Bài hát
  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      const data = await fetchSongs();

      const songsWithUrls = data.map((song) => {
        if (song.album) song.album.cover_url = fixImageUrl(song.album.cover_url);
        return {
          ...song,
          image_url: song.image_url ? fixImageUrl(song.image_url) : null,
          file_url: `http://localhost:3000${song.file_url.replace(
            "/audio",
            "/media/audio"
          )}`,
        };
      });
      setSongs(songsWithUrls);
      setLoading(false);
    };
    loadSongs();
  }, []);

  // Nghệ sĩ
  useEffect(() => {
    const loadArtists = async () => {
      setLoadingArtists(true);
      const data = await fetchFeaturedArtists();

      const artistsWithUrls = data.map((artist) => {
        let finalUrl = "/images/default-artist.png";
        if (artist.avatar_url) {
          let url = artist.avatar_url;
          if (url.startsWith("/images/")) url = url.replace("/images", "/media/images");
          finalUrl = `http://localhost:3000${url}`;
        }
        return { ...artist, avatar_url: finalUrl };
      });
      setArtists(artistsWithUrls);
      setLoadingArtists(false);
    };
    loadArtists();
  }, []);

  // Thể loại
  useEffect(() => {
    const loadGenres = async () => {
      setLoadingGenres(true);
      const data = await fetchCategories();
      const genresWithUrls = data.map((genre) => ({
        ...genre,
        image_url: fixImageUrl(genre.image_url),
      }));
      setGenres(genresWithUrls);
      setLoadingGenres(false);
    };
    loadGenres();
  }, []);

  return (
    <div className="home-page">
      
      {/* BÀI HÁT */}
      <div className="home-section">
        <div className="home-section-header">
          <h3>Bài hát hàng đầu</h3>
          <a onClick={() => navigate('/songs')} className="see-more-link">Xem thêm</a>
        </div>
        {loading ? (
          <p className="loading-message">Đang tải...</p>
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
                    src={song.image_url || song.album?.cover_url}
                    alt={song.title}
                    className="track-image"
                  />
                  <button
                    className="play-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(song);
                    }}
                  >
                    <FaPlay />
                  </button>
                </div>
                <p className="track-title">{song.title}</p>
                <p className="track-artist">
                  {song.artist?.stage_name || "Nghệ sĩ"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NGHỆ SĨ */}
      <div className="home-section">
        <div className="home-section-header">
          <h3>Nghệ sĩ nổi bật</h3>
          <a onClick={() => navigate('/artists')} className="see-more-link">Xem thêm</a>
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
                <img src={artist.avatar_url} alt={artist.stage_name} />
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
            {genres.slice(0, 6).map((genre) => (
              <div
                key={genre.id}
                className="genre-card"
                onClick={() => navigate(`/genre/${genre.slug}`)}
              >
                <img src={genre.image_url} alt={genre.name} className="genre-image" />
                <div className="genre-overlay">
                  <p>{genre.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TIN HOT */}
      <div className="home-section">
        <div className="home-section-header">
          <h3>Tin hot</h3>
          <a href="/blog" className="see-more-link">
            Xem thêm
          </a>
        </div>
        <div className="horizontal-scroll">
          {mockPosts.map((post) => (
            <div key={post.id} className="post-card">
              <img src={post.image} alt={post.title} />
              <p>{post.title}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
