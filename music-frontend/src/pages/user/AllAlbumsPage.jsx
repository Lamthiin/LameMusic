// src/pages/AllAlbumsPage.jsx – FULL, ĐẸP, KHÔNG TRÙNG CLASS
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllAlbumsApi } from '../../utils/api';
import './AllAlbumPage.css';

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

    const goToAlbumDetail = (id) => {
        navigate(`/album/${id}`);
    };

    if (loading) {
        return <div className="allalbums-loading">Đang tải tất cả Album...</div>;
    }

    return (
        <div className="allalbums-wrapper">
            <h1 className="allalbums-title">Tất cả Album</h1>
            
            {albums.length > 0 ? (
                <div className="allalbums-grid">
                    {albums.map(album => (
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
            ) : (
                <p className="allalbums-empty">Không tìm thấy Album nào.</p>
            )}
        </div>
    );
};

export default AllAlbumsPage;