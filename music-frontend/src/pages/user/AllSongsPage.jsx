// src/pages/AllSongsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllSongs, fetchAllArtists, fetchCategories } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import './AllSongsPage.css';
import { FaPlay, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PER_PAGE = 30;

const fixImageUrl = (url, type='image') => {
    if (!url) return '/images/default-album.png';
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
};

const AllSongsPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);

  const [filterArtist, setFilterArtist] = useState('');
  const [filterGenre, setFilterGenre] = useState('');

  const [page, setPage] = useState(1);

  const { playTrack } = usePlayer();
  const navigate = useNavigate();

  // Load filter data
  useEffect(() => {
      const load = async () => {
          setArtists(await fetchAllArtists());
          setGenres(await fetchCategories());
      };
      load();
  }, []);

  // Load songs
  useEffect(() => {
      const loadSongs = async () => {
          setLoading(true);
          const data = await fetchAllSongs(filterGenre, filterArtist);

          setSongs(data.map(song => ({
              ...song,
              image_url: fixImageUrl(song.image_url),
              album: song.album ? {
                  ...song.album,
                  cover_url: fixImageUrl(song.album.cover_url)
              } : null
          })));

          setPage(1);
          setLoading(false);
      };
      loadSongs();
  }, [filterArtist, filterGenre]);

  const totalPages = Math.ceil(songs.length / PER_PAGE);

  const pageSongs = songs.slice(
      (page - 1) * PER_PAGE,
      page * PER_PAGE
  );

  return (
    <div className="songs-wrapper">

        <h1 className="songs-title">Tất cả bài hát</h1>

        {/* FILTER BAR */}
        <div className="songs-filter">

            <select 
                value={filterArtist} 
                onChange={e => setFilterArtist(e.target.value)}
            >
                <option value="">Lọc theo nghệ sĩ</option>
                {artists.map(a => (
                    <option key={a.id} value={a.id}>{a.stage_name}</option>
                ))}
            </select>

            <select
                value={filterGenre}
                onChange={e => setFilterGenre(e.target.value)}
            >
                <option value="">Lọc theo thể loại</option>
                {genres.map(g => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                ))}
            </select>

            <button 
                className="btn-reset"
                onClick={() => {
                  setFilterArtist('');
                  setFilterGenre('');
                }}
            >
                Xóa lọc
            </button>
        </div>

        {/* SONG LIST */}
        {loading ? (
            <p className="songs-loading">Đang tải bài hát...</p>
        ) : (
            <>
                <div className="songs-grid">

                    {pageSongs.map(song => (
                        <div 
                            className="song-card" 
                            key={song.id}
                            onClick={() => navigate(`/song/${song.id}`)}
                        >
                            <div className="song-img-box">

                                <img 
                                    src={song.image_url || song.album?.cover_url} 
                                    alt={song.title} 
                                />

                                <button
                                    className="song-play"
                                    onClick={e => {
                                        e.stopPropagation();
                                        playTrack(song, songs, songs.indexOf(song));
                                    }}
                                >
                                    <FaPlay />
                                </button>

                            </div>

                            <p className="song-name">{song.title}</p>
                            <p className="song-artist">{song.artist?.stage_name || "Nghệ sĩ"}</p>
                        </div>
                    ))}

                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="songs-pagination">

                        <button disabled={page===1} onClick={() => setPage(page-1)}>
                            <FaChevronLeft />
                        </button>

                        {Array.from({length: totalPages}).map((_,i)=>(
                            <button
                                key={i}
                                className={page===i+1?'active':''}
                                onClick={() => setPage(i+1)}
                            >
                                {i+1}
                            </button>
                        ))}

                        <button disabled={page===totalPages} onClick={() => setPage(page+1)}>
                            <FaChevronRight />
                        </button>

                    </div>
                )}

            </>
        )}

    </div>
  );
};

export default AllSongsPage;
