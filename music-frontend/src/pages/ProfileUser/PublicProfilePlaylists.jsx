// music-frontend/src/pages/Profile/PublicProfilePlaylists.jsx (ĐÃ SỬA)
import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import '../ProfileUser/Profile.css'; // Dùng chung CSS

const PublicProfilePlaylists = () => {
    // Lấy profile từ Layout cha
    const { profile } = useOutletContext(); 
    const navigate = useNavigate();
    
    const playlists = profile.playlists || [];

    return (
        <div className="profile-playlists-container" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: 'var(--color-text-primary)' }}>
                Playlists Công khai ({playlists.length})
            </h3>
            
            {playlists.length > 0 ? (
                // Dùng <ol> để tạo danh sách có thứ tự (1, 2, 3...)
                <ol className="playlist-ordered-list" style={{ 
                    listStyleType: 'decimal',
                    paddingLeft: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {playlists.map((pl) => (
                        <li 
                            key={pl.id} 
                            className="playlist-list-item"
                            onClick={() => navigate(`/playlist/${pl.id}`)}
                            style={{
                                cursor: 'pointer',
                                fontSize: '18px',
                                color: 'var(--color-text-primary)',
                                fontWeight: '500',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                        >
                            {/* Tên Playlist (x bài hát) */}
                            {pl.name} 
                            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginLeft: '10px', fontWeight: '400' }}>
                                ({pl.songs?.length || 0} bài hát)
                            </span>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="subtle-text" style={{ padding: '10px' }}>Người dùng này chưa có playlist công khai nào.</p>
            )}
        </div>
    );
};

export default PublicProfilePlaylists;