// src/pages/AlbumDetailPage.jsx – FULL, ĐẸP, KHÔNG TRÙNG CLASS
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAlbumDetailApi, removeSongFromAlbumApi } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import SongListTable from '../../components/user/SongListTable';
import AddSinglesToAlbumModal from '../../components/user/AddSinglesToAlbumModal';
import AlbumFormModal from '../../components/user/AlbumFormModal';
import './AlbumDetailPage.css';
import { FaPlay, FaPlus, FaEdit } from 'react-icons/fa';

const showToast = (msg) => alert(msg);

const fixUrl = (url, type = 'image') => {
    if (!url) {
        if (type === 'artist') return '/images/default-artist.png';
        if (type === 'audio') return '';
        return '/images/default-album.png';
    }
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

    const [showEditAlbumModal, setShowEditAlbumModal] = useState(false);
    const [showSinglesModal, setShowSinglesModal] = useState(false);
    const [targetAlbum, setTargetAlbum] = useState(null);

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
                image_url: fixUrl(song.image_url || song.album?.cover_url, 'image'),
                file_url: fixUrl(song.file_url, 'audio'),
                artist: song.artist
                    ? { ...song.artist, avatar_url: fixUrl(song.artist.avatar_url, 'artist') }
                    : data.artist
                    ? { ...data.artist, avatar_url: fixUrl(data.artist.avatar_url, 'artist') }
                    : null,
                album: { id: data.id, title: data.title },
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

    useEffect(() => { loadAlbum(); }, [loadAlbum]);

    const playAll = () => { if (songs.length > 0) playTrack(songs[0], songs, 0); };

    const handleModalComplete = () => {
        setShowEditAlbumModal(false);
        setShowSinglesModal(false);
        setTargetAlbum(null);
        loadAlbum();
    };

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

    const isOwner = user && album && album.artist?.user?.id === user.userId;

    const handleAddSingles = (album) => {
        setTargetAlbum(album);
        setShowSinglesModal(true);
    };

    if (loading) return <div className="album-detail-loading">Đang tải album...</div>;
    if (error || !album) return <div className="album-detail-error">{error || 'Album không tồn tại'}</div>;

    const releaseYear = album.release_date ? new Date(album.release_date).getFullYear() : 'N/A';

    return (
        <div className="album-detail-wrapper">
            {/* HEADER ALBUM */}
            <div className="album-detail-header">
                <img src={album.cover_url} alt={album.title} className="album-detail-cover" />
                <div className="album-detail-info">
                    <p className="album-detail-type">ALBUM</p>
                    <h1 className="album-detail-title">{album.title}</h1>
                    <p className="album-detail-meta">
                        <span
                            className="album-detail-artist"
                            onClick={() => navigate(`/artist/${album.artist?.id}`)}
                        >
                            {album.artist?.stage_name || 'Nghệ sĩ'}
                        </span>
                        {' • '}
                        {releaseYear}
                        {' • '}
                        {songs.length} bài hát
                    </p>

                    <div className="album-detail-controls">
                        <button className="album-detail-play-all" onClick={playAll}>
                            <FaPlay size={24} /> Phát tất cả
                        </button>

                        {isOwner && (
                            <>
                                <button
                                    className="album-detail-btn-edit"
                                    onClick={() => setShowEditAlbumModal(true)}
                                >
                                    <FaEdit /> Sửa Album
                                </button>

                                <button
                                    className="album-detail-btn-add"
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
            <div className="album-detail-songs">
                <SongListTable 
                    songs={songs} 
                    onRemoveSongFromAlbum={isOwner ? handleRemoveSong : null} 
                />
            </div>

            {showSinglesModal && targetAlbum && (
                <AddSinglesToAlbumModal
                    targetAlbumId={targetAlbum.id}
                    targetAlbumTitle={targetAlbum.title}
                    onClose={() => setShowSinglesModal(false)}
                    onComplete={handleModalComplete}
                />
            )}

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