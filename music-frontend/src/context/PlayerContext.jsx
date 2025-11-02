// music-frontend/src/context/PlayerContext.jsx
import React, { createContext, useState, useContext, useCallback, useRef } from 'react'; // <-- CHẮC CHẮN CÓ useCallback, useRef

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null); // <-- REF ĐƯỢC TẠO VÀ CHIA SẺ

  // Hàm này ổn định (useCallback) để tránh vòng lặp vô tận
  const playTrack = useCallback((track) => {
    setCurrentTrack(currentTrack => {
        if (currentTrack?.id !== track.id) {
            return track;
        }
        return currentTrack;
    });
    setIsPlaying(true);
  }, []); 

  const contextValue = {
    currentTrack,
    isPlaying,
    playTrack,
    setIsPlaying,
    audioRef, // <-- CHIA SẺ REF
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