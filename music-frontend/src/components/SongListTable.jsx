import React, { useState } from 'react';
import { FaPlay, FaPause, FaCheck, FaEllipsisV, FaHeart, FaPlusSquare } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';
import SongOptionsMenu from './SongOptionsMenu';
import AddToPlaylistModal from './AddToPlaylistModal';
import './SongListTable.css';

const SongListTable = ({ songs }) => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const [selectedSongs, setSelectedSongs] = useState(new Set());
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleToggleSelection = (songId) => {
    setSelectedSongs(prev => {
      const newSet = new Set(prev);
      newSet.has(songId) ? newSet.delete(songId) : newSet.add(songId);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedSongs.size === songs.length) setSelectedSongs(new Set());
    else setSelectedSongs(new Set(songs.map(s => s.id)));
  };

  const openActionMenu = (e) => {
    if (selectedSongs.size === 0) return;
    setMenuAnchor(e.currentTarget);
  };

  const handlePlayPause = (song, index) => {
    const isCurrent = currentTrack?.id === song.id && isPlaying;
    playTrack(song, isCurrent ? null : songs, index);
  };

  return (
    <div className="song-list-table">
      {/* HEADER */}
      <div className="table-header">
        <span className="header-checkbox" onClick={handleSelectAll}>
          {selectedSongs.size > 0 ? <FaCheck /> : '✔'}
        </span>
        <span className="col-title">Tên bài hát</span>
        <span className="col-album">Album</span>
        <span className="col-duration">Thời gian</span>
      </div>

      {/* BODY */}
      {songs.map((song, index) => {
        const isSelected = selectedSongs.has(song.id);
        const isCurrent = currentTrack?.id === song.id && isPlaying;
        return (
          <div key={song.id} className={`table-row ${isSelected ? 'selected' : ''}`}>
            <span className="row-checkbox" onClick={() => handleToggleSelection(song.id)}>
              {isSelected && <FaCheck size={12} />}
            </span>
            <span className="col-title" onClick={() => handlePlayPause(song, index)}>
              {song.title} - {song.artist?.stage_name}
              {isCurrent && <FaPause className="playing-icon" />}
            </span>
            <span className="col-album">{song.album?.title || 'Single'}</span>
            <span className="col-duration">{Math.floor(song.duration / 60)}:{('0'+(song.duration%60)).slice(-2)}</span>
          </div>
        )
      })}

      {/* ACTION MENU */}
      {selectedSongs.size > 0 && (
        <div className="action-bar">
          <button onClick={() => setIsAddModalOpen(true)}><FaPlusSquare /> Thêm vào Playlist</button>
          <button onClick={openActionMenu}><FaHeart /> Thích</button>
        </div>
      )}

      {/* ADD TO PLAYLIST MODAL */}
      {isAddModalOpen && (
        <AddToPlaylistModal 
          songIds={Array.from(selectedSongs)}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SongListTable;
