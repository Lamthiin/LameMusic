// music-frontend/src/components/SongListTable.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import SongOptionsMenu from './SongOptionsMenu';
import AddToPlaylistModal from './AddToPlaylistModal';
import './SongListTable.css';
import {
  FaPlay,
  FaPause,
  FaCheck,
  FaHeart,
  FaDownload,
  FaTimes,
  FaEllipsisV,
} from 'react-icons/fa';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const showToast = (msg) => alert(msg);

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const downloadSingle = async (song) => {
  if (!song?.file_url) return showToast('Không có link tải');
  try {
    const url = song.file_url.startsWith('http')
      ? song.file_url
      : `http://localhost:3000${song.file_url}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    saveAs(blob, `${song.title}.mp3`);
  } catch {
    showToast(`Lỗi tải: ${song.title}`);
  }
};

const forceLikeSong = async (songId) => {
  await fetch(`http://localhost:3000/api/songs/${songId}/like`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
};

const SongListTable = ({
  songs = [],
  onUnlike,                    // Trang Liked Songs → bỏ thích
  onRemoveSong,                // Playlist → xóa khỏi playlist
  onRemoveSongFromAlbum,       // Album → xóa khỏi album
  showOptionsMenu = true,      // Ẩn 3 chấm nếu cần
}) => {
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
    if (selectedSongs.size === localSongs.length) {
      setSelectedSongs(new Set());
    } else {
      setSelectedSongs(new Set(localSongs.map((s) => s.id)));
    }
  };

  const playSong = (song, index) => {
    const isCurrent = currentTrack?.id === song.id;
    if (isCurrent) {
      playTrack(song);
    } else {
      playTrack(song, localSongs, index);
    }
  };

  // LIKE HÀNG LOẠT
  const handleLikeSelected = async () => {
    const toLike = selectedSongObjects.filter((s) => !s.is_liked);
    if (toLike.length === 0) return showToast('Đã thích hết rồi!');

    try {
      await Promise.all(toLike.map((s) => forceLikeSong(s.id).catch(() => {})));
      setLocalSongs((prev) =>
        prev.map((s) =>
          toLike.some((x) => x.id === s.id) ? { ...s, is_liked: true } : s
        )
      );
      showToast(`Đã thích ${toLike.length} bài`);
    } catch {
      showToast('Lỗi khi thích');
    }
  };

  // TẢI XUỐNG HÀNG LOẠT + ZIP
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
      await Promise.all(
        selectedSongObjects.map(async (song) => {
          if (!song.file_url) return;
          const url = song.file_url.startsWith('http')
            ? song.file_url
            : `http://localhost:3000${song.file_url}`;
          const res = await fetch(url);
          const blob = await res.blob();
          const name = `${song.artist?.stage_name || 'Unknown'} - ${song.title}.mp3`
            .replace(/[/\\?%*:|"<>]/g, '_');
          zip.file(name, blob);
          loaded++;
          showToast(`Đang nén ${loaded}/${selectedSongObjects.length}...`);
        })
      );

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'My_Music_Download.zip');
      showToast('Tải thành công!');
    } catch {
      showToast('Lỗi tạo ZIP');
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
              {/* <button className="action-btn" onClick={handleLikeSelected}>
                <FaHeart size={16} /> Thích
              </button> */}
              <button className="action-btn" onClick={handleDownloadSelected}>
                <FaDownload size={16} /> Tải
              </button>
              {/* <button
                className="action-btn"
                onClick={(e) => { e.stopPropagation(); setIsAddModalOpen(true); }}
              >
                Playlist
              </button> */}
            </div>
          </>
        ) : (
          <>
            <span className="col-img"></span>
            <span className="col-title">TÊN BÀI HÁT</span>
            <span className="col-album">ALBUM</span>
            <span className="col-plays">LƯỢT NGHE</span>
            <span className="col-duration">THỜI GIAN</span>
            {/* <span className="col-options-header"></span> */}
          </>
        )}
      </div>

      {/* BODY */}
      <div className="table-body">
        {localSongs.map((song, idx) => {
          const isSelected = selectedSongs.has(song.id);
          const isCurrent = currentTrack?.id === song.id;
          const isPlayingThis = isCurrent && isPlaying;
          const isHovered = hoveredRow === song.id;
          const thumb = song.cover_url || song.image_url || '/default.jpg';

          return (
            <div
              key={song.id}
              className={`table-row ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => toggleSelect(song.id)}
              onMouseEnter={() => setHoveredRow(song.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <span className="row-checkbox">
                {isSelected && <FaCheck size={12} />}
              </span>

              <div
                className="col-img"
                onClick={(e) => {
                  e.stopPropagation();
                  playSong(song, idx);
                }}
              >
                <img src={thumb} alt={song.title} className="song-thumbnail" />
                <div className="play-overlay">
                  {isPlayingThis ? <FaPause size={14} /> : <FaPlay size={14} />}
                </div>
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

              {/* CỘT OPTIONS - 4 CHẾ ĐỘ HOÀN HẢO */}
              <div className="col-options" onClick={(e) => e.stopPropagation()}>
                {/* 1. XÓA KHỎI ALBUM */}
                {onRemoveSongFromAlbum && (
                  <button
                    className="btn-icon btn-remove"
                    title="Xóa khỏi album"
                    onClick={() => onRemoveSongFromAlbum(song.id, song.title)}
                  >
                    <FaTimes size={14} />
                  </button>
                )}

                {/* 2. XÓA KHỎI PLAYLIST */}
                {onRemoveSong && !onRemoveSongFromAlbum && (
                  <button
                    className="btn-icon btn-remove"
                    title="Xóa khỏi playlist"
                    onClick={() => onRemoveSong(song.id)}
                  >
                    <FaTimes size={14} />
                  </button>
                )}

                {/* 3. BỎ THÍCH (Liked Songs) */}
                {onUnlike && !onRemoveSong && !onRemoveSongFromAlbum && (
                  <button
                    className="btn-icon btn-unlike"
                    title="Bỏ thích"
                    onClick={() => onUnlike(song.id)}
                  >
                    <FaTimes size={14} />
                  </button>
                )}

                {/* 4. NÚT 3 CHẤM (trang thường)
                {showOptionsMenu && !onUnlike && !onRemoveSong && !onRemoveSongFromAlbum && (isHovered || isSelected) && (
                  <button className="btn-icon" onClick={(e) => openMenu(e, song)}>
                    <FaEllipsisV size={14} />
                  </button>
                )} */}
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

      {/* MODAL THÊM PLAYLIST */}
      {isAddModalOpen && (
        <AddToPlaylistModal
          songIds={selectedSongObjects.map((s) => s.id)}
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