// music-frontend/src/components/SongOptionsMenu.jsx (BẢN SỬA LỖI FINAL)
import React from 'react';
import './SongOptionsMenu.css';

// (1) NHẬN THÊM PROP 'onAddToPlaylistClick' TỪ CHA (SONGDETAIL)
const SongOptionsMenu = ({ song, closeMenu, onAddToPlaylistClick }) => {

  const handleDownload = () => {
    // (Logic download giữ nguyên)
    fetch(song.file_url)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${song.title}.mp3`; 
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        closeMenu();
      });
  };

  return (
    <div className="song-options-menu">
      <ul>
        <li onClick={handleDownload}>
          Tải về
        </li>
        
        {/* (2) SỬA LỖI: GỌI HÀM MỞ MODAL KHI CLICK */}
        <li onClick={onAddToPlaylistClick}> 
          Thêm vào Playlist
        </li>
        {/* (Dòng alert() cũ đã bị xóa) */}
        
      </ul>
    </div>
  );
};

export default SongOptionsMenu;