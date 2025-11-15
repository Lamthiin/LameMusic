// music-frontend/src/context/PlayerContext.jsx (BẢN SỬA LỖI CUỐI CÙNG - FIX PLAYBACK)
import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import { incrementPlayCountApi, logPlaybackApi } from '../utils/api'; 

const PlayerContext = createContext(null);

const getAudioElement = (ref) => {
    return ref.current?.audio?.current; 
};

// Hàm Helper fix URL nhạc
const fixAudioUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `http://localhost:3000${url}`;
};

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState([]); 
    
    const audioRef = useRef(null); 
    const hasLoggedRef = useRef(false); 

    // 1. HÀM XỬ LÝ LƯỢT NGHE VÀ LOG HISTORY
    const handleTimeUpdate = useCallback(() => {
        const audio = getAudioElement(audioRef);
        if (!audio || !currentTrack) return;

        if (audio.currentTime >= 2 && !hasLoggedRef.current) {
            incrementPlayCountApi(currentTrack.id);
            logPlaybackApi(currentTrack.id, Math.floor(audio.currentTime)); 
            hasLoggedRef.current = true;
            // Dùng audio.removeEventListener trực tiếp
            audio.removeEventListener('timeupdate', handleTimeUpdate); 
        }
    }, [currentTrack]);
    
    // Khai báo các hàm Next/Prev (Dùng Ref để tránh lỗi ReferenceError)
    const playNextRef = useRef(() => {});
    const playPreviousRef = useRef(() => {});
    const getNextTrack = useCallback(() => { /* ... */ return currentPlaylist[0]; }, [currentTrack, currentPlaylist]); 

    // 2. HÀM CHÍNH playTrack VÀ TOGGLEPLAY
    const playTrack = useCallback((track, playlist = null, startIndex = 0) => {
        const audio = getAudioElement(audioRef);
        const urlToPlay = fixAudioUrl(track.file_url); // FIX URL TRƯỚC KHI SO SÁNH

        if (urlToPlay !== currentTrack?.file_url || playlist) { // So sánh URL đã fix
            // Trường hợp 1: Bài hát mới (Chỉ cập nhật state)
            setCurrentTrack(track);
            if (playlist) {
                setCurrentPlaylist(playlist);
            }
            setIsPlaying(true); // Đặt state là Play
        } else if (audio) {
            // Trường hợp 2: Bài hát cũ (Toggle Audio Element)
            audio.paused ? audio.play() : audio.pause();
            // KHÔNG GỌI setIsPlaying: Dùng listener ở useEffect
        }
    }, [currentTrack, currentPlaylist]); 

    const togglePlay = useCallback(() => {
        const audio = getAudioElement(audioRef);
        if (audio && currentTrack) {
            // Toggle Audio Element
            audio.paused ? audio.play() : audio.pause();
            // KHÔNG GỌI setIsPlaying: Dùng listener ở useEffect
        }
    }, [currentTrack]);


    // 3. HÀM NEXT/PREVIOUS LOGIC (Logic giữ nguyên)
    playNextRef.current = useCallback(() => {
        const nextTrack = getNextTrack();
        if (nextTrack) {
            playTrack(nextTrack); 
        }
    }, [playTrack, getNextTrack]); 
    
    playPreviousRef.current = useCallback(() => {
        const currentActivePlaylist = currentPlaylist;
        if (!currentTrack || currentActivePlaylist.length === 0) return;
        const currentIndex = currentActivePlaylist.findIndex(t => t.id === currentTrack.id);
        const previousIndex = (currentIndex - 1 + currentActivePlaylist.length) % currentActivePlaylist.length;

        if (currentActivePlaylist[previousIndex]) {
            playTrack(currentActivePlaylist[previousIndex]);
        }
    }, [playTrack, currentTrack, currentPlaylist]);


    // === 4. HOOK CHÍNH ĐIỀU KHIỂN AUDIO ELEMENT (FIX ABORTERROR) ===
    useEffect(() => {
        const audio = getAudioElement(audioRef);
        
        if (audio) {
            // --- GẮN LISTENERS SỰ KIỆN GỐC (FIX XUNG ĐỘT) ---
            const onTimeUpdate = handleTimeUpdate;
            const onEnded = playNextRef.current; 
            const handleNativePlay = () => setIsPlaying(true); // Cập nhật state từ Audio Element
            const handleNativePause = () => setIsPlaying(false); // Cập nhật state từ Audio Element

            // Loại bỏ listeners cũ
            audio.removeEventListener('play', handleNativePlay);
            audio.removeEventListener('pause', handleNativePause);
            audio.removeEventListener('timeupdate', onTimeUpdate); 
            audio.removeEventListener('ended', onEnded);
            
            // Gắn listeners mới
            audio.addEventListener('play', handleNativePlay);
            audio.addEventListener('pause', handleNativePause);
            audio.addEventListener('timeupdate', onTimeUpdate); 
            audio.addEventListener('ended', onEnded); 
            
            if (currentTrack?.file_url) {
                
                // CHỈ LOAD KHI SRC THAY ĐỔI
                const fullUrl = fixAudioUrl(currentTrack.file_url);
                if (audio.src !== fullUrl) { // So sánh URL đã fix
                    audio.src = fullUrl;
                    audio.load(); 
                    hasLoggedRef.current = false; 
                }
                
                // PLAY DỰA TRÊN ISPLAYING
                if (isPlaying) {
                    audio.play().catch(e => {
                        if (e.name !== 'AbortError') {
                            console.warn("Play blocked:", e);
                        }
                    });
                } else {
                    audio.pause();
                }

            } else {
                audio.pause();
            }

            // Dọn dẹp
            return () => {
                audio.removeEventListener('play', handleNativePlay);
                audio.removeEventListener('pause', handleNativePause);
                audio.removeEventListener('timeupdate', onTimeUpdate);
                audio.removeEventListener('ended', onEnded);
            };
        }
    }, [currentTrack, isPlaying, handleTimeUpdate, playNextRef.current]); 
    // =================================================================


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

    return (
        <PlayerContext.Provider value={contextValue}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    return useContext(PlayerContext);
};