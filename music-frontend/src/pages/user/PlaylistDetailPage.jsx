// music-frontend/src/pages/PlaylistDetailPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicPlaylistApi, removeSongFromPlaylistApi } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import SongListTable from '../../components/user/SongListTable';
import './PlaylistDetailPage.css';
import { FaPlay } from 'react-icons/fa';

const fixUrl = (url, type = 'image') => {
  if (!url) {
    if (type === 'artist') return '/images/default-artist.png';
    if (type === 'audio') return '';
    return '/images/default-album.png';
  }
  if (url.startsWith('http')) return url;

  const prefix = type === 'image' ? '/media/images' : '/media/audio';
  const originalPath = type === 'image' ? '/images' : '/audio';

  if (url.startsWith(prefix)) {
    return `http://localhost:3000${url}`;
  }
  return `http://localhost:3000${url.replace(originalPath, prefix)}`;
};

const showToast = (msg) => alert(msg);

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPlaylist = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicPlaylistApi(id);

      const fixedSongs = (data.songs || []).map((song) => ({
        ...song,
        image_url: fixUrl(song.image_url || song.album?.cover_url),
        file_url: fixUrl(song.file_url, 'audio'),
        album: song.album
          ? { ...song.album, cover_url: fixUrl(song.album.cover_url) }
          : null,
      }));

      setPlaylist(data);
      setSongs(fixedSongs);
    } catch {
      showToast("Không tìm thấy playlist hoặc bạn không có quyền.");
      setPlaylist(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  const handleRemoveSong = async (songId) => {
    if (!window.confirm("Xóa bài hát khỏi playlist?")) return;

    try {
      await removeSongFromPlaylistApi(playlist.id, songId);
      showToast("Đã xóa bài hát!");
      loadPlaylist();
    } catch {
      showToast("Xóa thất bại!");
    }
  };

  const playAll = () => {
    if (songs.length > 0) playTrack(songs[0], songs, 0);
  };

  const isOwner = user && playlist?.user?.id === user.userId;

  if (loading) return <div className="plp-loading">Đang tải playlist...</div>;
  if (!playlist) return <div className="plp-error">Playlist không tồn tại</div>;

  return (
    <div className="plp-wrapper">

      {/* HEADER */}
      <div className="plp-header">

        <div className="plp-cover">
          {playlist.cover_url ? (
            <img src={fixUrl(playlist.cover_url)} />
          ) : (
            <div className="plp-cover-default"><FaPlay size={60}/></div>
          )}
        </div>

        <div className="plp-info">
          <p className="plp-type">PLAYLIST {playlist.is_private && '(RIÊNG TƯ)'}</p>
          <h1 className="plp-title">{playlist.name}</h1>
          <p className="plp-owner">Tạo bởi <b>{playlist.user?.username}</b> • {songs.length} bài hát</p>

          <button className="plp-btn-play" onClick={playAll}>
            <FaPlay/> PHÁT TẤT CẢ
          </button>
        </div>

      </div>

      {/* SONG LIST */}
      <div className="plp-list">
        <SongListTable
          songs={songs}
          onRemoveSong={isOwner ? handleRemoveSong : null}
        />
      </div>

    </div>
  );
};

export default PlaylistDetailPage;
