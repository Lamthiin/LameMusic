// music-frontend/src/pages/ArtistDashboard/ArtistInfo.jsx (TẠO MỚI)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyArtistProfileApi, updateMyArtistProfileApi } from '../../utils/api';
import '../ProfileUser/Profile.css'; // Dùng chung CSS Form
import './ArtistDashboard.css'; // CSS riêng

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

const ArtistInfo = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [artist, setArtist] = useState(null);

    const [formData, setFormData] = useState({ stage_name: '', bio: '' });
    const [avatarFile, setAvatarFile] = useState(null); // State cho file
    const [avatarPreview, setAvatarPreview] = useState(null); // State cho ảnh preview

    // Tải dữ liệu Artist
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                // Sẽ hoạt động sau khi bạn Login lại
                const data = await getMyArtistProfileApi(); 
                setArtist(data);
                setFormData({
                    stage_name: data.stage_name,
                    bio: data.bio || '',
                });
                if (data.avatar_url) {
                    setAvatarPreview(fixUrl(data.avatar_url, 'artist'));
                }
            } catch (error) {
                console.error("Lỗi useEffect:", error);
                showToast('Lỗi tải hồ sơ Nghệ sĩ. (Bạn đã đăng nhập lại chưa?)', 'error');
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file); // Lưu file
            setAvatarPreview(URL.createObjectURL(file)); // Tạo link preview
        }
    };

    // Cập nhật Profile (Sử dụng FormData)
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('stage_name', formData.stage_name);
        data.append('bio', formData.bio);
        if (avatarFile) {
            data.append('avatarFile', avatarFile); 
        }

        try {
            const response = await updateMyArtistProfileApi(data); 
            setArtist(response);
            showToast('Cập nhật thông tin thành công!');
        } catch (error) {
            showToast(error.response?.data?.message || 'Cập nhật thất bại', 'error');
        }
        setLoading(false);
    };

    if (loading) return <p>Đang tải thông tin...</p>;
    if (!artist) return <p>Không tìm thấy hồ sơ nghệ sĩ.</p>;

    return (
        <div className="artist-info-container">
            <form className="profile-edit-form" onSubmit={handleUpdate}>
                
                {/* --- PHẦN UPLOAD AVATAR --- */}
                <div className="form-group avatar-upload-section">
                    <label>Ảnh đại diện (Avatar)</label>
                    <div className="avatar-preview-box">
                        <img 
                            src={avatarPreview || '/images/default-artist.png'} 
                            alt="Avatar Preview" 
                            className="avatar-preview"
                        />
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange} 
                        />
                    </div>
                </div>

                {/* --- PHẦN THÔNG TIN TEXT --- */}
                <div className="form-group">
                    <label>Nghệ danh (Stage Name):</label>
                    <input 
                        type="text" 
                        name="stage_name" 
                        value={formData.stage_name} 
                        onChange={handleInputChange} 
                    />
                </div>
                
                <div className="form-group">
                    <label>Tiểu sử (Bio):</label>
                    <textarea 
                        name="bio" 
                        value={formData.bio} 
                        onChange={handleInputChange}
                        rows={5}
                    />
                </div>
                
                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
SESSION_MESSAGE
                    </button>
                </div>
            </form>

            {/* (Phần Đổi Mật khẩu - Tái sử dụng từ ProfileInfo) */}
            {/* ... (Bạn có thể thêm nút mở ChangePasswordModal ở đây) ... */}
        </div>
    );
};

export default ArtistInfo;