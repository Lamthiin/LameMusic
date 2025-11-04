// music-frontend/src/pages/Profile/PublicProfileFollowing.jsx (TẠO MỚI)
import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import '../ProfileUser/Profile.css'; 

const PublicProfileFollowing = () => {
    const { profile, fixUrl } = useOutletContext(); 
    const navigate = useNavigate();

    return (
        <div className="profile-following-container">
            <h3>Đang theo dõi ({profile.following?.length || 0})</h3>
            
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
                            className="card-image artist-avatar-round" 
                        />
                        <h4 className="card-title">{f.following?.artist?.stage_name || f.following?.username}</h4>
                        <p className="card-subtitle">{f.following?.artist ? 'Nghệ sĩ' : 'Người dùng'}</p>
                    </div>
                ))}
                {profile.following?.length === 0 && <p className="subtle-text">Người dùng này chưa theo dõi ai.</p>}
            </div>
        </div>
    );
};

export default PublicProfileFollowing;