// music-frontend/src/pages/SongDetail.jsx (BẢN FINAL VỚI REPLAY & FIX LỖI)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePlayer } from '../context/PlayerContext';
import './SongDetail.css'; 
import { FaPlay, FaHeart, FaPause, FaEllipsisV, FaRedo } from 'react-icons/fa'; 
import { useAuth } from '../context/AuthContext'; 

const SongDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  // LẤY audioRef TỪ CONTEXT
  const { playTrack, currentTrack, isPlaying, setIsPlaying, audioRef } = usePlayer(); 
  const { isAuthenticated } = useAuth(); 
  
  const [song, setSong] = useState(null);
  const [lyrics, setLyrics] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [loadingLyrics, setLoadingLyrics] = useState(true); 
  const [isLiked, setIsLiked] = useState(false); 
  const [error, setError] = useState(''); // State giữ lỗi API

  // === useEffect 1: Tải Data (Tách ra để tránh lặp) ===
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setLoadingLyrics(true);
      setError(''); 
      try {
        // Tải Song và Lyrics cùng lúc
        const [songRes, lyricsRes] = await Promise.all([
          axios.get(`http://localhost:3000/song/${id}`),
          axios.get(`http://localhost:3000/song/${id}/lyrics`).catch(err => null) // Bắt lỗi nếu ko có lời
        ]);
        
        if (songRes.data) {
            setSong(songRes.data); 
        } else {
            throw new Error('Không tìm thấy bài hát');
        }
        
        if (lyricsRes && lyricsRes.data.lyrics) {
          setLyrics(lyricsRes.data.lyrics);
        } else {
          setLyrics('Không tìm thấy lời bài hát.');
        }
        
      } catch (err) {
        // Xử lý lỗi 404 (Không tìm thấy)
        console.error("Lỗi tải chi tiết bài hát:", err);
        setError('Không thể tìm thấy bài hát bạn yêu cầu.'); 
      } finally {
        setLoading(false);
        setLoadingLyrics(false);
      }
    };
    loadData();
  }, [id]); // Chạy lại khi ID thay đổi

  // === useEffect 2: Kích hoạt Phát nhạc (Khi 'song' được tải) ===
  useEffect(() => {
    // Chỉ phát nếu bài hát tải thành công VÀ nó không phải là bài đang phát
    if (song && (!currentTrack || currentTrack.id !== song.id)) {
      playTrack(song);
    }
  }, [song, playTrack, currentTrack]); 

  
  // Logic nút Play/Pause "thông minh"
  const isThisSongPlaying = currentTrack?.id === song?.id && isPlaying;

  const handlePlayPause = () => {
    if (isThisSongPlaying) {
      setIsPlaying(false);
    } else {
      playTrack(song);
    }
  };

  // === XỬ LÝ NÚT PHÁT LẠI (REPLAY) ===
  const handleReplay = () => {
    if (audioRef.current && audioRef.current.audio.current) {
      audioRef.current.audio.current.currentTime = 0; // <-- Tua về 0
      if (!isPlaying) {
        playTrack(song); // Bật nhạc nếu đang tạm dừng
      }
    }
  };
  
  const handleLike = () => { /* ... (logic like) ... */ };

  
  if (loading) {
    return <div className="song-detail-loading">Đang tải chi tiết bài hát...</div>;
  }
  
  // NẾU CÓ LỖI (API 404)
  if (error) {
    return <div className="song-detail-error">{error}</div>;
  }
  
  if (!song) {
      return null;
  }
  
  return (
    <div className="song-detail-container">
      {/* Nền Gradient */}
      <div className="song-detail-gradient-bg" style={{ background: 'var(--color-surface)' }}></div>

      <div className="song-detail-header">
        <img src={song.album?.cover_url || '/images/default-album.png'} alt={song.title} className="detail-album-cover" />
        
        <div className="song-info">
          <p className="song-type">BÀI HÁT</p>
          <h1>{song.title}</h1>
          <p className="song-artist-info">
            <span className="artist-name">{song.artist?.stage_name}</span> • 
            <span>{song.album?.title}</span> • 
            <span>{song.play_count} lượt nghe</span>
          </p>

          <div className="detail-controls">
        
            {/* NÚT PHÁT LẠI */}
            <button className="detail-play-button" onClick={handleReplay}>
               <FaRedo size={20} /> PHÁT LẠI
            </button>
            
            {/* Nút Like */}
            <button 
              className={`icon-button ${isLiked ? 'liked' : ''}`} 
              onClick={handleLike}
            >
              <FaHeart size={20} />
            </button> 
            <button className="icon-button"><FaEllipsisV size={20} /></button>
          </div>
        </div>
      </div>
      
      {/* Body (Lyrics, Related) */}
      <div className="song-detail-body">
        <div className="lyrics-section">
            <h3>Lời bài hát</h3>
            {loadingLyrics ? (
                <p className="lyrics-content">Đang tải lời...</p>
            ) : (
                <p className="lyrics-content">{lyrics}</p>
            )}
        </div>
        
        <div className="related-section">
            <h3>Ca khúc cùng thể loại</h3>
            <p className="subtle-text">(Coming soon...)</p>
        </div>
      </div>
    </div>
  );
};

export default SongDetail;