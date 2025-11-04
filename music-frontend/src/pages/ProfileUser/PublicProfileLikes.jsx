// music-frontend/src/pages/Profile/PublicProfileLikes.jsx (ĐÃ SỬA)
import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import '../ProfileUser/Profile.css'; 

const PublicProfileLikes = () => {
    const { profile, fixUrl } = useOutletContext(); 
    const navigate = useNavigate();
    
    // Lấy danh sách bài hát (song objects) từ likedSongs
    const songsData = profile.likedSongs?.map(like => ({
        ...like.song,
    })) || [];
    
    // Helper để format duration (giả định có trường duration)
    const formatDuration = (duration) => {
        return duration || '0:00';
    };

    return (
        <div className="profile-likes-container" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: 'var(--color-text-primary)' }}>
                Bài hát Yêu thích ({songsData.length})
            </h3>

            {songsData.length > 0 ? (
                <div className="public-likes-table">
                    {/* Header Bảng */}
                    <div className="public-likes-header" style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 4fr 3fr 2fr 100px', // Cấu trúc 5 cột
                        padding: '10px 0',
                        marginBottom: '10px',
                        borderBottom: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        fontSize: '13px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                    }}>
                        <span>#</span>
                        <span style={{ gridColumn: 2 }}>TÊN BÀI HÁT</span>
                        <span>NGHỆ SĨ</span>
                        <span>ALBUM</span>
                        <span style={{ textAlign: 'right' }}></span>
                    </div>

                    {/* Body Bảng */}
                    <div className="public-likes-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {songsData.map((song, index) => (
                            <div 
                                key={song.id} 
                                className="public-likes-row"
                                // Click vào hàng để đến trang bài hát
                                onClick={() => navigate(`/song/${song.id}`)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '40px 4fr 3fr 2fr 100px',
                                    padding: '8px 0',
                                    borderRadius: '4px',
                                    alignItems: 'center',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-secondary)',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {/* Cột # */}
                                <div style={{ textAlign: 'center' }}>{index + 1}</div>
                                
                                {/* Cột Tên Bài Hát (Title) */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--color-text-primary)' }}>
                                    <img 
                                        src={song.image_url || song.album?.cover_url || '/images/default-album.png'} 
                                        alt={song.title}
                                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                    <p style={{ margin: 0, fontWeight: '500' }}>{song.title}</p>
                                </div>
                                
                                {/* Cột Nghệ Sĩ (Artist) */}
                                <div 
                                    // Click riêng vào nghệ sĩ
                                    onClick={(e) => { e.stopPropagation(); navigate(`/artist/${song.artist?.id}`); }}
                                    style={{ color: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                >
                                    {song.artist?.stage_name || 'Nghệ sĩ'}
                                </div>
                                
                                {/* Cột Album */}
                                <div 
                                    // Click riêng vào album
                                    onClick={(e) => { e.stopPropagation(); navigate(`/album/${song.album?.id}`); }}
                                    style={{ color: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                >
                                    {song.album?.title || 'Single'}
                                </div>

                                {/* Cột Thời gian (Duration) */}
                                <div style={{ textAlign: 'right' }}>
                                    ❤️
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="subtle-text" style={{ padding: '10px' }}>Người dùng này chưa thích bài hát nào.</p>
            )}
        </div>
    );
};

export default PublicProfileLikes;