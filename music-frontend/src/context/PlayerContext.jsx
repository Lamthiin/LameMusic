// music-frontend/src/context/PlayerContext.jsx (BẢN SỬA LỖI CUỐI CÙNG - FIX PLAYBACK)
import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import { incrementPlayCountApi, logPlaybackApi, getRecommendedSongApi } from '../utils/api'; 

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

    // SHUFFLE STATE
    const [isShuffling, setIsShuffling] = useState(false);
    const toggleShuffle = useCallback(() => setIsShuffling(s => !s), []);

    // HÀM LẤY BÀI TIẾP THEO
    const getNextTrack = useCallback(() => {
        console.debug('[Player] getNextTrack', { currentTrackId: currentTrack?.id, playlistLength: currentPlaylist?.length, isShuffling });
        if (!currentPlaylist || currentPlaylist.length === 0) return null;
        if (!currentTrack) return currentPlaylist[0];

        if (isShuffling) {
            if (currentPlaylist.length === 1) return currentTrack;
            let idx = Math.floor(Math.random() * currentPlaylist.length);
            // ensure not same track
            if (currentPlaylist[idx].id === currentTrack.id) {
                idx = (idx + 1) % currentPlaylist.length;
            }
            console.debug('[Player] getNextTrack -> shuffle selected idx', idx, 'id', currentPlaylist[idx]?.id);
            return currentPlaylist[idx];
        }

        const currentIndex = currentPlaylist.findIndex(t => t.id === currentTrack.id);
        const nextIndex = (currentIndex + 1) % currentPlaylist.length;
        console.debug('[Player] getNextTrack -> nextIndex', nextIndex, 'id', currentPlaylist[nextIndex]?.id);
        return currentPlaylist[nextIndex];
    }, [currentPlaylist, currentTrack, isShuffling]);

    // 2. HÀM CHÍNH playTrack VÀ TOGGLEPLAY
    const playTrack = useCallback((track, playlist = null, startIndex = 0) => {
        const audio = getAudioElement(audioRef);
        const urlToPlay = fixAudioUrl(track.file_url); // FIX URL TRƯỚC KHI SO SÁNH

        if (urlToPlay !== currentTrack?.file_url || playlist) { // So sánh URL đã fix
            // Trường hợp 1: Bài hát mới (Chỉ cập nhật state)
            console.debug('[Player] playTrack -> set currentTrack', track.id, 'playlistProvided', !!playlist);
            setCurrentTrack(track);
            if (playlist) {
                setCurrentPlaylist(playlist);
            } else {
                // Nếu không truyền playlist mà playlist hiện tại không chứa bài hát, đặt playlist thành [track]
                if (!currentPlaylist || currentPlaylist.length === 0 || !currentPlaylist.find(t => t.id === track.id)) {
                    console.debug('[Player] playTrack -> creating single-item playlist for standalone play');
                    setCurrentPlaylist([track]);
                }
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


    // 3. HÀM NEXT/PREVIOUS LOGIC
    const playNext = useCallback(() => {
        console.debug('[Player] playNext invoked', { currentTrackId: currentTrack?.id, playlistLength: currentPlaylist?.length });
        const nextTrack = getNextTrack();
        console.debug('[Player] playNext -> nextTrack', nextTrack?.id);
        if (nextTrack) {
            playTrack(nextTrack);
        } else {
            console.debug('[Player] playNext -> no next track found');
        }
    }, [playTrack, getNextTrack, currentTrack, currentPlaylist]);

    const playPrevious = useCallback(() => {
        console.debug('[Player] playPrevious invoked', { currentTrackId: currentTrack?.id, playlistLength: currentPlaylist?.length });
        const currentActivePlaylist = currentPlaylist;
        if (!currentTrack || currentActivePlaylist.length === 0) {
            console.debug('[Player] playPrevious -> nothing to do');
            return;
        }
        const currentIndex = currentActivePlaylist.findIndex(t => t.id === currentTrack.id);
        const previousIndex = (currentIndex - 1 + currentActivePlaylist.length) % currentActivePlaylist.length;

        console.debug('[Player] playPrevious -> previousIndex', previousIndex, 'id', currentActivePlaylist[previousIndex]?.id);
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
            const onEnded = playNext; 
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
    }, [currentTrack, isPlaying, handleTimeUpdate, playNext]); 
    // =================================================================


    const isLoggedIn = !!localStorage.getItem('token');

    const contextValue = {
        currentTrack,
        isPlaying,
        playTrack,
        togglePlay,
        audioRef, 
        currentPlaylist, 
        playNext, 
        playPrevious,
        isShuffling,
        toggleShuffle,
        setCurrentTrack,
        setCurrentPlaylist,
        setIsPlaying,
        isLoggedIn,
        getRecommendedSongApi,
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