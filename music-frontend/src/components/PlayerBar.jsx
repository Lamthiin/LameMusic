// music-frontend/src/components/PlayerBar.jsx
import React, { useEffect } from 'react'; 
import { usePlayer } from '../context/PlayerContext';
import AudioPlayer from 'react-h5-audio-player'; 
import 'react-h5-audio-player/lib/styles.css'; 
import './PlayerBar.css'; 

import { 
  IoPlaySkipBackSharp, 
  IoPlaySkipForwardSharp, 
  IoPlaySharp, 
  IoPauseSharp 
} from 'react-icons/io5';
import { HiVolumeUp } from 'react-icons/hi';

const PlayerBar = () => {
  // LẤY audioRef TỪ CONTEXT
  const { currentTrack, isPlaying, setIsPlaying, audioRef } = usePlayer(); 

  // LOGIC ĐIỀU KHIỂN PLAYER TỪ CONTEXT
  useEffect(() => {
    if (audioRef.current && audioRef.current.audio.current) {
      if (isPlaying) {
        audioRef.current.audio.current.play();
      } else {
        audioRef.current.audio.current.pause();
      }
    }
  }, [isPlaying, currentTrack]); 

  const isReady = !!currentTrack; 

  const customIcons = {
    play: <IoPlaySharp size={24} />,
    pause: <IoPauseSharp size={24} />,
    previous: <IoPlaySkipBackSharp size={22} />,
    next: <IoPlaySkipForwardSharp size={22} />,
  };

  return (
    <div className={`player-bar-container ${!isReady ? 'empty' : ''}`}>
      {/* 1. Thông tin bài hát */}
      <div className="player-track-info">
        {isReady ? (
          <>
            <img 
              src={currentTrack.album?.cover_url || '/images/default-album.png'} 
              alt={currentTrack.title} 
            />
            <div>
              <p className="title">{currentTrack.title}</p>
              <p className="artist">{currentTrack.artist?.stage_name || 'Nghệ sĩ'}</p>
            </div>
          </>
        ) : (
          <p className="waiting-text">Chọn một bài hát để bắt đầu nghe.</p>
        )}
      </div>
      
      {/* 2. Trình phát nhạc */}
      {isReady && (
        <AudioPlayer
          ref={audioRef} // <-- GÁN REF TỪ CONTEXT
          className="audio-player-core"
          src={currentTrack.file_url} 
          showSkipControls={true} 
          showJumpControls={false} 
          customIcons={customIcons} 
          onPlay={() => setIsPlaying(true)} 
          onPause={() => setIsPlaying(false)} 
        />
      )}
      
      {/* 3. Điều khiển Âm lượng */}
      {isReady && (
        <div className="player-volume-controls">
          <HiVolumeUp size={24} /> 
        </div>
      )}
    </div>
  );
};

export default PlayerBar;