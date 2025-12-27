// src/pages/AllAlbumsPage.jsx – FULL, ĐẸP, CÓ LỌC NGHỆ SĨ

import React, { useState, useEffect, useMemo } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { fetchAllAlbumsApi } from '../../utils/api';
import './AllAlbumPage.css';
import { FaChevronDown, FaTimes } from 'react-icons/fa'; // Icon cho dropdown/reset

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

const AllAlbumsPage = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    // STATE LỌC
    const [selectedArtistId, setSelectedArtistId] = useState(null); 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
    const [currentPage, setCurrentPage] = useState(1);
    const ALBUMS_PER_PAGE = 16;

    
    const navigate = useNavigate();

    useEffect(() => {
        const loadAlbums = async () => {
            setLoading(true);
            try {
                const data = await fetchAllAlbumsApi();
                
                const albumsWithUrls = data.map(album => ({
                    ...album,
                    cover_url: fixUrl(album.cover_url, 'image')
                }));
                
                setAlbums(albumsWithUrls);
            } catch (error) {
                console.error("Lỗi tải Album:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAlbums();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedArtistId]);


    // 1. TÍNH TOÁN DANH SÁCH NGHỆ SĨ DUY NHẤT
    const uniqueArtists = useMemo(() => {
        const artistMap = new Map();
        albums.forEach(album => {
            if (album.artist) {
                artistMap.set(album.artist.id, album.artist);
            }
        });
        return Array.from(artistMap.values()).sort((a, b) => 
            a.stage_name.localeCompare(b.stage_name)
        );
    }, [albums]);

    // 2. LỌC ALBUM DỰA TRÊN NGHỆ SĨ ĐƯỢC CHỌN
    const filteredAlbums = useMemo(() => {
        if (!selectedArtistId) return albums;
        // Chuyển selectedArtistId thành chuỗi để so sánh
        return albums.filter(album => album.artist && String(album.artist.id) === String(selectedArtistId));
    }, [albums, selectedArtistId]);

    const totalPages = Math.ceil(filteredAlbums.length / ALBUMS_PER_PAGE);

    const paginatedAlbums = useMemo(() => {
        const startIndex = (currentPage - 1) * ALBUMS_PER_PAGE;
        return filteredAlbums.slice(startIndex, startIndex + ALBUMS_PER_PAGE);
    }, [filteredAlbums, currentPage]);


    const currentArtist = uniqueArtists.find(a => String(a.id) === String(selectedArtistId));

    const goToAlbumDetail = (id) => {
        navigate(`/album/${id}`);
    };

    if (loading) {
        return <div className="allalbums-loading">Đang tải tất cả Album...</div>;
    }

    return (
        <div className="allalbums-wrapper">
            <h1 className="allalbums-title">Tất cả Album</h1>
            
            {/* --- KHU VỰC LỌC (Lọc theo Nghệ sĩ) --- */}
            <div className="allalbums-filter-area">
                <div 
                    className={`allalbums-artist-select ${isDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} 
                    tabIndex={0}
                >
                    <span className="allalbums-select-label">
                        {currentArtist ? currentArtist.stage_name : 'Lọc theo Nghệ sĩ'}
                    </span>
                    <FaChevronDown size={12} className="allalbums-select-icon" />
                    
                    {isDropdownOpen && (
                        <div className="allalbums-dropdown-menu">
                            {/* Option "Tất cả" */}
                            <div 
                                className="allalbums-dropdown-item"
                                onClick={() => { setSelectedArtistId(null); setIsDropdownOpen(false); }}
                            >
                                Tất cả Album
                            </div>
                            
                            {/* Danh sách Nghệ sĩ */}
                            {uniqueArtists.map(artist => (
                                <div 
                                    key={artist.id}
                                    className={`allalbums-dropdown-item ${String(selectedArtistId) === String(artist.id) ? 'active' : ''}`}
                                    onClick={() => { setSelectedArtistId(artist.id); setIsDropdownOpen(false); }}
                                >
                                    {artist.stage_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Nút Reset Filter */}
                {selectedArtistId && (
                    <button 
                        className="allalbums-reset-btn"
                        onClick={() => setSelectedArtistId(null)}
                    >
                        <FaTimes size={12} /> Xóa bộ lọc
                    </button>
                )}
            </div>
            {/* --- KẾT THÚC KHU VỰC LỌC --- */}

            
            {filteredAlbums.length > 0 ? (
                <>  
                    <div className="allalbums-grid">
                        {paginatedAlbums.map(album => ( 
                            <div 
                                key={album.id} 
                                className="allalbums-card"
                                onClick={() => goToAlbumDetail(album.id)}
                            >
                                <div className="allalbums-cover-wrapper">
                                    <img 
                                        src={album.cover_url} 
                                        alt={album.title}
                                        className="allalbums-cover"
                                    />
                                    <div className="allalbums-play-overlay">
                                        {/* <div className="allalbums-play-icon"></div> */}
                                    </div>
                                </div>
                                <div className="allalbums-info">
                                    <h3 className="allalbums-album-title">{album.title}</h3>
                                    <p className="allalbums-artist-name">
                                        {album.artist?.stage_name || 'Nghệ sĩ'}
                                    </p>
                                    <p className="allalbums-release-year">
                                        {new Date(album.release_date).getFullYear()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* 🔽 PAGINATION BỎ Ở ĐÂY */}
                    {totalPages > 1 && (
                        <div className="allalbums-pagination">
                            <button
                                className="page-arrow"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                ‹
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`page-number ${page === currentPage ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="page-arrow"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                ›
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p className="allalbums-empty">
                    {selectedArtistId ? `Không tìm thấy Album nào của ${currentArtist?.stage_name}.` : "Không tìm thấy Album nào."}
                </p>
            )}
            
            {!loading && albums.length > 0 && (
                <p className="allalbums-count">
                    Hiển thị {filteredAlbums.length} trên tổng số {albums.length} Album.
                </p>
            )}
        </div>
    );
};

export default AllAlbumsPage;