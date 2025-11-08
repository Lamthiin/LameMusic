// music-frontend/src/pages/SongDetail.jsx (BẢN SỬA LỖI FINAL)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api'; 
import { usePlayer } from '../context/PlayerContext'; 
import './SongDetail.css'; 
import { FaPlay, FaHeart, FaPause, FaEllipsisV, FaRedo } from 'react-icons/fa'; 
import { useAuth } from '../context/AuthContext'; 
import SongOptionsMenu from '../components/SongOptionsMenu'; // <-- (1) IMPORT MENU
import AddToPlaylistModal from '../components/AddToPlaylistModal'; // <-- (2) IMPORT MODAL

// === HÀM HELPER: Sửa lỗi URL (Fix NULL và Thêm Domain) ===
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

const SongDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, setIsPlaying, audioRef } = usePlayer();
  const { isAuthenticated } = useAuth(); 
  
  const [song, setSong] = useState(null);
  const [lyrics, setLyrics] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [loadingLyrics, setLoadingLyrics] = useState(true); 
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState(''); 
  
  // (3) STATE MỚI ĐỂ MỞ/ĐÓNG MENU 3 CHẤM
  const [menuOpen, setMenuOpen] = useState(false);
  // (4) STATE MỚI ĐỂ MỞ MODAL "THÊM VÀO PLAYLIST"
  const [isAddPlaylistModalOpen, setIsAddPlaylistModalOpen] = useState(false);

  // === useEffect 1: Tải Data (Tách ra để tránh lặp) ===
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setLoadingLyrics(true);
      setError(''); 
      try {
        // Tải Song và Lyrics cùng lúc
        const [songRes, lyricsRes] = await Promise.all([
          api.get(`/song/${id}`), 
          api.get(`/song/${id}/lyrics`).catch(err => null) 
        ]);
        
        if (!songRes.data) throw new Error('Không tìm thấy bài hát');

        const songData = songRes.data;

        // ======= 🔧 FIX LINK NHẠC & ẢNH =======
        songData.file_url = fixUrl(songData.file_url, 'audio');
        songData.image_url = songData.image_url ? fixUrl(songData.image_url, 'image') : null;
        if (songData.album) {
            songData.album.cover_url = fixUrl(songData.album.cover_url, 'image');
        }

        setSong(songData);

        // ======= LOAD LIKE STATUS =======
        if (isAuthenticated) {
          const likeStatus = await api.get(`/like/${id}/status`);
          setIsLiked(likeStatus.data.isLiked);
        } else {
          setIsLiked(false);
        }

        // ======= LOAD LYRICS =======
        setLyrics(lyricsRes?.data?.lyrics || 'Không tìm thấy lời bài hát.');
        setLoadingLyrics(false);
        
      } catch (err) {
        console.error("Lỗi tải chi tiết bài hát:", err);
        setError('Không thể tìm thấy bài hát bạn yêu cầu.'); 
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isAuthenticated]); // XÓA navigate và playTrack khỏi dependency

  // Khi vào bài hát mới, tự động phát
  useEffect(() => {
    if (song && (!currentTrack || currentTrack.id !== song.id)) {
      playTrack(song);
    }
  }, [song, playTrack, currentTrack]); 

  const isThisSongPlaying = currentTrack?.id === song?.id && isPlaying;
  const handlePlayPause = () => {
    if (isThisSongPlaying) setIsPlaying(false);
    else playTrack(song);
  };
  const handleReplay = () => {
    if (audioRef.current?.audio?.current) {
      audioRef.current.audio.current.currentTime = 0;
      if (!isPlaying) playTrack(song);
    }
  };

  // LIKE TOGGLE
  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thích bài hát này.');
      navigate('/login');
      return;
    }
    try {
      const response = await api.post(`/like/${song.id}`);
      setIsLiked(response.data.isLiked); 
    } catch (error) {
      console.error("Lỗi khi toggle like:", error);
      if (error.response?.status === 401) {
        alert('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      }
    }
  };

  if (loading || error) {
    return <div className="song-detail-error">{error || 'Đang tải...'}</div>;
  }
  if (!song) return null;
  
  return (
    <div className="song-detail-container">
      <div className="song-detail-gradient-bg" style={{ background: 'var(--color-surface)' }}></div>

      <div className="song-detail-header">
        <img 
          src={song.image_url || song.album?.cover_url} // <-- LOGIC ẢNH ĐÃ FIX
          alt={song.title} 
          className="detail-album-cover" 
        />
        
        <div className="song-info">
          <p className="song-type">BÀI HÁT</p>
          <h1>{song.title}</h1>
          <p className="song-artist-info">
            <span className="artist-name">{song.artist?.stage_name}</span> • 
            <span>{song.album?.title}</span>
            {/* ĐÃ BỎ LƯỢT NGHE (PLAY_COUNT) */}
          </p>

          <div className="detail-controls">
            
            <button className="detail-play-button" onClick={handleReplay}>
               <FaRedo size={20} /> PHÁT LẠI
            </button>
            
            <button 
              className={`icon-button ${isLiked ? 'liked' : ''}`} 
              onClick={handleLike}
            >
              <FaHeart size={20} />
            </button> 

            {/* (5) NÚT 3 CHẤM (THÊM LOGIC VÀ POSITION) */}
            <div style={{ position: 'relative' }}>
              <button 
                className="icon-button" 
                onClick={() => setMenuOpen(!menuOpen)} // Bật/tắt menu
              >
                <FaEllipsisV size={20} />
              </button>

              {/* (6) HIỂN THỊ MENU (NẾU MỞ) */}
              {menuOpen && (
                <SongOptionsMenu 
                  song={song} 
                  closeMenu={() => setMenuOpen(false)} 
                  // (7) Prop mới để mở modal AddToPlaylist
                  onAddToPlaylistClick={() => {
                    setMenuOpen(false); // Đóng menu 3 chấm
                    setIsAddPlaylistModalOpen(true); // Mở modal playlist
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="song-detail-body">
        <div className="lyrics-section">
            <h3>Lời bài hát</h3>
            {loadingLyrics ? (
                <p className="lyrics-content">Đang tải lời...</p>
            ) : (
                <p className="lyrics-content">{lyrics}</p>
            )}
        </div>
      </div>

      {/* (8) THÊM MODAL ADD TO PLAYLIST (NẰM ẨN) */}
      {isAddPlaylistModalOpen && (
        <AddToPlaylistModal 
          songId={song.id} 
          onClose={() => setIsAddPlaylistModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default SongDetail;