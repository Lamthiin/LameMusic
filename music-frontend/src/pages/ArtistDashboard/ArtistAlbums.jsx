// music-frontend/src/pages/ArtistDashboard/ArtistAlbums.jsx (FULL CODE SỬA LỖI)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// (1) IMPORT API TỪ FILE api.js (KHÔNG PHẢI TẠO MỚI)
import { getMyAlbumsApi, deleteMyAlbumApi } from '../../utils/api'; 
import '../ProfileUser/Profile.css'; 
import './ArtistDashboard.css'; 
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
// (2) IMPORT ĐÚNG TÊN MODAL (AlbumFormModal)
import AlbumFormModal from '../../components/AlbumFormModal'; 

// (Hàm Toast Helper)
const showToast = (message, type = 'success') => { alert(message); };

// HÀM HELPER (BẮT BUỘC)
const fixUrl = (url, type = 'image') => {
    if (!url) { 
        if (type === 'artist') return '/images/default-artist.png';
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

// (ĐÃ XÓA CÁC HÀM API MOCK BỊ LỖI Ở ĐÂY)

const ArtistAlbums = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    // === (3) SỬA STATE ĐỂ QUẢN LÝ MODAL ===
    const [showAlbumModal, setShowAlbumModal] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState(null); // (null = Tạo, Object = Sửa)
    // ======================================

    const fetchAlbums = async () => {
        setLoading(true);
        try {
            const res = await getMyAlbumsApi(); // <-- (4) GỌI API ĐÚNG
            const fixedAlbums = res.map(album => ({
                ...album,
                cover_url: fixUrl(album.cover_url, 'album')
            }));
            setAlbums(fixedAlbums);
        } catch (error) {
            showToast('Lỗi khi tải danh sách Album', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    // (Hàm Tạo/Sửa)
    const handleCreate = () => {
        setEditingAlbum(null); 
        setShowAlbumModal(true); 
    };

    const handleEdit = (album) => {
        setEditingAlbum(album); 
        setShowAlbumModal(true); 
    };

    // (Hàm Xóa)
    const handleDelete = async (albumId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa Album này? (Bài hát sẽ bị mất liên kết)')) return;
        
        try {
            await deleteMyAlbumApi(albumId); // <-- (4) GỌI API ĐÚNG
            showToast('Đã xóa Album thành công.');
            fetchAlbums(); 
        } catch (error) {
            showToast(error.response?.data?.message || 'Xóa thất bại', 'error');
        }
    };

    if (loading) return <p>Đang tải Album...</p>;

    return (
        <div className="artist-albums-container">
            <div className="dashboard-section-header">
                <h2>Quản lý Album ({albums.length})</h2>
                <button className="btn-create-new" onClick={handleCreate}>
                    <FaPlus /> Tạo Album Mới
                </button>
            </div>
            
            <div className="playlist-grid">
                {albums.length > 0 ? (
                    albums.map(album => (
                        <div key={album.id} className="card playlist-card">
                            <img 
                                src={album.cover_url} 
                                alt={album.title} 
                                className="card-image"
                                onClick={() => navigate(`/album/${album.id}`)}
                            />
                            <h4 className="card-title">{album.title}</h4>
                            <p className="card-subtitle">{new Date(album.release_date).getFullYear()}</p>
                            
                            <div className="card-actions">
                                <button className="btn-icon" onClick={() => handleEdit(album)}> 
                                    <FaEdit />
                                </button>
                                <button className="btn-icon btn-danger" onClick={() => handleDelete(album.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="subtle-text">Bạn chưa tạo Album nào.</p>
                )}
            </div>
            
            {/* === (5) HIỂN THỊ ĐÚNG TÊN MODAL === */}
            {showAlbumModal && (
                <AlbumFormModal 
                    onClose={() => setShowAlbumModal(false)}
                    onComplete={fetchAlbums} 
                    albumToEdit={editingAlbum} 
                />
            )}
        </div>
    );
};

export default ArtistAlbums;