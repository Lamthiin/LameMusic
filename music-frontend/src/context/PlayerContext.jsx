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
    // Ref to prevent forwarding to next more than once per track when 'ended' fails
    const hasForwardedRef = useRef(false);
    // Progress watchdog state to detect stalled/no-progress situations
    const progressWatcherRef = useRef({ lastTime: 0, intervalId: null });
    // Ref to hold the current ended handler so we can add/remove it reliably
    const endedHandlerRef = useRef(null); 

    // 1. HÀM XỬ LÝ LƯỢT NGHE VÀ LOG HISTORY
    // NOTE: handler moved below to avoid referencing `playNext` before initialization.

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
        // Add more context in logs to help debug AllSongs issue
        console.debug('[Player] getNextTrack -> playlist ids', currentPlaylist.map(t => t.id).slice(0,10), 'currentIndex', currentIndex);
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
    const playNext = useCallback((reason = 'manual') => {
        console.debug('[Player] playNext invoked', { reason, currentTrackId: currentTrack?.id, playlistLength: currentPlaylist?.length });
        const nextTrack = getNextTrack();
        console.debug('[Player] playNext -> nextTrack', nextTrack?.id);
        if (nextTrack) {
            // Nếu nextTrack là chính track hiện tại (playlist length 1), vẫn truyền playlist để force play
            if (nextTrack.id === currentTrack?.id) {
                console.debug('[Player] playNext -> nextTrack same as current, forcing play', { trackId: nextTrack.id });
            }
            playTrack(nextTrack, currentPlaylist);
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
            // Truyền playlist để đảm bảo điều hướng và phát (không toggle) khi track giống nhau
            playTrack(currentActivePlaylist[previousIndex], currentPlaylist);
        }
    }, [playTrack, currentTrack, currentPlaylist]);



    


    // 1. HÀM XỬ LƯỢT NGHE VÀ LOG HISTORY (đặt ở đây để `playNext` đã được định nghĩa)
    const handleTimeUpdate = useCallback(() => {
        const audio = getAudioElement(audioRef);
        if (!audio || !currentTrack) return;

        // Log play count once after 2s
        if (audio.currentTime >= 2 && !hasLoggedRef.current) {
            incrementPlayCountApi(currentTrack.id);
            logPlaybackApi(currentTrack.id, Math.floor(audio.currentTime)); 
            hasLoggedRef.current = true;
        }

        // Fallback: if we detect we're very near the end and 'ended' didn't fire, move to next track once
        if (!hasForwardedRef.current && audio.duration && isFinite(audio.duration)) {
            const remaining = audio.duration - audio.currentTime;
            if (remaining <= 0.6) { // 600ms tolerance
                console.debug('[Player] near-end fallback triggered', { remaining, currentTime: audio.currentTime, duration: audio.duration, currentTrackId: currentTrack?.id });
                hasForwardedRef.current = true;
                playNext('near-end');
            }
        }
    }, [currentTrack, playNext]);


    // === 4. HOOK CHÍNH ĐIỀU KHIỂN AUDIO ELEMENT (FIX ABORTERROR) ===
    useEffect(() => {
        const audio = getAudioElement(audioRef);
        
        if (audio) {
            // --- GẮN LISTENERS SỰ KIỆN GỐC (FIX XUNG ĐỘT) ---
            const onTimeUpdate = handleTimeUpdate;
            const handleNativePlay = () => setIsPlaying(true); // Cập nhật state từ Audio Element
            const handleNativePause = () => setIsPlaying(false); // Cập nhật state từ Audio Element

            // Loại bỏ listeners cũ
            audio.removeEventListener('play', handleNativePlay);
            audio.removeEventListener('pause', handleNativePause);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            if (endedHandlerRef.current) {
                audio.removeEventListener('ended', endedHandlerRef.current);
            }

            // Tạo handler ended bền vững dùng ref để luôn gọi playNext mới nhất
            const handleEnded = () => {
                console.debug('[Player] native ended event', { currentTime: audio.currentTime, duration: audio.duration, audioEnded: audio.ended, currentTrackId: currentTrack?.id, playlistLength: currentPlaylist?.length });
                playNext('ended');
                // Đảm bảo play bài mới (đôi khi cần reset time và gọi play sau render)
                setTimeout(() => {
                    const nextAudio = getAudioElement(audioRef);
                    if (!nextAudio) return;
                    // Nếu vẫn ở trạng thái ended, reset time
                    if (nextAudio.ended || (nextAudio.duration && nextAudio.currentTime >= nextAudio.duration)) {
                        try {
                            nextAudio.currentTime = 0;
                        } catch (e) {
                            // Some browsers disallow setting currentTime in certain states
                        }
                    }
                    if (nextAudio.paused) {
                        nextAudio.play().catch(e => {
                            if (e.name !== 'AbortError') {
                                console.warn('Play after ended blocked:', e);
                            }
                        });
                    }
                }, 50);
            };

            // Error / stalled handlers - nếu file gặp lỗi hoặc stall, thử next
            const handleError = (e) => {
                console.debug('[Player] audio error event', e, { currentTrackId: currentTrack?.id });
                playNext('error');
            };
            const handleStalled = () => {
                console.debug('[Player] audio stalled event', { currentTime: audio.currentTime, currentTrackId: currentTrack?.id });
                playNext('stalled');
            };

            // Gắn listeners mới
            audio.addEventListener('play', handleNativePlay);
            audio.addEventListener('pause', handleNativePause);
            audio.addEventListener('timeupdate', onTimeUpdate); 
            audio.addEventListener('ended', handleEnded);
            audio.addEventListener('error', handleError);
            audio.addEventListener('stalled', handleStalled);
            endedHandlerRef.current = handleEnded; 
            
            // Setup a watchdog interval to detect stalled/no-progress audio
            if (progressWatcherRef.current.intervalId) {
                clearInterval(progressWatcherRef.current.intervalId);
                progressWatcherRef.current.intervalId = null;
            }
            progressWatcherRef.current.lastTime = audio.currentTime || 0;
            const watchdog = setInterval(() => {
                const a = getAudioElement(audioRef);
                if (!a) return;
                const last = progressWatcherRef.current.lastTime || 0;
                const now = a.currentTime || 0;
                // If audio is supposed to be playing but time does not advance, consider it stalled
                if (!a.paused && !a.ended && a.duration && isFinite(a.duration)) {
                    // If no meaningful progress for 2 checks (~4s), attempt next
                    if (now <= last + 0.01) {
                        console.debug('[Player] no-progress watchdog fired', { last, now, currentTrackId: currentTrack?.id });
                        playNext('no-progress');
                    } else {
                        progressWatcherRef.current.lastTime = now;
                    }
                } else {
                    progressWatcherRef.current.lastTime = now;
                }
            }, 2000);
            progressWatcherRef.current.intervalId = watchdog;
            
            if (currentTrack?.file_url) {
                
                // CHỈ LOAD KHI SRC THAY ĐỔI
                const fullUrl = fixAudioUrl(currentTrack.file_url);
                if (audio.src !== fullUrl) { // So sánh URL đã fix
                    audio.src = fullUrl;
                    audio.load(); 
                    hasLoggedRef.current = false; 
                    hasForwardedRef.current = false;
                    progressWatcherRef.current.lastTime = 0;
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
                if (endedHandlerRef.current) {
                    audio.removeEventListener('ended', endedHandlerRef.current);
                }
                audio.removeEventListener('error', handleError);
                audio.removeEventListener('stalled', handleStalled);
                if (progressWatcherRef.current.intervalId) {
                    clearInterval(progressWatcherRef.current.intervalId);
                    progressWatcherRef.current.intervalId = null;
                }
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