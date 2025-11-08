// music-frontend/src/pages/AlbumDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAlbumDetailApi } from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
import SongListTable from '../components/SongListTable';
import './AlbumDetailPage.css';
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

                // Fix URL cho ảnh bìa
                data.cover_url = fixUrl(data.cover_url, 'image');

                // Fix URL cho tất cả bài hát
                const fixedSongs = data.songs.map(song => ({
                    ...song,
                    image_url: fixUrl(data.cover_url, 'image'), // Dùng ảnh album
                    cover_url: fixUrl(data.cover_url, 'image'), // SongListTable dùng cover_url
                    file_url: fixUrl(song.file_url, 'audio'),
                    // Đảm bảo có các field cần thiết
                    album: { title: data.title },
                    artist: { stage_name: data.artist?.stage_name || 'Nghệ sĩ' }
                }));

                data.songs = fixedSongs;
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

    const releaseYear = new Date(album.release_date).getFullYear();

    return (
        <div className="album-detail-container">
            {/* HEADER ALBUM */}
            <div className="playlist-header">
                <img src={album.cover_url} alt={album.title} />
                <div className="playlist-info">
                    <p className="playlist-type">ALBUM</p>
                    <h1>{album.title}</h1>
                    <p className="playlist-owner">
                        <span 
                            className="artist-name" 
                            onClick={() => navigate(`/artist/${album.artist?.id}`)}
                            style={{ cursor: 'pointer', color: '#fff' }}
                        >
                            {album.artist?.stage_name || 'Nghệ sĩ'}
                        </span>
                        • {releaseYear} • {album.songs.length} bài hát
                    </p>
                    <button className="playlist-play-button" onClick={handlePlayAll}>
                        <FaPlay size={20} /> PHÁT TẤT CẢ
                    </button>
                </div>
            </div>

            {/* DANH SÁCH BÀI HÁT - DÙNG SongListTable */}
            <div className="song-list-wrapper">
                <SongListTable 
                    songs={album.songs} 
                    onSelectionChange={(selected) => {
                        console.log('Đã chọn:', selected.size, 'bài hát');
                        // Có thể thêm hành động: thêm vào playlist, xóa, v.v.
                    }}
                />
            </div>
        </div>
    );
};

export default AlbumDetailPage;