import React, { useEffect, useState, useCallback } from 'react';
import { fetchMyPlaylists, deleteMyPlaylistApi } from '../../utils/api'; 
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { FaLock, FaGlobe, FaTrash, FaPlus } from 'react-icons/fa';
import CreatePlaylistModal from '../../components/CreatePlaylistModal';

const showToast = (message, type = 'success') => { alert(message); };
const fixUrl = (url) => { 
    if (!url) return '/images/default-album.png';
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url.replace('/images', '/media/images')}`;
};

const ProfilePlaylists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
    const navigate = useNavigate();

    const loadPlaylists = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchMyPlaylists();
            setPlaylists(response || []);
        } catch (error) {
            console.error("Lỗi tải playlist:", error);
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => { loadPlaylists(); }, [loadPlaylists]);

    const handleCreatePlaylist = () => setIsCreateModalOpen(true);

    const handlePlaylistCreated = () => {
        setIsCreateModalOpen(false);
        loadPlaylists();
    };

    const handleDelete = async (e, playlistId, playlistName) => {
        e.stopPropagation();
        if (!window.confirm(`Bạn có chắc chắn muốn xóa playlist "${playlistName}"?`)) return;
        try {
            await deleteMyPlaylistApi(playlistId);
            showToast(`Playlist "${playlistName}" đã được xóa.`);
            loadPlaylists();
        } catch (error) {
            showToast(error.response?.data?.message || 'Xóa thất bại.', 'error');
        }
    };

    if (loading) return <div className="pp-loading">Đang tải playlist của bạn...</div>;

    return (
        <div className="pp-container">
            <div className="pp-header">
                <h2>Playlists Của Bạn ({playlists.length})</h2>
                <button className="pp-btn-create" onClick={handleCreatePlaylist}>
                    <FaPlus /> Tạo Playlist Mới
                </button>
            </div>

            <div className="pp-grid">
                {playlists.length > 0 ? (
                    playlists.map(pl => (
                        <div 
                            key={pl.id} 
                            className="pp-card"
                            onClick={() => navigate(`/playlist/${pl.id}`)}
                        >
                            <span className="pp-privacy-icon">
                                {pl.is_private ? <FaLock size={12} title="Riêng tư" /> : <FaGlobe size={12} title="Công khai" />}
                            </span>

                            <div className="pp-card-info">
                                <p className="pp-title">{pl.name}</p>
                               0
                            </div>

                            <button 
                                className="pp-btn-delete"
                                onClick={(e) => handleDelete(e, pl.id, pl.name)}
                                title="Xóa playlist"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="pp-subtle">Bạn chưa tạo playlist nào.</p>
                )}
            </div>

            {isCreateModalOpen && (
                <CreatePlaylistModal 
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onPlaylistCreated={handlePlaylistCreated}
                />
            )}
        </div>
    );
};

export default ProfilePlaylists;
