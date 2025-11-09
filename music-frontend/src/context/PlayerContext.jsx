// music-frontend/src/context/PlayerContext.jsx (BẢN SỬA LỖI AUTO-QUEUE FINAL)
import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import { incrementPlayCountApi, logPlaybackApi, getRecommendedSongApi } from '../utils/api'; // <-- ĐÃ CÓ API ĐỀ XUẤT

const PlayerContext = createContext(null);

const getAudioElement = (ref) => ref.current?.audio?.current;

// Helper fix URL nhạc (BẮT BUỘC)
const fixAudioUrl = (url) => {
  if (!url) return '';
  // Giả định: nếu không có http, thêm host
  return url.startsWith('http') ? url : `http://localhost:3000${url}`;
};

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);

  const audioRef = useRef(null);
  const hasLoggedMapRef = useRef(new Map());


  // ----------------- Log lượt nghe -----------------
  const handleTimeUpdate = useCallback(() => {
    const audio = getAudioElement(audioRef);
    if (!audio || !currentTrack) return;
    const songId = currentTrack.id;

    if (audio.currentTime >= 2 && !hasLoggedMapRef.current.get(songId)) {
      incrementPlayCountApi(songId);
      logPlaybackApi(songId, Math.floor(audio.currentTime));
      hasLoggedMapRef.current.set(songId, true);
      console.log(`[Play Count] Logged playback for Song ID: ${currentTrack.id} (2s rule)`);
    }
  }, [currentTrack]);


  // ----------------- Khai báo Ref -----------------
  const playNextRef = useRef(() => {});
  const playPreviousRef = useRef(() => {});


  // ----------------- playTrack / togglePlay -----------------
  const playTrack = useCallback((track, playlist = null, startIndex = 0) => {
    if (!track) return;
    const fixedTrack = { ...track, file_url: fixAudioUrl(track.file_url) };

    if (fixedTrack.id !== currentTrack?.id || playlist) {
      setCurrentTrack(fixedTrack);
      // Nếu có playlist mới được truyền, cập nhật toàn bộ playlist
      if (playlist) {
        const fixedPlaylist = playlist.map(t => ({ ...t, file_url: fixAudioUrl(t.file_url) }));
        setCurrentPlaylist(fixedPlaylist);
      }
      setIsPlaying(true);
    } else {
      const audio = getAudioElement(audioRef);
      if (audio) {
        audio.paused ? audio.play() : audio.pause();
        setIsPlaying(!audio.paused);
      }
    }
  }, [currentTrack]); // Bỏ currentPlaylist khỏi dependencies để tránh lỗi lặp


  const togglePlay = useCallback(() => {
    const audio = getAudioElement(audioRef);
    if (audio && currentTrack) {
      audio.paused ? audio.play() : audio.pause();
      setIsPlaying(!audio.paused);
    }
  }, [currentTrack]);


  // ----------------- Logic Chuyển bài (Auto-Queue) -----------------
  playNextRef.current = useCallback(async () => { // <-- THÊM ASYNC
    const currentIndex = currentPlaylist.findIndex(t => t.id === currentTrack?.id);
    
    // 1. Trường hợp có bài tiếp theo trong playlist
    if (currentIndex !== -1 && currentIndex < currentPlaylist.length - 1) {
      const nextTrack = currentPlaylist[currentIndex + 1];
      playTrack(nextTrack);
      return;
    }

    // 2. Trường hợp đã hết Playlist -> Gọi AI Đề xuất (Auto-Queue)
    console.log("[Auto-Queue] Hết playlist. Đang tìm kiếm bài hát đề xuất AI...");
    try {
        const recommendedSong = await getRecommendedSongApi();
        
        if (recommendedSong?.id) {
            // Cập nhật Playlist bằng cách thêm bài hát đề xuất vào
            const fixedRecSong = { ...recommendedSong, file_url: fixAudioUrl(recommendedSong.file_url) };
            
            // Tùy chọn: Thay thế toàn bộ playlist bằng bài đề xuất để làm radio mode
            setCurrentPlaylist([fixedRecSong]); 
            
            playTrack(fixedRecSong); // Phát bài đề xuất
        } else {
            setIsPlaying(false);
        }
    } catch (err) {
        console.error("Lỗi Auto-Queue:", err.message);
        setIsPlaying(false);
    }
  }, [currentTrack, currentPlaylist, playTrack]); // Đảm bảo dependencies đúng

    playPreviousRef.current = useCallback(() => {
        // Logic chuyển bài ngược (chỉ chuyển bài cũ, không gọi đề xuất)
        const currentIndex = currentPlaylist.findIndex(t => t.id === currentTrack?.id);
        if (currentIndex > 0) {
            const previousIndex = currentIndex - 1;
            playTrack(currentPlaylist[previousIndex]);
        }
    }, [currentTrack, currentPlaylist, playTrack]);


  // ----------------- Gắn listener (Giữ nguyên) -----------------
  useEffect(() => {
    const audio = getAudioElement(audioRef);
    if (!audio) return;

    // ... (gắn listeners handleTimeUpdate và playNextRef.current) ...
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', playNextRef.current);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', playNextRef.current);
    };
  }, [handleTimeUpdate, playNextRef.current]);


  const contextValue = {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    audioRef,
    currentPlaylist,
    playNext: playNextRef.current,
    playPrevious: playPreviousRef.current,
  };

  return <PlayerContext.Provider value={contextValue}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => useContext(PlayerContext);