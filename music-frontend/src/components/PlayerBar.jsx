// music-frontend/src/components/PlayerBar.jsx
import React, { useEffect } from 'react'; 
import { usePlayer } from '../context/PlayerContext';
import AudioPlayer from 'react-h5-audio-player'; 
import 'react-h5-audio-player/lib/styles.css'; 
import './PlayerBar.css'; 

// Icons
import { 
  IoPlaySkipBackSharp, 
  IoPlaySkipForwardSharp, 
  IoPlaySharp, 
  IoPauseSharp,
  IoShuffle
} from 'react-icons/io5';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const fixPlayerImageUrl = (track) => {
  const url = track.image_url || track.album?.cover_url;
  if (!url) return '/images/default-album.png'; 
  if (url.startsWith('http')) return url;
  return `http://localhost:3000${url.startsWith('/media') ? url : url.replace('/images', '/media/images')}`;
};

const fixAudioUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `http://localhost:3000${url}`;
};

const PlayerBar = () => {
  const navigate = useNavigate();

  const { 
    currentTrack, 
    isPlaying, 
    playNext,
    playPrevious, 
    audioRef,
    currentPlaylist, 
    isShuffling, 
    toggleShuffle,
    setCurrentTrack,
    setCurrentPlaylist,
    setIsPlaying,
    isLoggedIn,
    getRecommendedSongApi
  } = usePlayer();

  const isReady = !!currentTrack;

  const handleNextClick = () => currentPlaylist.length && playNext();
  const handlePreviousClick = () => currentPlaylist.length && playPrevious();

  const handleGoToSongDetail = () => {
    if (currentTrack?.id) navigate(`/song/${currentTrack.id}`);
  };

  const customIcons = {
    play: <IoPlaySharp size={24} />,
    pause: <IoPauseSharp size={24} />,
    previous: <IoPlaySkipBackSharp size={22} />,
    next: <IoPlaySkipForwardSharp size={22} />,
  };

  // -------------------------------------------------------------
  // AUTO PLAY KHI ĐỔI BÀI (FIX CHÍNH)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;

    const audio = audioRef.current.audio.current;

    // Khi đổi bài → tự play
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        console.log("Autoplay bị chặn bởi trình duyệt.");
      });
  }, [currentTrack, audioRef, setIsPlaying]);


  return (
    <div className={`player-bar-container ${!isReady ? 'empty' : ''}`}>
      
      {/* LEFT: Song Info */}
      <div className="player-track-info" onClick={handleGoToSongDetail}>
        {isReady ? (
          <>
            <img src={fixPlayerImageUrl(currentTrack)} alt={currentTrack.title} />
            <div>
              <p className="title">{currentTrack.title}</p>
              <p className="artist">{currentTrack.artist?.stage_name || 'Nghệ sĩ'}</p>
            </div>
          </>
        ) : (
          <p className="waiting-text">Chọn một bài hát để bắt đầu nghe.</p>
        )}
      </div>

      {/* CENTER: Player */}
      {isReady && (
        <AudioPlayer
          ref={audioRef}
          className="audio-player-core"
          src={fixAudioUrl(currentTrack.file_url)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={playNext}
          onClickNext={handleNextClick}
          onClickPrevious={handlePreviousClick}
          showSkipControls={true}
          showJumpControls={false}
          customIcons={customIcons}
          customControls={[
            <button 
              key="shuffle" 
              className={`rhap_shuffle_button ${isShuffling ? 'rhap_active' : ''}`}
              onClick={toggleShuffle} 
              title="Phát ngẫu nhiên"
            >
              <IoShuffle size={18} />
            </button>,
            <button 
              key="like" 
              className={`rhap_like_button ${currentTrack.isLiked ? 'liked' : ''}`}
              title="Thích bài hát"
            >
              <FaHeart size={18} />
            </button>
          ]}
        />
      )}
    </div>
  );
};

export default PlayerBar;
