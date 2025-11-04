// music-frontend/src/pages/ArtistDetail.jsx (BẢN SỬA LỖI FINAL)
import React, { useEffect, useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
// (1) IMPORT API (ĐẢM BẢO FILE API.JS CỦA BẠN CÓ 3 HÀM NÀY)
import { api, checkFollowStatusApi, toggleFollowApi } from '../utils/api'; 
import './ArtistDetail.css'; 
import { FaPlay, FaHeart } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext'; 
import { useAuth } from '../context/AuthContext'; 

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const { isAuthenticated } = useAuth(); 
  
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false); 

  const calculateAge = (birthYear) => {
    if (!birthYear) return 'Không rõ';
    const year = parseInt(birthYear);
    if (isNaN(year)) return 'Không rõ';
    return new Date().getFullYear() - year;
  };

  // (Hàm helper fix URL - Rất quan trọng)
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

  // === (1) useEffect Tải Data (Luôn luôn chạy) ===
  useEffect(() => {
    const loadArtist = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/artists/${id}`);
        const artistData = response.data;

        // (Fix URL cho tất cả ảnh/nhạc)
        artistData.avatar_url = fixUrl(artistData.avatar_url, 'artist');
        if (artistData.albums) {
            artistData.albums = artistData.albums.map(album => ({
                ...album,
                cover_url: fixUrl(album.cover_url, 'image')
            }));
        }
        if (artistData.songs) {
            artistData.songs = artistData.songs.map(song => {
                const songImageUrl = song.image_url ? fixUrl(song.image_url, 'image') : null;
                if (song.album) {
                    song.album.cover_url = fixUrl(song.album.cover_url, 'image');
                }
                return {
                    ...song,
                    file_url: fixUrl(song.file_url, 'audio'), 
                    image_url: songImageUrl 
                };
            });
        }
        setArtist(artistData);
      } catch (err) {
        setError('Không tìm thấy nghệ sĩ này.');
      } finally {
        setLoading(false);
      }
    };
    loadArtist();
  }, [id]); // Chỉ phụ thuộc vào 'id'

  // === (2) useEffect KIỂM TRA FOLLOW (ĐÃ SỬA LỖI HOOK) ===
  useEffect(() => {
      // (3) ĐƯA LOGIC 'IF' VÀO BÊN TRONG HOOK
      // Chỉ kiểm tra nếu đã đăng nhập VÀ đã tải xong nghệ sĩ
      if (isAuthenticated && artist) {
          const checkStatus = async () => {
              // 'artist.id' ở đây là ID của nghệ sĩ, không phải ID của user
              const res = await checkFollowStatusApi(artist.id); 
              setIsFollowing(res.isFollowing);
          };
          checkStatus();
      } else {
          setIsFollowing(false); 
      }
  }, [isAuthenticated, artist]); // Phụ thuộc vào 'isAuthenticated' và 'artist'


  const playArtistSongs = () => {
    if (songs.length > 0) { 
      playTrack(songs[0], songs, 0); 
    }
  };
  const goToSongDetail = (songId) => {
      navigate(`/song/${songId}`);
  };

  // (Hàm xử lý nhấn nút Follow)
  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
        navigate('/login');
        return;
    }
    setFollowLoading(true); 
    try {
        const response = await toggleFollowApi(artist.id);
        setIsFollowing(response.isFollowing); 
    } catch (error) {
        alert(error.response?.data?.message || 'Đã xảy ra lỗi');
    }
    setFollowLoading(false); 
  };

  if (loading) {
    return <div className="artist-detail-loading">Đang tải thông tin nghệ sĩ...</div>;
  }
  
  if (error || !artist) {
    return <div className="artist-detail-error">{error || 'Nghệ sĩ không tồn tại.'}</div>;
  }
  
  const songs = artist?.songs || []; 
  const albums = artist?.albums || []; 

  return (
    <div className="artist-detail-container">
      
      {/* HEADER NGHỆ SĨ */}
      <div className="artist-header">
        <img src={artist.avatar_url} alt={artist.stage_name} className="artist-avatar-large" />
        <div className="artist-info">
          <p className="artist-type">NGHỆ SĨ</p>
          <h1>{artist.stage_name}</h1>
          <p className="artist-stats">
            Tuổi: <strong>{calculateAge(artist.user?.birth_year)}</strong> • 
            Bài hát: <strong>{songs.length}</strong> • 
            Album: <strong>{albums.length}</strong>
          </p>
          <p className="artist-bio">{artist.bio || 'Chưa có thông tin giới thiệu.'}</p>

          <div className="artist-controls">
            <button className="artist-play-button" onClick={playArtistSongs}>
              <FaPlay size={20} /> PHÁT TẤT CẢ
            </button>
            
            {/* === SỬA NÚT FOLLOW === */}
            <button 
                className={`icon-button follow-button ${isFollowing ? 'active' : ''}`}
                onClick={handleToggleFollow}
                disabled={followLoading}
            >
              <FaHeart size={18} /> 
              {followLoading ? '...' : (isFollowing ? 'ĐANG THEO DÕI' : 'THEO DÕI')}
            </button>
          </div>
        </div>
    </div>

      {/* DANH SÁCH BÀI HÁT */}
      <div className="artist-body-section">
        <h3>Bài hát nổi bật</h3>
        <div className="song-list-detail">
            {songs.length > 0 ? (
                songs.slice(0, 5).map((song, index) => (
                    <div key={song.id} className="song-row" onClick={() => goToSongDetail(song.id)}>
                        <div className="song-title-col">
                            <span>{index + 1}.</span>
                            <img 
                                src={song.image_url || song.album?.cover_url} 
                                alt={song.title} 
                            />
                            <div>
                                <p className="song-row-title">{song.title}</p>
                                <p className="song-row-artist">{artist.stage_name}</p>
                            </div>
                        </div>
                        {/* (Đã xóa lượt nghe) */}
                    </div>
                ))
            ) : (
                <p className="subtle-text">Nghệ sĩ này chưa có bài hát nào.</p>
            )}
        </div>
      </div>

        {/* === PHẦN DANH SÁCH ALBUM === */}
            <h2 className="section-title">Albums</h2>
            <div className="album-grid"> 
                {artist.albums && artist.albums.map((album) => (
                    // === SỬA DÒNG NÀY ĐỂ THÊM onClick ===
                    <div 
                        key={album.id} 
                        className="album-card"
                        // ===============================================
                        // THÊM SỰ KIỆN onClick VÀO CARD ALBUM
                        onClick={() => navigate(`/album/${album.id}`)} 
                        // ===============================================
                    >
                        <img 
                            src={album.cover_url} 
                            alt={album.title} 
                            className="album-cover" 
                        />
                        <p className="album-title">{album.title}</p>
                        <p className="album-year">{new Date(album.release_date).getFullYear()}</p>
                    </div>
                ))}
        </div>
      
    </div>
  );
};

export default ArtistDetail;