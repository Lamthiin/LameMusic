// music-frontend/src/pages/Profile/PublicProfileLayout.jsx (TẠO MỚI)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink, Outlet } from 'react-router-dom';
import { getPublicProfileApi } from '../../utils/api'; 
import '../ProfileUser/Profile.css'; // Dùng chung CSS

// HÀM HELPER: Fix URL ảnh (BẮT BUỘC)
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

const PublicProfileLayout = () => {
    const { username } = useParams(); // Lấy 'username' từ URL
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getPublicProfileApi(username); 
                
                // Fix URL cho người đang theo dõi (nếu có)
                if (data.following) {
                    data.following = data.following.map(follow => {
                        if (follow.following?.artist) {
                            follow.following.artist.avatar_url = fixUrl(follow.following.artist.avatar_url, 'artist');
                        }
                        return follow;
                    });
                }
                setProfile(data);
                
                // Tự động chuyển hướng đến tab đầu tiên nếu URL chỉ là /profile/:username
                if (window.location.pathname === `/profile/${username}`) {
                    navigate(`/profile/${username}/playlists`, { replace: true });
                }

            } catch (err) {
                setError('Không tìm thấy Hồ sơ này hoặc tài khoản chưa công khai.');
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]); // Chạy lại khi username thay đổi

    if (loading) return <p className="loading-message">Đang tải hồ sơ công khai...</p>;
    if (error || !profile) return <p className="error-message-center">{error}</p>;

    const avatarUrl = '/images/default-user.png'; // Tạm dùng default avatar

    return (
        <div className="profile-layout-container">
            
            {/* 1. HEADER CÔNG KHAI */}
            <div className="profile-header public-profile">
                <div className="profile-header-overlay">
                    {/* <img src={avatarUrl} alt={profile.username} className="profile-avatar" /> */}
                    <div className="profile-header-info">
                        <p className="profile-header-sub">HỒ SƠ CÔNG KHAI</p>
                        <h1 className="profile-header-name">{profile.username}</h1>
                        <p className="profile-stats">
                            Đang theo dõi: {profile.following?.length || 0} • Bài hát yêu thích: {profile.likedSongs?.length || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. THANH TABS NGANG */}
            <nav className="profile-tabs">
                <ul>
                    <li>
                        {/* LƯU Ý: Phải đặt NavLink đúng với Route con (tạm thời dùng playlist là mặc định) */}
                        <NavLink to={`/profile/${username}/playlists`} end>
                            Playlist ({profile.playlists?.length || 0})
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/profile/${username}/likes`}>
                            Bài hát Yêu thích ({profile.likedSongs?.length || 0})
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/profile/${username}/following`}>
                            Đang theo dõi ({profile.following?.length || 0})
                        </NavLink>
                    </li>
                </ul>
            </nav>

            {/* 3. NỘI DUNG (Render trang con) */}
            <div className="profile-content">
                {/* Truyền dữ liệu profile xuống trang con */}
                <Outlet context={{ profile, fixUrl }} /> 
            </div>
        </div>
    );
};

export default PublicProfileLayout;