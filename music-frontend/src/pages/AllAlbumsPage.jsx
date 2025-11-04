// music-frontend/src/pages/AllAlbumsPage.jsx (TẠO MỚI)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllAlbumsApi } from '../utils/api';
import './AllAlbumPage.css'; // Dùng chung CSS cho trang All

// HÀM HELPER (BẮT BUỘC)
const fixUrl = (url, type = 'image') => {
    if (!url) return '/images/default-album.png'; 
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
                
                // Fix URL cho tất cả Album
                const albumsWithUrls = data.map(album => ({
                    ...album,
                    cover_url: fixUrl(album.cover_url, 'album')
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
        return <p className="loading-message">Đang tải tất cả Album...</p>;
    }

    return (
        <div className="all-pages-container">
            <h1>Tất cả Album</h1>
            
            <div className="album-grid-full"> {/* Class mới (sẽ style trong AllPages.css) */}
                {albums.length > 0 ? (
                    albums.map(album => (
                        <div 
                            key={album.id} 
                            className="album-card"
                            onClick={() => goToAlbumDetail(album.id)}
                        >
                            <img src={album.cover_url} alt={album.title} />
                            <div className="album-card-info">
                                <p className="album-title">{album.title}</p>
                                <p className="album-artist">{album.artist?.stage_name || 'Nghệ sĩ'}</p>
                                <p className="album-year">{new Date(album.release_date).getFullYear()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="home-subtitle">Không tìm thấy Album nào.</p>
                )}
            </div>
        </div>
    );
};

export default AllAlbumsPage;