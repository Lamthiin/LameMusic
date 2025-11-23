import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyFollowingApi } from '../../utils/api'; 
import './Profile.css';
import { FaUserCircle } from 'react-icons/fa';

const showToast = (message) => { alert(message); };
const fixUrl = (url) => url?.startsWith('http') ? url : `http://localhost:3000${url}`;

const ProfileFollowing = () => {
    const [followingList, setFollowingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadFollowing = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchMyFollowingApi();
            const finalArtists = data
                .filter(f => f.following && f.following.registrationStatus === 'APPROVED')
                .map(f => f.following);
            setFollowingList(finalArtists);
        } catch (error) {
            console.error("Lỗi tải danh sách đang theo dõi:", error);
            showToast('Lỗi tải danh sách đang theo dõi.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFollowing();
    }, [loadFollowing]); 

    const goToArtist = (artistId) => {
        navigate(`/artist/${artistId}`);
    };

    if (loading) return <p>Đang tải danh sách theo dõi...</p>;

    return (
        <div className="pf-following-container">
            <h2>Đang theo dõi ({followingList.length})</h2>
            
            <div className="pf-artist-grid">
                {followingList.length > 0 ? (
                    followingList.map(artist => (
                        <div 
                            key={artist.id} 
                            className="pf-artist-card"
                            onClick={() => goToArtist(artist.id)}
                        >
                            <img 
                                src={fixUrl(artist.avatar_url) || '/images/default-artist.png'} 
                                alt={artist.stage_name} 
                                className="pf-artist-avatar" 
                            />
                            <h4 className="pf-artist-name">{artist.stage_name}</h4>
                            <p className="pf-artist-role">Nghệ sĩ</p>
                        </div>
                    ))
                ) : (
                    <p className="pf-subtle-text">Bạn chưa theo dõi nghệ sĩ nào đã được duyệt.</p>
                )}
            </div>
        </div>
    );
};

export default ProfileFollowing;
