import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllSongs, fetchAllArtists, fetchCategories } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import './AllSongsPage.css';
import { FaPlay, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const SONGS_PER_PAGE = 30;

const fixImageUrl = (url, type = 'image') => {
    if (!url) { 
        if (type === 'artist') return '/images/default-artist.png';
        if (type === 'genre') return '/images/genre-default.jpg';
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

const AllSongsPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filterArtistId, setFilterArtistId] = useState('');
  const [filterGenre, setFilterGenre] = useState('');

  const { playTrack } = usePlayer();
  const navigate = useNavigate();

  // Load bộ lọc
  useEffect(() => {
    const loadFilters = async () => {
      const [artistData, genreData] = await Promise.all([fetchAllArtists(), fetchCategories()]);
      setArtists(artistData.map(a => ({ ...a, avatar_url: fixImageUrl(a.avatar_url, 'artist') })));
      setGenres(genreData);
    };
    loadFilters();
  }, []);

  // Load bài hát
  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      const data = await fetchAllSongs(filterGenre, filterArtistId);
      const songsWithUrls = data.map(song => {
        if (song.album) song.album.cover_url = fixImageUrl(song.album.cover_url, 'album');
        return {
          ...song,
          image_url: song.image_url ? fixImageUrl(song.image_url, 'song') : null,
          file_url: fixImageUrl(song.file_url, 'audio')
        };
      });
      setSongs(songsWithUrls);
      setLoading(false);
      setCurrentPage(1); // reset page khi filter thay đổi
    };
    loadSongs();
  }, [filterArtistId, filterGenre]);

  // Phân trang
  const totalPages = Math.ceil(songs.length / SONGS_PER_PAGE);
  const currentSongs = songs.slice(
    (currentPage - 1) * SONGS_PER_PAGE,
    currentPage * SONGS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="all-songs-container">
      <h1>Tất cả Bài hát</h1>

      {/* Filter */}
      <div className="filter-bar">
        <select value={filterArtistId} onChange={e => setFilterArtistId(e.target.value)}>
          <option value="">Lọc theo nghệ sĩ</option>
          {artists.map(a => <option key={a.id} value={a.id}>{a.stage_name}</option>)}
        </select>
        <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)}>
          <option value="">Lọc theo thể loại</option>
          {genres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
        </select>
        <button onClick={() => { setFilterArtistId(''); setFilterGenre(''); }}>Xóa Lọc</button>
      </div>

      {/* Danh sách bài hát */}
      {loading ? (
        <p className="loading-message">Đang tải bài hát...</p>
      ) : (
        <>
          <div className="track-list">
            {currentSongs.length > 0 ? (
              currentSongs.map(song => (
                <div key={song.id} className="track-item" onClick={() => navigate(`/song/${song.id}`)}>
                  <div className="track-image-container">
                    <img src={song.image_url || song.album?.cover_url} alt={song.title} className="track-image" />
                    <button 
                      className="play-button"
                      onClick={e => { e.stopPropagation(); playTrack(song, songs, songs.findIndex(s => s.id === song.id)); }}
                    >
                      <FaPlay />
                    </button>
                  </div>
                  <p className="track-title">{song.title}</p>
                  <p className="track-artist">{song.artist?.stage_name || 'Nghệ sĩ'}</p>
                </div>
              ))
            ) : <p className="home-subtitle">Không tìm thấy bài hát nào.</p>}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => goToPage(currentPage-1)} disabled={currentPage===1}><FaChevronLeft /></button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i+1} 
                  className={currentPage === i+1 ? 'active' : ''}
                  onClick={() => goToPage(i+1)}
                >
                  {i+1}
                </button>
              ))}
              <button onClick={() => goToPage(currentPage+1)} disabled={currentPage===totalPages}><FaChevronRight /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllSongsPage;
