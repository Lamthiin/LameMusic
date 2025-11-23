// music-frontend/src/pages/AlbumDetailPage.jsx (BẢN SỬA LỖI FINAL)
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// API
import { fetchAlbumDetailApi, removeSongFromAlbumApi } from '../../utils/api'; 
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext'; 
// Components
import SongListTable from '../../components/user/SongListTable';
import AddSinglesToAlbumModal from '../../components/user/AddSinglesToAlbumModal';
import AlbumFormModal from '../../components/user/AlbumFormModal';
// CSS
import './AlbumDetailPage.css'; 
import '../ArtistDashboard/ArtistDashboard.css'; 
// Icons
import { FaPlay, FaPlus, FaEdit, FaTimes } from 'react-icons/fa'; 

const showToast = (msg) => alert(msg);

// Helper fix URL
const fixUrl = (url, type = 'image') => {
    if (!url) return '/images/default-album.png';
    if (url.startsWith('http')) return url;
    const prefix = type === 'image' ? '/media/images' : '/media/audio';
    return `http://localhost:3000${url.startsWith(prefix) ? url : url.replace(/\/images|\/audio/, prefix)}`;
};

const AlbumDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playTrack } = usePlayer();
    const { user } = useAuth();

    const [album, setAlbum] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Modal state ---
    const [showEditAlbumModal, setShowEditAlbumModal] = useState(false);
    const [showSinglesModal, setShowSinglesModal] = useState(false);
    const [targetAlbum, setTargetAlbum] = useState(null); // album đích để thêm bài

    // Load Album
    const loadAlbum = useCallback(async () => {
        setLoading(true);
        try {
            if (!id) {
                setError('ID Album không hợp lệ.');
                setLoading(false);
                return;
            }
            
            const data = await fetchAlbumDetailApi(id); 
            const albumCoverUrl = fixUrl(data.cover_url, 'image');

            const fixedSongs = (data.songs || []).map(song => ({
                ...song,
                cover_url: song.image_url ? fixUrl(song.image_url, 'image') : albumCoverUrl,
                file_url: fixUrl(song.file_url, 'audio'),
                album: { id: data.id, title: data.title },
                artist: song.artist || data.artist, 
            }));
            
            setAlbum({ ...data, cover_url: albumCoverUrl });
            setSongs(fixedSongs);
        } catch (err) {
            setError('Không thể tải Album.');
            setSongs([]);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadAlbum();
    }, [loadAlbum]);

    // Play tất cả
    const playAll = () => {
        if (songs.length > 0) playTrack(songs[0], songs, 0);
    };

    // Handle modal complete
    const handleModalComplete = () => {
        setShowEditAlbumModal(false);
        setShowSinglesModal(false);
        setTargetAlbum(null);
        loadAlbum();
    };

    // --- Xóa bài hát khỏi Album ---
    const handleRemoveSong = async (songId, songTitle) => {
        if (!window.confirm(`Bạn có chắc muốn xóa "${songTitle}" khỏi Album không? Bài hát sẽ trở thành Single.`)) return;
        
        try {
            await removeSongFromAlbumApi(songId); 
            showToast(`Đã gỡ "${songTitle}" khỏi Album thành công.`);
            loadAlbum();
        } catch (error) {
            showToast(error.response?.data?.message || 'Xóa thất bại.', 'error');
        }
    };

    // --- Check owner ---
    const isOwner = user && album && album.artist?.user?.id === user.userId;

    // --- Mở modal Thêm bài hát ---
    const handleAddSingles = (album) => {
        setTargetAlbum(album);
        setShowSinglesModal(true);
    };

    if (loading) return <div className="loading-message">Đang tải album...</div>;
    if (error || !album) return <div className="error-message">{error || 'Album không tồn tại'}</div>;

    const releaseYear = album.release_date ? new Date(album.release_date).getFullYear() : 'N/A';

    return (
        <div className="album-detail-container">

            {/* HEADER ALBUM */}
            <div className="playlist-header">
                <img src={album.cover_url} alt={album.title} className="album-cover-large" />
                <div className="playlist-info">
                    <p className="playlist-type">ALBUM</p>
                    <h1 className="playlist-title">{album.title}</h1>
                    <p className="playlist-meta">
                        <span
                            className="artist-link"
                            onClick={() => navigate(`/artist/${album.artist?.id}`)}
                            style={{ cursor: 'pointer', color: '#fff' }}
                        >
                            {album.artist?.stage_name || 'Nghệ sĩ'}
                        </span>
                        {' • '}
                        {releaseYear}
                        {' • '}
                        {songs.length} bài hát
                    </p>

                    <div className="album-controls">
                        <button className="play-all-btn" onClick={playAll}>
                            <FaPlay size={24} /> Phát tất cả
                        </button>

                        {isOwner && (
                            <>
                                <button
                                    className="btn-outline"
                                    onClick={() => setShowEditAlbumModal(true)}
                                >
                                    <FaEdit /> Sửa Album
                                </button>

                                <button
                                    className="btn-primary"
                                    onClick={() => handleAddSingles(album)}
                                >
                                    <FaPlus /> Thêm bài hát
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* SONG LIST */}
            <div className="song-list-section">
                <SongListTable 
                    songs={songs} 
                    onRemoveSongFromAlbum={isOwner ? handleRemoveSong : null} 
                />
            </div>

            {/* MODAL THÊM SINGLES */}
            {showSinglesModal && targetAlbum && (
                <AddSinglesToAlbumModal
                    targetAlbumId={targetAlbum.id}
                    targetAlbumTitle={targetAlbum.title}
                    onClose={() => setShowSinglesModal(false)}
                    onComplete={handleModalComplete}
                />
            )}

            {/* MODAL SỬA ALBUM */}
            {showEditAlbumModal && (
                <AlbumFormModal
                    albumToEdit={album}
                    onClose={() => setShowEditAlbumModal(false)}
                    onComplete={handleModalComplete}
                />
            )}
        </div>
    );
};

export default AlbumDetailPage;
