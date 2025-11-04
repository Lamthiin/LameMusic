// music-frontend/src/pages/AlbumDetailPage.jsx (TẠO MỚI)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAlbumDetailApi } from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
// import '../pages/LikedSongsPage.css'; // Dùng chung style list nhạc
import './AlbumDetailPage.css'; // CSS riêng cho album
import { FaPlay } from 'react-icons/fa';

// HÀM HELPER (BẮT BUỘC)
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

const AlbumDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playTrack } = usePlayer();
    
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadAlbum = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchAlbumDetailApi(id); 
                
                // === FIX URL CHO TOÀN BỘ ALBUM ===
                data.cover_url = fixUrl(data.cover_url, 'album');
                
                // Fix URL cho từng bài hát (cho Player)
                const fixedSongs = data.songs.map(song => ({
                    ...song,
                    // Giả sử ảnh bài hát mặc định là ảnh album
                    image_url: fixUrl(data.cover_url, 'image'), 
                    file_url: fixUrl(song.file_url, 'audio')
                }));
                data.songs = fixedSongs;
                // =================================

                setAlbum(data);
            } catch (err) {
                setError('Không tìm thấy Album này.');
            } finally {
                setLoading(false);
            }
        };
        loadAlbum();
    }, [id]);

    const handlePlayAll = () => {
        if (album?.songs?.length > 0) {
            playTrack(album.songs[0], album.songs, 0);
        }
    };
    
    if (loading) return <div className="loading-message">Đang tải Album...</div>;
    if (error || !album) return <div className="error-message">{error}</div>;

    const songs = album.songs || [];
    const releaseYear = new Date(album.release_date).getFullYear();

    return (
        <div className="album-detail-container">
            
            {/* 1. HEADER ALBUM */}
            <div className="playlist-header"> {/* Tái sử dụng class playlist-header */}
                <img src={album.cover_url} alt={album.title} />
                <div className="playlist-info">
                    <p className="playlist-type">ALBUM</p>
                    <h1>{album.title}</h1>
                    <p className="playlist-owner">
                        <span className="artist-name" onClick={() => navigate(`/artist/${album.artist?.id}`)}>
                            {album.artist?.stage_name || 'Nghệ sĩ'}
                        </span> 
                        • {releaseYear} • {songs.length} bài hát
                    </p>
                    <button className="playlist-play-button" onClick={handlePlayAll}>
                        <FaPlay size={20} /> PHÁT TẤT CẢ
                    </button>
                </div>
            </div>

            {/* 2. DANH SÁCH BÀI HÁT */}
            <div className="song-list-detail"> {/* Tái sử dụng style */}
                {songs.length > 0 ? (
                    songs.map((song, index) => (
                        // Tái sử dụng SongListTable style (Nếu không có SongListTable)
                        <div key={song.id} className="song-row" onClick={() => playTrack(song, songs, index)}>
                            <div className="song-title-col">
                                <span>{index + 1}.</span>
                                <img src={song.image_url} alt={song.title} />
                                <div>
                                    <p className="song-row-title">{song.title}</p>
                                    <p className="song-row-artist">{song.artist?.stage_name || album.artist?.stage_name}</p>
                                </div>
                            </div>
                            {/* Bạn có thể thêm cột thời gian ở đây nếu có data */}
                        </div>
                    ))
                ) : (
                    <p className="subtle-text">Album này chưa có bài hát nào.</p>
                )}
            </div>
        </div>
    );
};

export default AlbumDetailPage;