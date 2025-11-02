// music-frontend/src/pages/Home.jsx (BẢN SỬA LỖI CHUYỂN HƯỚNG)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- THÊM useNavigate
import { useAuth } from '../context/AuthContext'; 
import { usePlayer } from '../context/PlayerContext'; 
import { fetchSongs, fetchFeaturedArtists } from '../utils/api'; 
import './Home.css'; 
import { FaPlay } from 'react-icons/fa'; 
import Footer from '../components/Footer'; 

// --- Dữ liệu giả (8 Thể loại) ---
const mockPosts = [
  { id: 1, title: 'Tin tức: Lame Music ra mắt', image: '/images/blog-1.jpg' },
  { id: 2, title: 'Top 10 bài hát 2025', image: '/images/blog-2.jpg' },
  { id: 3, title: 'Phỏng vấn Nghệ sĩ A', image: '/images/blog-3.jpg' },
];
const mockArtists = [ /* ... */ ]; // Dữ liệu Artist sẽ được lấy từ API
const mockGenres = [
  { id: 1, name: 'Pop', color: '#8D4B55' },
  { id: 2, name: 'Hip-Hop', color: '#B45A2C' },
  { id: 3, name: 'Indie', color: '#509BF5' },
  { id: 4, name: 'Rock', color: '#E13300' },
  { id: 5, name: 'EDM', color: '#2D46B9' },
  { id: 6, name: 'R&B', color: '#DC148C' },
  { id: 7, name: 'Jazz', color: '#BA5D07' },
  { id: 8, name: 'Acoustic', color: '#777777' }, 
];
// -----------------------------------------

const Home = () => {
  const { user } = useAuth(); 
  const { playTrack } = usePlayer(); 
  const navigate = useNavigate(); // <-- KHAI BÁO useNavigate
  
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);

  // Tải bài hát từ DB
  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      const data = await fetchSongs(); 
      setSongs(data);
      setLoading(false);
    };
    loadSongs();
  }, []); 

  // Tải nghệ sĩ từ DB
  useEffect(() => {
    const loadArtists = async () => {
      setLoadingArtists(true);
      const data = await fetchFeaturedArtists(); 
      setArtists(data);
      setLoadingArtists(false);
    };
    loadArtists();
  }, []); 

  return (
    <div className="home-page">
      
      {/* Lời chào */}
      <h2>
        {user ? `Chào mừng trở lại, ${user.username}!` : "Chào mừng đến với lame 🎵"}
      </h2>
      
      {/* === 1. CONTAINER: KHÁM PHÁ ÂM NHẠC (BÀI HÁT) === */}
      <div className="home-section">
        <div className="home-section-header">
           <h3>Bài hát hàng đầu</h3>
           <a href="/songs" className="see-more-link">Xem thêm</a>
        </div>
        {loading ? (
          <p className="loading-message">Đang tải...</p>
        ) : (
          <div className="track-list">
            {songs.length > 0 ? (
              songs.map((song) => (
                <div
                  key={song.id}
                  className="track-item"
                  // SỬA LỖI CHUYỂN HƯỚNG: Click vào thẻ cha là chuyển trang
                  onClick={() => navigate(`/song/${song.id}`)} 
                >
                  <div className="track-image-container">
                    <img 
                      src={song.album?.cover_url || '/images/default-album.png'} 
                      alt={song.title} 
                      className="track-image" 
                    />
                    {/* NÚT PLAY: Chỉ phát nhạc, ngăn chuyển trang của thẻ cha */}
                    <button 
                        className="play-button"
                        onClick={(e) => { 
                            e.stopPropagation(); // <-- QUAN TRỌNG: Ngăn navigate chạy
                            playTrack(song); 
                        }}
                    >
                      <FaPlay />
                    </button>
                  </div>
                  <p className="track-title">{song.title}</p>
                  <p className="track-artist">{song.artist?.stage_name || 'Nghệ sĩ'}</p>
                </div>
              ))
            ) : (
              <p className="home-subtitle">Không tìm thấy bài hát nào.</p>
            )}
          </div>
        )}
      </div>

      {/* === 2. CONTAINER: NGHỆ SĨ NỔI BẬT === */}
      <div className="home-section">
        <div className="home-section-header">
           <h3>Nghệ sĩ Nổi bật</h3>
           <a href="/artists" className="see-more-link">Xem thêm</a>
        </div>
        {loadingArtists ? ( 
           <p className="loading-message">Đang tải nghệ sĩ...</p>
        ) : (
          <div className="horizontal-scroll">
            {artists.length > 0 ? ( 
                artists.map(artist => (
                <div 
                    key={artist.id} 
                    className="artist-card"
                    // === DÒNG NÀY PHẢI ĐÚNG ===
                    onClick={() => navigate(`/artist/${artist.id}`)} 
                    // =========================
                >
                  <img src={artist.avatar_url || '/images/default-artist.png'} alt={artist.stage_name} />
                  <p>{artist.stage_name}</p>
                </div>
              ))
            ) : (
                <p className="home-subtitle">Không tìm thấy nghệ sĩ nào.</p>
            )}
          </div>
        )}
      </div>

      {/* === 3. CONTAINER: THỂ LOẠI === */}
      <div className="home-section">
        <div className="home-section-header">
          <h3>Thể loại</h3>
        </div>
        <div className="genres-grid">
          {mockGenres.map(genre => (
            <div 
                key={genre.id} 
                className="genre-card" 
                style={{ backgroundColor: genre.color }}
            >
              <p>{genre.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* === 4. CONTAINER: TIN HOT (BLOG) === */}
      <div className="home-section">
         <div className="home-section-header">
           <h3>Tin hot</h3>
           <a href="/blog" className="see-more-link">Xem thêm</a>
        </div>
        <div className="horizontal-scroll">
          {mockPosts.map(post => (
            <div key={post.id} className="post-card">
              <img src={post.image} alt={post.title} />
              <p>{post.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* === 5. FOOTER === */}
      <Footer />

    </div>
  );
};

export default Home;  