// music-frontend/src/pages/ArtistDashboard/ArtistSongs.jsx (BẢN SỬA LỖI FINAL)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySongsApi, deleteMySongApi } from '../../utils/api';
import './ArtistDashboard.css'; 
import { FaPlus, FaEdit, FaTrash, FaPlay } from 'react-icons/fa';
import SongFormModal from '../../components/user/SongFormModal'; // <-- (1) IMPORT MODAL MỚI

// (Hàm Toast Helper)
const showToast = (message, type = 'success') => { alert(message); };

// HÀM HELPER: Fix URL (SỬA LỖI NULL AN TOÀN)
const fixUrl = (url, type = 'image') => {
    if (!url || typeof url !== 'string' || url === 'undefined') { 
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


const ArtistSongs = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const [showSongModal, setShowSongModal] = useState(false);
    const [editingSong, setEditingSong] = useState(null); 
    
    const [statusFilter, setStatusFilter] = useState('PENDING'); // Mặc định xem bài chờ duyệt

    const fetchSongs = async () => {
        setLoading(true);
        try {
            const res = await getMySongsApi(statusFilter); 
            
            // Map để fix URL ảnh bìa
            const fixedSongs = res.map(song => {
                const coverUrl = song.image_url || song.album?.cover_url || '/images/default-album.png';
                return ({
                    ...song,
                    cover_url: fixUrl(coverUrl, 'album')
                });
            });

            setSongs(fixedSongs);
        } catch (error) {
            console.error('Lỗi tải Bài hát:', error); 
            showToast('Lỗi khi tải danh sách bài hát.', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSongs();
    }, [statusFilter]); 

    // === (2) HÀM TẠO/SỬA (GỌI MODAL MỚI) ===
    const handleCreate = () => {
        setEditingSong(null); 
        setShowSongModal(true); 
    };

    const handleEdit = (song) => {
        setEditingSong(song); 
        setShowSongModal(true); 
    };
    // ========================================

    const handleDelete = async (songId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa Bài hát này?')) return;
        
        try {
            await deleteMySongApi(songId); 
            showToast('Đã xóa Bài hát thành công.');
            fetchSongs(); 
        } catch (error) {
            showToast(error.response?.data?.message || 'Xóa thất bại', 'error');
        }
    };

    if (loading) return <p>Đang tải Bài hát...</p>;

    return (
        <div className="artist-songs-container">
            <div className="dashboard-section-header">
                <h2>Quản lý Bài hát ({songs.length})</h2>
                <button className="btn-create-new" onClick={handleCreate}>
                    <FaPlus /> Tải lên Bài hát Mới
                </button>
            </div>
            
            {/* === THANH LỌC (FILTER) === */}
            <div className="filter-tabs">
                <button 
                    className={`filter-tab ${statusFilter === 'APPROVED' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('APPROVED')}
                > Đã phát hành </button>
                <button 
                    className={`filter-tab ${statusFilter === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('PENDING')}
                > Chờ duyệt </button>
                <button 
                    className={`filter-tab ${statusFilter === 'REJECTED' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('REJECTED')}
                > Bị từ chối </button>
            </div>

            {/* === DANH SÁCH BÀI HÁT === */}
            <div className="song-list-table-container artist-song-list">
                {/* ... (Header Bảng) ... */}
                <div className="song-table-body">
                    {songs.length > 0 ? (
                        songs.map((song) => (
                            <div key={song.id} className="song-table-row">
                                
                                <div className="col-title" onClick={() => navigate(`/song/${song.id}`)}>
                                    <img src={song.cover_url} alt={song.title} />
                                    <div>
                                        <p className="song-title">{song.title}</p>
                                        <p className="song-row-artist">{song.artist?.stage_name}</p>
                                    </div>
                                </div>
                                
                                <div className="col-album" onClick={() => navigate(`/album/${song.album?.id}`)}>
                                    {song.album?.title || 'Single'}
                                </div>

                                <div className="col-duration">
                                    <div className="card-actions">
                                        {/* Chỉ cho sửa khi không phải là đã được duyệt */}
                                        {song.status !== 'APPROVED' && (
                                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleEdit(song); }}>
                                                <FaEdit />
                                            </button>
                                        )}
                                        <button className="btn-icon btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(song.id); }}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="subtle-text">Không có bài hát nào trong mục này.</p>
                    )}
                </div>
            </div>
            
            {/* === MODAL TẠO/SỬA BÀI HÁT === */}
            {showSongModal && (
                <SongFormModal 
                    onClose={() => setShowSongModal(false)}
                    onComplete={fetchSongs} // Tải lại list khi Tạo/Sửa xong
                    songToEdit={editingSong} 
                />
            )}
        </div>
    );
};

export default ArtistSongs;