// music-frontend/src/pages/ArtistDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, checkFollowStatusApi, toggleFollowApi } from '../../utils/api';
import './ArtistDetail.css';
import { FaPlay, FaHeart } from 'react-icons/fa';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import SongListTable from '../../components/user/SongListTable';

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const { isAuthenticated } = useAuth();

  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const calculateAge = (birthYear) => {
    if (!birthYear) return 'Không rõ';
    const year = parseInt(birthYear);
    if (isNaN(year)) return 'Không rõ';
    return new Date().getFullYear() - year;
  };

  const fixUrl = (url, type = 'image') => {
    if (!url) {
      if (type === 'artist') return '/images/default-artist.png';
      if (type === 'audio') return '';
      return '/images/default-album.png';
    }
    if (url.startsWith('http')) return url;
    const prefix = type === 'image' ? '/media/images' : '/media/audio';
    const originalPath = type === 'image' ? '/images' : '/audio';
    if (url.startsWith(prefix)) return `http://localhost:3000${url}`;
    return `http://localhost:3000${url.replace(originalPath, prefix)}`;
  };

  useEffect(() => {
    const loadArtist = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/artists/${id}`);
        const artistData = response.data;

        artistData.avatar_url = fixUrl(artistData.avatar_url, 'artist');

        if (artistData.albums) {
          artistData.albums = artistData.albums.map(album => ({
            ...album,
            cover_url: fixUrl(album.cover_url, 'image')
          }));
        }

        if (artistData.songArtists) {
          const songs = artistData.songArtists
            .map(sa => sa.song)
            .filter(Boolean)
            .map(song => ({
              ...song,
              file_url: fixUrl(song.file_url, 'audio'),
              image_url: fixUrl(song.image_url || song.album?.cover_url, 'image'),
              album: song.album
                ? { ...song.album, cover_url: fixUrl(song.album.cover_url, 'image') }
                : null,
              artists: song.songArtists?.map(sa => sa.artist) || [artistData], // <-- tất cả artist
            }));

          artistData.songs = songs;
        } else {
          artistData.songs = [];
        }

        setArtist(artistData);
      } catch (err) {
        setError('Không tìm thấy nghệ sĩ này.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArtist();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && artist) {
      const checkStatus = async () => {
        const res = await checkFollowStatusApi(artist.id);
        setIsFollowing(res.isFollowing);
      };
      checkStatus();
    } else {
      setIsFollowing(false);
    }
  }, [isAuthenticated, artist]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setFollowLoading(true);
    try {
      const response = await toggleFollowApi(artist.id);
      setIsFollowing(response.isFollowing);
      window.dispatchEvent(new CustomEvent('followStatusChanged'));
    } catch (error) {
      alert(error.response?.data?.message || 'Đã xảy ra lỗi');
    }
    setFollowLoading(false);
  };

  const playArtistSongs = () => {
    const songs = artist?.songs || [];
    if (songs.length > 0) playTrack(songs[0], songs, 0);
  };

  if (loading) return <div className="artist-detail-loading">Đang tải thông tin nghệ sĩ...</div>;
  if (error || !artist) return <div className="artist-detail-error">{error || 'Nghệ sĩ không tồn tại.'}</div>;

  const songs = artist?.songs || [];
  const albums = artist?.albums || [];

  return (
    <div className="artist-detail-page">
      <div className="artist-detail-header">
        <img src={artist.avatar_url} alt={artist.stage_name} className="artist-detail-avatar" />
        <div className="artist-detail-info">
          <p className="artist-detail-type">NGHỆ SĨ</p>
          <h1 className="artist-detail-name">{artist.stage_name}</h1>
          <p className="artist-detail-stats">
            Tuổi: <strong>{calculateAge(artist.user?.birth_year)}</strong> • 
            Bài hát: <strong>{songs.length}</strong> • 
            Album: <strong>{albums.length}</strong>
          </p>
          <p className="artist-detail-bio">{artist.bio || 'Chưa có thông tin giới thiệu.'}</p>
          <div className="artist-detail-controls">
            <button className="artist-detail-play-btn" onClick={playArtistSongs}>
              <FaPlay size={20} /> PHÁT TẤT CẢ
            </button>
            <button
              className={`artist-detail-follow-btn ${isFollowing ? 'active' : ''}`}
              onClick={handleToggleFollow}
              disabled={followLoading}
            >
              <FaHeart size={18} />
              {followLoading ? '...' : (isFollowing ? 'ĐANG THEO DÕI' : 'THEO DÕI')}
            </button>
          </div>
        </div>
      </div>

      <div className="artist-detail-songs-section">
        <h3 className="artist-detail-songs-title">Bài hát nổi bật</h3>
        {songs.length > 0 ? (
          <SongListTable 
            songs={songs.map(song => ({
              ...song,
              artistNames: song.artists.map(a => a.stage_name).join(', ') // <-- thêm hiển thị nhiều nghệ sĩ
            }))} 
          />
        ) : (
          <p className="artist-detail-no-songs">Nghệ sĩ này chưa có bài hát nào.</p>
        )}
      </div>

      <h2 className="artist-detail-albums-title">Albums</h2>
      <div className="artist-detail-album-grid">
        {albums.map(album => (
          <div
            key={album.id}
            className="artist-detail-album-card"
            onClick={() => navigate(`/album/${album.id}`)}
          >
            <img src={album.cover_url} alt={album.title} className="artist-detail-album-cover" />
            <p className="artist-detail-album-title">{album.title}</p>
            <p className="artist-detail-album-year">{new Date(album.release_date).getFullYear()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistDetail;
