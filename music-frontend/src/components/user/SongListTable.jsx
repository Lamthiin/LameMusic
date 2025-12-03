// src/components/SongListTable.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import SongOptionsMenu from './SongOptionsMenu';
import AddToPlaylistModal from './AddToPlaylistModal';
import './SongListTable.css';
import { FaPlay, FaPause, FaCheck, FaTimes, FaDownload } from 'react-icons/fa';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const showToast = (msg) => alert(msg);

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const SongListTable = ({ songs = [], onRemoveSong }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const [localSongs, setLocalSongs] = useState(songs);
  const [selectedSongs, setSelectedSongs] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuSong, setMenuSong] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setLocalSongs(songs);
  }, [songs]);

  const selectedSongObjects = useMemo(
    () => localSongs.filter((s) => selectedSongs.has(s.id)),
    [localSongs, selectedSongs]
  );

  const hasSelection = selectedSongs.size > 0;

  const toggleSelect = (id) => {
    setSelectedSongs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedSongs.size === localSongs.length) setSelectedSongs(new Set());
    else setSelectedSongs(new Set(localSongs.map((s) => s.id)));
  };

  const playSong = (song, index) => {
    const isCurrent = currentTrack?.id === song.id;
    if (isCurrent) playTrack(song);
    else playTrack(song, localSongs, index);
  };

  // TẢI MỘT BÀI
  const downloadSingle = async (song) => {
    try {
      const url = `${API_BASE}/song/download/${song.id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed');

      const blob = await res.blob();
      const filename = `${song.artist?.stage_name || 'Unknown'} - ${song.title}.mp3`.replace(/[/\\?%*:|"<>]/g, '_');
      saveAs(blob, filename);
      showToast('Tải thành công!');
    } catch (err) {
      console.error(err);
      showToast(`Lỗi tải: ${song.title}`);
    }
  };

  // TẢI NHIỀU + ZIP
  const handleDownloadSelected = async () => {
    if (selectedSongObjects.length === 0) return;

    if (selectedSongObjects.length === 1) {
      await downloadSingle(selectedSongObjects[0]);
      setSelectedSongs(new Set());
      return;
    }

    const zip = new JSZip();
    let loaded = 0;

    try {
      for (const song of selectedSongObjects) {
        const url = `${API_BASE}/song/download/${song.id}`;
        const res = await fetch(url);
        if (!res.ok) continue;

        const blob = await res.blob();
        const name = `${song.artist?.stage_name || 'Unknown'} - ${song.title}.mp3`.replace(/[/\\?%*:|"<>]/g, '_');
        zip.file(name, blob);
        loaded++;
        showToast(`Đang nén ${loaded}/${selectedSongObjects.length}...`);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `LameMusic_Download_${new Date().toISOString().slice(0,10)}.zip`);
      showToast('Tải ZIP thành công!');
    } catch (err) {
      console.error(err);
      showToast('Lỗi tạo file ZIP');
    } finally {
      setSelectedSongs(new Set());
    }
  };

  const openMenu = (e, song) => {
    e.stopPropagation();
    setMenuSong(song);
    setMenuAnchor(e.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuSong(null);
  };

  return (
    <div className="song-list-table">
      {/* HEADER */}
      <div className={`table-header ${hasSelection ? 'has-selection' : ''}`}>
        <span className="header-checkbox" onClick={selectAll}>
          {hasSelection ? <FaTimes size={11} /> : 'Chọn'}
        </span>

        {hasSelection ? (
          <>
            <span className="selection-message">Đã chọn {selectedSongs.size} bài</span>
            <div className="action-button-group">
              <button className="action-btn" onClick={handleDownloadSelected}>
                <FaDownload size={16} /> Tải xuống
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="col-img"></span>
            <span className="col-title">TÊN BÀI HÁT</span>
            <span className="col-album">ALBUM</span>
            <span className="col-plays">LƯỢT NGHE</span>
            <span className="col-duration">THỜI GIAN</span>
          </>
        )}
      </div>

      {/* BODY */}
      <div className="table-body">
        {localSongs.map((song, idx) => {
          const isSelected = selectedSongs.has(song.id);
          const isCurrent = currentTrack?.id === song.id;
          const isPlayingThis = isCurrent && isPlaying;
          const thumb = song.image_url || song.album?.cover_url || '/images/default-album.png';

          return (
            <div
              key={song.id}
              className={`table-row ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => toggleSelect(song.id)}
              onMouseEnter={() => setHoveredRow(song.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <span className="row-checkbox">{isSelected && <FaCheck size={12} />}</span>

              <div
                className="col-img"
                onClick={(e) => {
                  e.stopPropagation();
                  playSong(song, idx);
                }}
              >
                <img src={thumb} alt={song.title} className="song-thumbnail" />
                <div className="play-overlay">{isPlayingThis ? <FaPause size={14} /> : <FaPlay size={14} />}</div>
              </div>

              <div
                className="col-title"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/song/${song.id}`);
                }}
              >
                <p className="song-title">{song.title}</p>
                <p className="song-artist">{song.artist?.stage_name || 'Không rõ'}</p>
              </div>

              <span className="col-album">{song.album?.title || 'Single'}</span>
              <span className="col-plays">{(song.play_count || 0).toLocaleString()}</span>
              <span className="col-duration">{formatDuration(song.duration)}</span>

              {/* CÁC NÚT XÓA / BỎ THÍCH */}
              <div className="col-options" onClick={(e) => e.stopPropagation()}>
                {onRemoveSong && (
                  <button className="btn-icon btn-remove" title="Xóa" onClick={() => onRemoveSong(song.id)}>
                    <FaTimes size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MENU 3 CHẤM */}
      {menuAnchor && menuSong && (
        <SongOptionsMenu
          anchorEl={menuAnchor}
          songs={[menuSong]}
          onClose={closeMenu}
          onAddToPlaylistClick={() => {
            closeMenu();
            setSelectedSongs(new Set([menuSong.id]));
            setIsAddModalOpen(true);
          }}
        />
      )}

      {/* MODAL THÊM VÀO PLAYLIST */}
      {isAddModalOpen && (
        <AddToPlaylistModal
          songIds={Array.from(selectedSongs)}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedSongs(new Set());
          }}
        />
      )}
    </div>
  );
};

export default SongListTable;
