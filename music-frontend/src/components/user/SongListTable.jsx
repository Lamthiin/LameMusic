// src/components/SongListTable.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import AddToPlaylistModal from './AddToPlaylistModal';
import './SongListTable.css';
import { FaPlay, FaPause, FaTimes, FaDownload, FaList } from 'react-icons/fa';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const ITEMS_PER_PAGE = 10;

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

const SongListTable = ({ songs = [], onRemoveSong }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSongs, setSelectedSongs] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);
  const [menuSong, setMenuSong] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
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
    if (selectedSongs.size === paginatedSongs.length) setSelectedSongs(new Set());
    else setSelectedSongs(new Set(paginatedSongs.map(s => s.id)));
  };

  const playSong = (song, index) => {
    const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    const isCurrent = currentTrack?.id === song.id;
    if (isCurrent) playTrack(song);
    else playTrack(song, songs, realIndex);
  };

  const openMenu = (e, song) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = 80;
    let left = rect.left;
    if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth - 10;
    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight) top = rect.top - menuHeight - 4;
    setMenuSong(song);
    setMenuPosition({ top, left });
  };

  const closeMenu = () => setMenuSong(null);

  const handleDownload = async (song) => {
    try {
      const res = await fetch(`/song/download/${song.id}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Lỗi tải bài', song.title, err);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedSongs.size === 0) return;
    const zip = new JSZip();
    for (const songId of selectedSongs) {
      const song = songs.find(s => s.id === songId);
      if (!song) continue;
      try {
        const res = await fetch(`/song/download/${songId}`);
        const blob = await res.blob();
        zip.file(`${song.title}.mp3`, blob);
      } catch (err) {
        console.error('Lỗi tải bài', song.title, err);
      }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'SelectedSongs.zip');
  };

  return (
    <div className="songlist-wrapper">
      <div className={`songlist-header ${hasSelection ? 'has-selection' : ''}`}>
        <span className="header-checkbox" onClick={selectAll}>
          {hasSelection ? <FaTimes size={12} /> : '☰'}
        </span>

        {hasSelection ? (
          <div className="action-button-group">
            <button className="action-download" onClick={handleDownloadSelected}>
              <FaDownload /> Tải xuống
            </button>
            <button className="action-add-to-playlist" onClick={() => setIsAddModalOpen(true)}>
              <FaList /> Thêm vào Playlist
            </button>
          </div>
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
                  <button className="play-btn-small" onClick={(e) => { e.stopPropagation(); playSong(song, idx); }}>
                    {isPlayingThis ? <FaPause size={14} /> : <FaPlay size={14} />}
                  </button>
                ) : displayIndex}
              </span>

              <div className="col-img-title">
                <img
                  src={thumb}
                  alt=""
                  className="song-thumb"
                  onClick={(e) => { e.stopPropagation(); playSong(song, idx); }}
                />
                <div className="song-info" onClick={(e) => { e.stopPropagation(); navigate(`/song/${song.id}`); }}>
                  <p className="song-title">{song.title}</p>
                  <p className="song-artist">
                    {song.songArtists?.length > 0
                      ? song.songArtists.map((sa, i) => (
                          <span
                            key={sa.artist?.id || i}
                            className="song-artist-link"
                            onClick={(e) => { e.stopPropagation(); if(sa.artist?.id) navigate(`/artist/${sa.artist.id}`); }}
                          >
                            {sa.artist?.stage_name}{i < song.songArtists.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      : 'Không rõ'}
                  </p>
                </div>
              </div>


              <span className="col-album">{song.album?.title || 'Single'}</span>
              <span className="col-plays">{formatPlayCount(song.play_count || 0)}</span>
              <span className="col-duration">{formatDuration(song.duration)}</span>

              <div className="col-options" onClick={(e) => e.stopPropagation()}>
                {onRemoveSong && <button className="btn-remove" onClick={() => onRemoveSong(song.id)}><FaTimes size={14} /></button>}
                <button className="btn-menu" onClick={(e) => openMenu(e, song)}>⋯</button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="songlist-pagination">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Trước</button>
          <span>Trang {currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Sau</button>
        </div>
      )}

      {menuSong && (
      <>
        {/* BACKDROP – click ra ngoài để đóng menu */}
        <div
          className="song-options-backdrop"
          onClick={closeMenu}
        />

        {/* MENU */}
        <div
          className="song-options-menu"
          style={{ top: menuPosition.top, left: menuPosition.left, position: 'fixed' }}
          onClick={(e) => e.stopPropagation()}
        >
          <ul>
            <li
              onClick={() => {
                handleDownload(menuSong);
                closeMenu();
              }}
            >
              Tải về
            </li>

            <li
              onClick={() => {
                setSelectedSongs(new Set([menuSong.id]));
                setIsAddModalOpen(true);
                closeMenu();
              }}
            >
              Thêm vào Playlist
            </li>
          </ul>
        </div>
      </>
    )}


      {isAddModalOpen && (
        <AddToPlaylistModal
          songIds={Array.from(selectedSongs)}
          onClose={() => { setIsAddModalOpen(false); setSelectedSongs(new Set()); }}
        />
      )}
    </div>
  );
};

export default SongListTable;
