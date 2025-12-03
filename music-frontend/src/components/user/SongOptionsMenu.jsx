// music-frontend/src/components/SongOptionsMenu.jsx
import React from 'react';
import './SongOptionsMenu.css';

// Nhận prop onAddToPlaylistClick từ cha (SongDetail)
const SongOptionsMenu = ({ song, closeMenu, onAddToPlaylistClick }) => {

  const handleDownload = () => {
    const url = `/song/download/${song.id}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  return (
    <div className="song-options-menu">
      <ul>
        <li onClick={handleDownload}>
          Tải về
        </li>
        
        {/* Gọi hàm mở modal khi click */}
        <li onClick={onAddToPlaylistClick}> 
          Thêm vào Playlist
        </li>
      </ul>
    </div>
  );
};

export default SongOptionsMenu;
