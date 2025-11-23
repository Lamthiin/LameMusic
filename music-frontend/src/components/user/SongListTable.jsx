import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import SongOptionsMenu from './SongOptionsMenu';
import AddToPlaylistModal from './AddToPlaylistModal';
import './SongListTable.css';
import {
  FaPlay, FaPause, FaCheck, FaHeart,
  FaPlusSquare, FaDownload, FaTimes, FaEllipsisV
} from 'react-icons/fa';

// Toast dự phòng
const showToast = (msg) => { console.log(msg); alert(msg); };

// Format thời gian
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return 'N/A';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

// Tải xuống 1 bài
const handleDownloadFile = async (song) => {
  if (!song.file_url) return showToast(`Không tìm thấy file: ${song.title}`);
  try {
    const url = song.file_url.startsWith('http')
      ? song.file_url
      : `http://localhost:3000${song.file_url}`;
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${song.title.replace(/[^a-zA-Z0-9]/g,'_')}.mp3`;
    a.click();
    URL.revokeObjectURL(blobUrl);
    showToast(`Đang tải: ${song.title}`);
  } catch {
    showToast(`Lỗi tải ${song.title}`);
  }
};

// Force like
const forceLikeSong = async (songId) => {
  await fetch(`http://localhost:3000/api/songs/${songId}/like`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
};

const SongListTable = ({ songs = [] }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const [localSongs, setLocalSongs] = useState(songs);
  const [selectedSongs, setSelectedSongs] = useState(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [individualMenuAnchor, setIndividualMenuAnchor] = useState(null);
  const [targetSingleSong, setTargetSingleSong] = useState(null);

  useEffect(() => {
    setLocalSongs(songs);
  }, [songs]);

  const selectedSongObjects = useMemo(
    () => localSongs.filter(s => selectedSongs.has(s.id)),
    [localSongs, selectedSongs]
  );

  const handleToggleSelection = (songId) => {
    setSelectedSongs(prev => {
      const next = new Set(prev);
      next.has(songId) ? next.delete(songId) : next.add(songId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedSongs.size === localSongs.length) setSelectedSongs(new Set());
    else setSelectedSongs(new Set(localSongs.map(s => s.id)));
  };

  const handlePlayPause = (song, idx) => {
    const isCurrent = currentTrack?.id === song.id;
    if (isCurrent) playTrack(song);
    else playTrack(song, localSongs, idx);
  };

  // Like hàng loạt (không un-like)
  const handleLikeSelected = async (e) => {
    e.stopPropagation();
    if (selectedSongs.size === 0) return;
    try {
      await Promise.all(selectedSongObjects.map(s => forceLikeSong(s.id).catch(()=>{})));
      setLocalSongs(prev => prev.map(s =>
        selectedSongObjects.some(x => x.id === s.id) ? {...s, is_liked: true} : s
      ));
      showToast(`Đã thích ${selectedSongObjects.length} bài`);
    } catch { showToast('Lỗi khi thích bài'); }
    setSelectedSongs(new Set());
  };

  const handleDownloadSelected = (e) => {
    e.stopPropagation();
    if (selectedSongObjects.length === 0) return;
    selectedSongObjects.forEach(handleDownloadFile);
    showToast(`Đang tải ${selectedSongObjects.length} bài...`);
    setSelectedSongs(new Set());
  };

  const handleOpenIndividualMenu = (e, song) => {
    e.stopPropagation();
    setTargetSingleSong(song);
    setIndividualMenuAnchor(e.currentTarget);
  };
  const handleCloseMenuOptions = () => {
    setIndividualMenuAnchor(null);
    setTargetSingleSong(null);
  };

  const handleCompleteAdd = () => {
    setIsAddModalOpen(false);
    setSelectedSongs(new Set());
    setTargetSingleSong(null);
  };

  const hasSelection = selectedSongs.size > 0;

  return (
    <div className="song-list-table">
      <div className={`table-header ${hasSelection ? 'has-selection':''}`}>
        <span className="header-checkbox" onClick={handleSelectAll}>
          {hasSelection ? <FaTimes size={16}/> : '✔'}
        </span>

        {hasSelection ? (
          <>
            <span className="selection-message">Đã chọn {selectedSongs.size} bài</span>
            <div className="action-button-group">
              <button className="action-btn" onClick={handleLikeSelected}>
                <FaHeart size={16}/> Thích
              </button>
              <button className="action-btn" onClick={handleDownloadSelected}>
                <FaDownload size={16}/> Tải
              </button>
              <button className="action-btn"
                onClick={(e)=>{
                  e.stopPropagation();
                  if(selectedSongs.size===0) return showToast("Vui lòng chọn bài trước khi thêm playlist");
                  setIsAddModalOpen(true);
                }}
              >
                <FaPlusSquare size={16}/> Playlist
              </button>
            </div>
          </>
        ):(
          <>
            <span className="col-img"></span>
            <span className="col-title">TÊN BÀI HÁT</span>
            <span className="col-album">ALBUM</span>
            <span className="col-plays">LƯỢT NGHE</span>
            <span className="col-duration">THỜI GIAN</span>
            <span className="col-options-header"></span>
          </>
        )}
      </div>

      <div className="table-body">
        {localSongs.map((song, idx)=>{
          const isSelected = selectedSongs.has(song.id);
          const isCurrent = currentTrack?.id===song.id;
          const isPlayingThis = isCurrent && isPlaying;
          const thumb = song.cover_url || song.image_url || '/default-cover.jpg';

          return (
            <div key={song.id}
              className={`table-row ${isSelected?'selected':''} ${isCurrent?'current':''}`}
              onClick={()=>handleToggleSelection(song.id)}
            >
              <span className="row-checkbox">{isSelected && <FaCheck size={12}/>}</span>
              <div className="col-img" onClick={e=>{e.stopPropagation(); handlePlayPause(song,idx);}}>
                <img src={thumb} alt={song.title} className="song-thumbnail"/>
                <div className="play-overlay">{isPlayingThis?<FaPause size={14}/>:<FaPlay size={14}/>}</div>
              </div>
              <div className="col-title" onClick={e=>{e.stopPropagation(); navigate(`/song/${song.id}`);}}>
                <p className="song-title">{song.title}</p>
                <p className="song-artist">{song.artist?.stage_name||'Không rõ'}</p>
              </div>
              <span className="col-album">{song.album?.title||'Single'}</span>
              <span className="col-plays">{(song.play_count||0).toLocaleString()}</span>
              <span className="col-duration">{formatDuration(song.duration)}</span>
              <span className="col-options">
                <button className="btn-icon" onClick={e=>handleOpenIndividualMenu(e,song)}><FaEllipsisV size={14}/></button>
              </span>
            </div>
          );
        })}
      </div>

      {isAddModalOpen && (
        <AddToPlaylistModal
          songIds={selectedSongObjects.map(s=>s.id)}
          onClose={handleCompleteAdd}
        />
      )}

      {individualMenuAnchor && targetSingleSong && (
        <SongOptionsMenu
          anchorEl={individualMenuAnchor}
          onClose={handleCloseMenuOptions}
          songs={[targetSingleSong]}
          multiSelect={false}
          onAddToPlaylistClick={()=>{
            handleCloseMenuOptions();
            setSelectedSongs(new Set([targetSingleSong.id]));
            setIsAddModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default SongListTable;
