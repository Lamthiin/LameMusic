// src/pages/AllArtistsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllArtists } from '../../utils/api';
import './AllArtistsPage.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ARTISTS_PER_PAGE = 30;

const AllArtistsPage = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const loadArtists = async () => {
      setLoading(true);
      const data = await fetchAllArtists();
      const fixed = data.map(a => ({
        ...a,
        avatar_url: `http://localhost:3000${a.avatar_url?.replace('/images', '/media/images') || '/images/default-artist.png'}`
      }));
      setArtists(fixed);
      setLoading(false);
    };
    loadArtists();
  }, []);

  const totalPages = Math.ceil(artists.length / ARTISTS_PER_PAGE);
  const currentArtists = artists.slice(
    (currentPage - 1) * ARTISTS_PER_PAGE,
    currentPage * ARTISTS_PER_PAGE
  );

  const goToPage = (p) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="all-pages-container">
      <div className="page-header">
        <h1>Tất cả Nghệ sĩ</h1>
        <span className="count-badge">{artists.length} nghệ sĩ</span>
      </div>

      {loading ? (
        <div className="loading-artist">
          <div className="spinner"></div>
          <p>Đang tải nghệ sĩ...</p>
        </div>
      ) : (
        <>
          <div className="artist-grid-new">
            {currentArtists.map(artist => (
              <div
                key={artist.id}
                className="artist-card-new"
                onClick={() => navigate(`/artist/${artist.id}`)}
              >
                <div className="artist-img-box">
                  <img src={artist.avatar_url} alt={artist.stage_name} />
                  <div className="play-hint">
                  </div>
                </div>
                <div className="artist-text">
                  <h3>{artist.stage_name}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* PHÂN TRANG SIÊU ĐẸP */}
          {totalPages > 1 && (
            <div className="pagination-new">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                <FaChevronLeft />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let n = i + 1;
                if (totalPages > 5 && currentPage > 3) n = currentPage - 2 + i;
                if (n > totalPages) n = totalPages;
                return n <= totalPages ? (
                  <button
                    key={n}
                    onClick={() => goToPage(n)}
                    className={currentPage === n ? 'active' : ''}
                  >
                    {n}
                  </button>
                ) : null;
              })}
              {totalPages > 5 && <span>...</span>}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllArtistsPage;