// music-frontend/src/context/PlayerContext.jsx
import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import { incrementPlayCountApi, logPlaybackApi, getRecommendedSongApi } from '../utils/api';

const PlayerContext = createContext(null);

const getAudioElement = (ref) => ref.current?.audio?.current;

// Fix URL nhạc
const fixAudioUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `http://localhost:3000${url}`;
};

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);

  const audioRef = useRef(null);
  const hasLoggedMapRef = useRef(new Map());

  // Log play count
  const handleTimeUpdate = useCallback(() => {
    const audio = getAudioElement(audioRef);
    if (!audio || !currentTrack) return;

    const songId = currentTrack.id;

    if (audio.currentTime >= 2 && !hasLoggedMapRef.current.get(songId)) {
      incrementPlayCountApi(songId);
      logPlaybackApi(songId, Math.floor(audio.currentTime));
      hasLoggedMapRef.current.set(songId, true);
      console.log(`[Play Count] Logged playback for Song ID: ${songId}`);
    }
  }, [currentTrack]);

  const playTrack = useCallback((track, playlist = null) => {
    if (!track) return;

    const fixedTrack = { ...track, file_url: fixAudioUrl(track.file_url) };

    if (fixedTrack.id !== currentTrack?.id || playlist) {
      setCurrentTrack(fixedTrack);

      if (playlist) {
        const fixed = playlist.map(t => ({ ...t, file_url: fixAudioUrl(t.file_url) }));
        setCurrentPlaylist(fixed);
      }

      setIsPlaying(true);
    } else {
      const audio = getAudioElement(audioRef);
      if (audio) {
        audio.paused ? audio.play() : audio.pause();
        setIsPlaying(!audio.paused);
      }
    }
  }, [currentTrack]);

  const togglePlay = useCallback(() => {
    const audio = getAudioElement(audioRef);
    if (audio) {
      audio.paused ? audio.play() : audio.pause();
      setIsPlaying(!audio.paused);
    }
  }, []);

  const playNextRef = useRef(() => {});
  const playPreviousRef = useRef(() => {});

  // Auto-Queue
  playNextRef.current = useCallback(async () => {
    const currentIndex = currentPlaylist.findIndex(t => t.id === currentTrack?.id);

    if (currentIndex !== -1 && currentIndex < currentPlaylist.length - 1) {
      playTrack(currentPlaylist[currentIndex + 1]);
      return;
    }

    console.log("[Auto-Queue] Hết playlist. Đang gọi AI...");
    try {
      const recommendedSong = await getRecommendedSongApi();

      if (recommendedSong?.id) {
        const fixedRec = { ...recommendedSong, file_url: fixAudioUrl(recommendedSong.file_url) };
        setCurrentPlaylist([fixedRec]);
        playTrack(fixedRec);
      } else {
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Lỗi Auto-Queue:", err.message);
      setIsPlaying(false);
    }
  }, [currentTrack, currentPlaylist, playTrack]);

  playPreviousRef.current = useCallback(() => {
    const index = currentPlaylist.findIndex(t => t.id === currentTrack?.id);
    if (index > 0) playTrack(currentPlaylist[index - 1]);
  }, [currentTrack, currentPlaylist, playTrack]);

  useEffect(() => {
    const audio = getAudioElement(audioRef);
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', playNextRef.current);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', playNextRef.current);
    };
  }, [handleTimeUpdate, playNextRef.current]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        togglePlay,
        audioRef,
        currentPlaylist,
        playNext: playNextRef.current,
        playPrevious: playPreviousRef.current,

        // expose setter để PlayerBar điều khiển state
        setIsPlaying,
        setCurrentTrack,
        setCurrentPlaylist
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
