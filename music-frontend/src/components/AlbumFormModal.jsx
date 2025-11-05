// music-frontend/src/components/AlbumFormModal.jsx (FULL CODE NÂNG CẤP)
import React, { useState, useEffect } from 'react';
import { createAlbumApi, updateAlbumApi } from '../utils/api'; // (1) Import cả 2 API
import './ChangePasswordModal.css'; 
import '../pages/ArtistDashboard/ArtistDashboard.css'; 
import { FaTimes } from 'react-icons/fa';

// (Hàm Toast Helper)
const showToast = (message, type = 'success') => { alert(message); };

// (2) NHẬN ALBUM CẦN SỬA (albumToEdit)
const AlbumFormModal = ({ onClose, onComplete, albumToEdit }) => {
    
    // (3) KIỂM TRA CHẾ ĐỘ (MODE)
    const isEditMode = Boolean(albumToEdit); 

    const [title, setTitle] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [coverFile, setCoverFile] = useState(null);
    const [preview, setPreview] = useState('/images/default-album.png');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // (4) TỰ ĐỘNG ĐIỀN FORM NẾU LÀ CHẾ ĐỘ SỬA
    useEffect(() => {
        if (isEditMode) {
            setTitle(albumToEdit.title);
            // Cần format lại Date (YYYY-MM-DD)
            setReleaseDate(new Date(albumToEdit.release_date).toISOString().split('T')[0]);
            setPreview(albumToEdit.cover_url); // Dùng URL đã fix từ trang cha
        }
    }, [isEditMode, albumToEdit]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // (Bỏ 'coverFile' khỏi required khi Edit, vì user có thể chỉ sửa tên)
        if (!title || !releaseDate) {
            setError('Vui lòng điền Tiêu đề và Ngày phát hành.');
            return;
        }

        setLoading(true);
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('release_date', releaseDate);
        if (coverFile) { // Chỉ thêm file nếu user chọn file mới
            formData.append('coverFile', coverFile); 
        }

        try {
            if (isEditMode) {
                // === CHẠY API SỬA ===
                await updateAlbumApi(albumToEdit.id, formData);
                showToast('Cập nhật Album thành công!');
            } else {
                // === CHẠY API TẠO ===
                await createAlbumApi(formData);
                showToast('Tạo Album mới thành công!');
            }
            onComplete(); // Tải lại danh sách
            onClose(); // Đóng modal
        } catch (err) {
            setError(err.response?.data?.message || (isEditMode ? 'Sửa thất bại' : 'Tạo thất bại'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
                
                {/* (5) ĐỔI TIÊU ĐỀ TÙY THEO MODE */}
                <h2>{isEditMode ? 'Sửa Album' : 'Tạo Album Mới'}</h2>
                
                <form className="profile-edit-form" onSubmit={handleSubmit}>
                    {error && <p className="modal-error">{error}</p>}
                    
                    <div className="form-group avatar-upload-section">
                        <label>Ảnh bìa Album ({isEditMode ? 'Để trống nếu không đổi' : 'Bắt buộc'})</label>
                        <div className="avatar-preview-box">
                            <img src={preview} alt="Album Cover Preview" className="avatar-preview" style={{ borderRadius: '8px' }}/>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange} 
                                required={!isEditMode} // Chỉ bắt buộc khi Tạo mới
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Tiêu đề Album:</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    
                    <div className="form-group">
                        <label>Ngày phát hành:</label>
                        <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} required />
                    </div>
                    
                    <div className="form-buttons">
                        <button type="submit" disabled={loading} className="profile-button save">
                            {loading ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo Album')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AlbumFormModal;