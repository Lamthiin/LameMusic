// src/components/SongListTable.jsx – ĐẸP, CÓ PHÂN TRANG, LƯỢT NGHE ĐẸP
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

// Định dạng lượt nghe kiểu Spotify: 1.2K, 30.5K, 1.5M
const formatPlayCount = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const ITEMS_PER_PAGE = 10;

const SongListTable = ({ songs = [], onRemoveSong }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSongs, setSelectedSongs] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuSong, setMenuSong] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalPages = Math.ceil(songs.length / ITEMS_PER_PAGE);
  const paginatedSongs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return songs.slice(start, start + ITEMS_PER_PAGE);
  }, [songs, currentPage]);

  const hasSelection = selectedSongs.size > 0;

  const toggleSelect = (id) => {
    setSelectedSongs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedSongs.size === paginatedSongs.length) {
      setSelectedSongs(new Set());
    } else {
      setSelectedSongs(new Set(paginatedSongs.map(s => s.id)));
    }
  };

  const playSong = (song, index) => {
    const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    const isCurrent = currentTrack?.id === song.id;
    if (isCurrent) playTrack(song);
    else playTrack(song, songs, realIndex);
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
    <div className="songlist-wrapper">
      {/* HEADER */}
      <div className={`songlist-header ${hasSelection ? 'has-selection' : ''}`}>
        <span className="header-checkbox" onClick={selectAll}>
          {hasSelection ? <FaTimes size={12} /> : '☰'}
        </span>

        {hasSelection ? (
          <>
            <span className="selection-count">
              Đã chọn {selectedSongs.size} bài
            </span>
            <button className="action-download" onClick={() => {}}>
              <FaDownload /> Tải xuống
            </button>
          </>
        ) : (
          <>
            <span className="col-index">#</span>
            <span className="col-title">TÊN BÀI HÁT</span>
            <span className="col-album">ALBUM</span>
            <span className="col-plays">LƯỢT NGHE</span>
            <span className="col-duration">THỜI GIAN</span>
            <span className="col-options"></span>
          </>
        )}
      </div>

      {/* BODY */}
      <div className="songlist-body">
        {paginatedSongs.map((song, idx) => {
          const displayIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
          const isSelected = selectedSongs.has(song.id);
          const isCurrent = currentTrack?.id === song.id;
          const isPlayingThis = isCurrent && isPlaying;
          const thumb = song.image_url || song.album?.cover_url || '/images/default-album.png';

          return (
            <div
              key={song.id}
              className={`songlist-row ${isSelected ? 'selected' : ''} ${isCurrent ? 'playing' : ''}`}
              onClick={() => toggleSelect(song.id)}
              onMouseEnter={() => setHoveredRow(song.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <span className="row-index">
                {hoveredRow === song.id || isPlayingThis ? (
                  <button
                    className="play-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSong(song, idx);
                    }}
                  >
                    {isPlayingThis ? <FaPause size={14} /> : <FaPlay size={14} />}
                  </button>
                ) : (
                  displayIndex
                )}
              </span>

              <div className="col-img-title">
                <img src={thumb} alt="" className="song-thumb" />
                <div
                  className="song-info"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/song/${song.id}`);
                  }}
                >
                  <p className="song-title">{song.title}</p>
                  <p className="song-artist">{song.artist?.stage_name || 'Không rõ'}</p>
                </div>
              </div>

              <span className="col-album">{song.album?.title || 'Single'}</span>
              <span className="col-plays">{formatPlayCount(song.play_count || 0)}</span>
              <span className="col-duration">{formatDuration(song.duration)}</span>

              <div className="col-options" onClick={(e) => e.stopPropagation()}>
                {onRemoveSong && (
                  <button className="btn-remove" onClick={() => onRemoveSong(song.id)}>
                    <FaTimes size={14} />
                  </button>
                )}
                <button className="btn-menu" onClick={(e) => openMenu(e, song)}>
                  ⋯
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="songlist-pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Trước
          </button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sau
          </button>
        </div>
      )}

      {/* MENU & MODAL */}
      {menuAnchor && menuSong && (
        <SongOptionsMenu
          song={menuSong}
          closeMenu={closeMenu}
          onAddToPlaylistClick={() => {
            setSelectedSongs(new Set([menuSong.id]));
            setIsAddModalOpen(true);
            closeMenu();
          }}
        />
      )}

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