// music-frontend/src/pages/Profile/PublicProfilePage.jsx (BẢN SỬA GIAO DIỆN FINAL)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicProfileApi } from '../../utils/api'; 
import '../ProfileUser/Profile.css'; // SỬ DỤNG LẠI CSS TỪ PROFILE CÁ NHÂN
import { FaHeart } from 'react-icons/fa'; // Chỉ cần FaHeart cho icon liked song

// HÀM HELPER: Fix URL ảnh (BẮT BUỘC)
const fixUrl = (url, type = 'image') => {
    if (!url) { 
        if (type === 'artist') return '/images/default-artist.png'; // Ảnh default cho Artist
        return '/images/default-album.png'; // Ảnh default cho Album/Song
    }
    if (url.startsWith('http')) return url;
    const prefix = type === 'image' ? '/media/images' : '/media/audio';
    const originalPath = type === 'image' ? '/images' : '/audio';
    
    if (url.startsWith(prefix)) {
        return `http://localhost:3000${url}`;
    }
    return `http://localhost:3000${url.replace(originalPath, prefix)}`;
};

const PublicProfilePage = () => {
    const { username } = useParams(); 
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getPublicProfileApi(username); 
                
                // Fix URL cho người đang theo dõi (nếu là Artist)
                if (data.following) {
                    data.following = data.following.map(follow => {
                        if (follow.following?.artist) {
                            follow.following.artist.avatar_url = fixUrl(follow.following.artist.avatar_url, 'artist');
                        }
                        return follow;
                    });
                }

                // Fix URL cho bài hát đã thích
                if (data.likedSongs) {
                    data.likedSongs = data.likedSongs.map(like => ({
                        ...like,
                        song: {
                            ...like.song,
                            image_url: fixUrl(like.song.image_url, 'song'),
                            album: {
                                ...like.song.album,
                                cover_url: fixUrl(like.song.album?.cover_url, 'album')
                            }
                        }
                    }));
                }
                setProfile(data);
            } catch (err) {
                setError('Không tìm thấy Hồ sơ này hoặc tài khoản chưa công khai.');
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) return <p className="loading-message">Đang tải hồ sơ công khai...</p>;
    if (error || !profile) return <p className="error-message-center">{error}</p>;

    // Lấy ảnh đại diện (giả định dùng avatar mặc định nếu không có)
    const avatarUrl = profile.avatar_url ? fixUrl(profile.avatar_url, 'artist') : '/images/default-user.png';

    return (
        <div className="profile-layout-container">
            
            {/* 1. HEADER CÔNG KHAI (LỚN) */}
            <div className="profile-header public-profile">
                <div className="profile-header-overlay">
                    <img src={avatarUrl} alt={profile.username} className="profile-avatar" />
                    <div className="profile-header-info">
                        <p className="profile-header-sub">HỒ SƠ CÔNG KHAI</p>
                        <h1 className="profile-header-name">{profile.username}</h1>
                        <p className="profile-stats">
                            Đang theo dõi: {profile.following?.length || 0} • Bài hát yêu thích: {profile.likedSongs?.length || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. NỘI DUNG CÁC MỤC */}
            <div className="profile-content">
                
                {/* Mục 1: Playlist Công khai */}
                <div className="profile-section">
                    <h2 className="section-title">Playlist Công khai ({profile.playlists?.length || 0})</h2>
                    <div className="grid-container grid-playlists">
                        {profile.playlists && profile.playlists.length > 0 ? (
                            profile.playlists.map(pl => (
                                <div 
                                    key={pl.id} 
                                    className="card playlist-card"
                                    onClick={() => navigate(`/playlist/${pl.id}`)}
                                >
                                    {/* Ảnh cover playlist mặc định nếu không có */}
                                    <img src="/images/default-playlist-cover.jpg" alt={pl.name} className="card-image" />
                                    <h4 className="card-title">{pl.title}</h4>
                                    <p className="card-subtitle">{pl.songs?.length || 0} bài hát</p>
                                </div>
                            ))
                        ) : (
                            <p className="subtle-text">Không có playlist công khai nào.</p>
                        )}
                    </div>
                </div>

                {/* Mục 2: Nghệ sĩ Đang theo dõi */}
                <div className="profile-section">
                    <h2 className="section-title">Đang theo dõi ({profile.following?.length || 0})</h2>
                    <div className="grid-container grid-artists">
                        {profile.following?.map(f => (
                            <div 
                                key={f.followingId} 
                                className="card artist-card" 
                                onClick={() => navigate(`/artist/${f.following?.artist?.id}`)}
                            >
                                {/* Ảnh nghệ sĩ đang theo dõi (Nếu là Artist) */}
                                <img 
                                    src={f.following?.artist?.avatar_url || '/images/default-artist.png'} 
                                    alt={f.following?.username} 
                                    className="card-image artist-avatar-round" // CSS cho hình tròn
                                />
                                <h4 className="card-title">{f.following?.artist?.stage_name || f.following?.username}</h4>
                                <p className="card-subtitle">{f.following?.artist ? 'Nghệ sĩ' : 'Người dùng'}</p>
                            </div>
                        ))}
                        {profile.following?.length === 0 && <p className="subtle-text">Người dùng này chưa theo dõi ai.</p>}
                    </div>
                </div>
                
                {/* Mục 3: Bài hát đã thích (Hiện ở đây luôn) */}
                <div className="profile-section">
                    <h2 className="section-title">Bài hát đã thích ({profile.likedSongs?.length || 0})</h2>
                    {profile.likedSongs && profile.likedSongs.length > 0 ? (
                        <div className="song-list-detail">
                            {profile.likedSongs.slice(0, 10).map(like => (
                                <div key={like.id} className="song-row">
                                    <div className="song-title-col" onClick={() => navigate(`/song/${like.song.id}`)}>
                                        <img src={like.song.album?.cover_url || like.song.image_url || '/images/default-album.png'} alt={like.song.title} />
                                        <div>
                                            <p className="song-row-title">{like.song.title}</p>
                                            <p className="song-row-artist">{like.song.artist?.stage_name}</p>
                                        </div>
                                    </div>
                                    <FaHeart size={18} className="liked-icon" /> {/* Icon đã thích */}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="subtle-text">Người dùng này chưa thích bài hát nào.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PublicProfilePage;