// music-frontend/src/pages/ArtistDashboard/ArtistAlbums.jsx (BẢN SỬA LỖI FINAL)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyAlbumsApi, deleteMyAlbumApi } from '../../utils/api'; 
import '../ProfileUser/Profile.css'; 
import './ArtistDashboard.css'; 
import { FaPlus, FaEdit, FaTrash, FaMusic } from 'react-icons/fa';
import AlbumFormModal from '../../components/user/AlbumFormModal'; 
import AddSinglesToAlbumModal from '../../components/user/AddSinglesToAlbumModal'; // <-- (1) IMPORT MODAL MỚI

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


const ArtistAlbums = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    // === (2) STATE CHO MODAL ALBUM VÀ SONG ===
    const [showAlbumModal, setShowAlbumModal] = useState(false); // Modal Tạo/Sửa Album
    const [editingAlbum, setEditingAlbum] = useState(null); 
    
    // STATE MỚI: Dùng cho việc Thêm Singles vào Album cụ thể
    const [showAddSinglesModal, setShowAddSinglesModal] = useState(false); 
    const [targetAlbum, setTargetAlbum] = useState(null); // Lưu Album đang được chọn để thêm bài
    // ======================================

    const fetchAlbums = async () => {
        setLoading(true);
        try {
            const res = await getMyAlbumsApi(); 
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


    // HÀM: Mở modal Tạo Album
    const handleCreateAlbum = () => {
        setEditingAlbum(null);
        setShowAlbumModal(true);
    };

    // HÀM: Mở modal Sửa Album
    const handleEdit = (album) => {
        setEditingAlbum(album);
        setShowAlbumModal(true);
    };

    // HÀM MỚI: Mở modal Thêm Singles
    const handleAddSingles = (album) => {
        setTargetAlbum(album); // Đặt album đích
        setShowAddSinglesModal(true); // <-- (3) MỞ MODAL
    };
    
    // Hàm tải lại danh sách (sau khi Album/Song được tạo/sửa)
    const handleComplete = () => {
        setShowAlbumModal(false);
        setShowAddSinglesModal(false); // Đóng Modal Singles
        fetchAlbums();
    };

    // Xử lý Xóa (Giữ nguyên)
    const handleDelete = async (albumId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa Album này? (Bài hát sẽ bị mất liên kết)')) return;
        
        try {
            await deleteMyAlbumApi(albumId); 
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
                
                {/* NÚT TẠO ALBUM */}
                <button className="btn-create-new" onClick={handleCreateAlbum}>
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
                                
                                {/* === (4) NÚT THÊM BÀI HÁT === */}
                                <button 
                                    className="btn-icon btn-add-song" 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        handleAddSingles(album); // <-- GỌI HÀM MỚI
                                    }}
                                    title="Thêm bài hát vào Album"
                                >
                                    <FaMusic />
                                </button>
                                {/* ========================== */}

                                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleEdit(album); }}> 
                                    <FaEdit />
                                </button>
                                <button className="btn-icon btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(album.id); }}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="subtle-text">Bạn chưa tạo Album nào.</p>
                )}
            </div>
            
            {/* === (5) MODAL TẠO/SỬA ALBUM === */}
            {showAlbumModal && (
                <AlbumFormModal 
                    onClose={() => setShowAlbumModal(false)}
                    onComplete={handleComplete} 
                    albumToEdit={editingAlbum} 
                />
            )}

            {/* === (6) MODAL THÊM SINGLES VÀO ALBUM === */}
            {showAddSinglesModal && targetAlbum && (
                <AddSinglesToAlbumModal 
                    onClose={() => setShowAddSinglesModal(false)}
                    onComplete={handleComplete} 
                    targetAlbum={targetAlbum} // Truyền Album đích
                />
            )}
        </div>
    );
};

export default ArtistAlbums;