// music-frontend/src/pages/ArtistDetail.jsx (FULL CODE - HIỂN THỊ CHI TIẾT)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ArtistDetail.css'; // <-- CSS RẤT QUAN TRỌNG
import { FaPlay, FaHeart } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext'; 

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hàm tính tuổi an toàn
  const calculateAge = (birthYear) => {
    if (!birthYear) return 'Không rõ';
    const year = parseInt(birthYear);
    if (isNaN(year)) return 'Không rõ';
    return new Date().getFullYear() - year;
  };

  useEffect(() => {
    const loadArtist = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`http://localhost:3000/artists/${id}`);
        setArtist(response.data);
      } catch (err) {
        console.error("Lỗi tải chi tiết nghệ sĩ:", err);
        setError('Không tìm thấy nghệ sĩ này.');
      } finally {
        setLoading(false);
      }
    };
    loadArtist();
  }, [id, navigate]);

  // Nút Play tất cả bài hát
  const playArtistSongs = () => {
    if (artist.songs && artist.songs.length > 0) {
      playTrack(artist.songs[0]); // Phát bài đầu tiên trong danh sách
    }
  };

  // Nút chuyển sang trang chi tiết bài hát
  const goToSongDetail = (songId) => {
      navigate(`/song/${songId}`);
  };


  if (loading) {
    return <div className="artist-detail-loading">Đang tải thông tin nghệ sĩ...</div>;
  }
  
  if (error || !artist) {
    return <div className="artist-detail-error">{error || 'Nghệ sĩ không tồn tại.'}</div>;
  }
  
  // Lấy dữ liệu cần thiết
  const songs = artist.songs || [];
  const albums = artist.albums || [];

  return (
    <div className="artist-detail-container">
      
      {/* HEADER NGHỆ SĨ */}
      <div className="artist-header">
        <img src={artist.avatar_url || '/images/default-artist.png'} alt={artist.stage_name} className="artist-avatar-large" />
        <div className="artist-info">
          <p className="artist-type">NGHỆ SĨ</p>
          <h1>{artist.stage_name}</h1>
          {/* Lấy birth_year từ User Entity */}
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
            <button className="icon-button follow-button"><FaHeart size={18} /> THEO DÕI</button>
          </div>
        </div>
      </div>

      {/* DANH SÁCH BÀI HÁT */}
      <div className="artist-body-section">
        <h3>Bài hát nổi bật</h3>
        <div className="song-list-detail">
            {songs.slice(0, 5).map((song, index) => (
                <div key={song.id} className="song-row" onClick={() => goToSongDetail(song.id)}>
                    <div className="song-title-col">
                        <span>{index + 1}.</span>
                        <img src={song.album?.cover_url || '/images/default-album.png'} alt={song.title} />
                        <div>
                            <p className="song-row-title">{song.title}</p>
                            <p className="song-row-artist">{artist.stage_name}</p>
                        </div>
                    </div>
                    <span className="song-play-count">{song.play_count.toLocaleString()}</span>
                </div>
            ))}
            {songs.length === 0 && <p className="subtle-text">Nghệ sĩ này chưa có bài hát nào.</p>}
        </div>
      </div>

      {/* DANH SÁCH ALBUM */}
      <div className="artist-body-section">
        <h3>Album</h3>
        <div className="album-list-scroll">
            {albums.map(album => (
                <div key={album.id} className="album-card-small">
                    <img src={album.cover_url || '/images/default-album.png'} alt={album.title} />
                    <p className="album-title-small">{album.title}</p>
                    <p className="album-year-small">{new Date(album.release_date).getFullYear()}</p>
                </div>
            ))}
            {albums.length === 0 && <p className="subtle-text">Nghệ sĩ này chưa có album nào.</p>}
        </div>
      </div>
      
    </div>
  );
};

export default ArtistDetail;