// music-frontend/src/components/AddSinglesToAlbumModal.jsx (TẠO MỚI)
import React, { useState, useEffect } from 'react';
// (1) IMPORT API FETCH SINGLES VÀ ADD TO ALBUM
import { fetchMySinglesApi, addSongToAlbumApi } from '../../utils/api'; 
import './ChangePasswordModal.css'; 
import { FaTimes, FaSpinner, FaCheck } from 'react-icons/fa';

const showToast = (message, type = 'success') => { alert(message); };

// HÀM HELPER: Format thời gian
const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${('0' + sec).slice(-2)}`;
};

// Component chính
const AddSinglesToAlbumModal = ({ onClose, onComplete, targetAlbum }) => {
    
    // Singles: Danh sách bài hát có thể thêm
    const [singles, setSingles] = useState([]);
    // Selected Songs: ID của các bài hát được chọn
    const [selectedSongs, setSelectedSongs] = useState(new Set()); 

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Load danh sách Singles
    useEffect(() => {
        const loadSingles = async () => {
            try {
                // API GET /song/my-singles (đã tạo ở bước trước)
                const data = await fetchMySinglesApi();
                setSingles(data);
            } catch (e) {
                setError("Lỗi tải danh sách Singles của bạn.");
            } finally {
                setLoading(false);
            }
        };
        loadSingles();
    }, []);

    const handleSelectSong = (songId) => {
        setSelectedSongs(prevSelected => {
            const newSet = new Set(prevSelected);
            if (newSet.has(songId)) {
                newSet.delete(songId);
            } else {
                newSet.add(songId);
            }
            return newSet;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (selectedSongs.size === 0) {
            setError('Vui lòng chọn ít nhất một bài hát để thêm vào Album.');
            return;
        }

        setIsSubmitting(true);
        const selectedIds = Array.from(selectedSongs);
        let successCount = 0;

        try {
            // Lặp qua từng bài hát đã chọn và gọi API PATCH
            for (const songId of selectedIds) {
                await addSongToAlbumApi(songId, targetAlbum.id); // API PATCH /song/add-to-album
                successCount++;
            }
            
            showToast(`✅ Đã thêm thành công ${successCount} bài hát vào Album "${targetAlbum.title}"!`);
            onComplete(); // Tải lại danh sách Albums (và chi tiết Album)
            onClose();
        } catch (err) {
            setError(`Thêm bài hát thất bại. ${err.response?.data?.message || ''}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
                <h2>Thêm Singles vào Album</h2>
                <p style={{textAlign: 'center'}}>Đang thêm bài hát vào: 
                    {/* SỬA TỪ targetAlbum.title SANG targetAlbum?.title */}
                    <strong>{targetAlbum?.title || 'Đang tải...'}</strong>
                </p>
                {error && <p className="modal-error">{error}</p>}
                
                <form onSubmit={handleSubmit} className="single-selection-form">
                    
                    {/* Danh sách Singles */}
                    <div className="singles-list-box">
                        {loading ? (
                            <p className="subtle-text"><FaSpinner className="spinner" /> Đang tải...</p>
                        ) : singles.length === 0 ? (
                            <p className="subtle-text" style={{ color: 'var(--color-accent)' }}>Bạn không có bài hát Single nào để thêm.</p>
                        ) : (
                            singles.map(song => (
                                <div 
                                    key={song.id} 
                                    className={`single-item ${selectedSongs.has(song.id) ? 'selected' : ''}`}
                                    onClick={() => handleSelectSong(song.id)}
                                >
                                    <img src={song.image_url || '/images/default-album.png'} alt={song.title} />
                                    <div className="song-info">
                                        <p className="song-title">{song.title}</p>
                                        <span className="song-duration">{formatDuration(song.duration)}</span>
                                    </div>
                                    <div className="checkbox-icon">
                                        {selectedSongs.has(song.id) && <FaCheck />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="form-buttons" style={{ marginTop: '30px' }}>
                        <button type="submit" disabled={isSubmitting || selectedSongs.size === 0} className="profile-button save">
                            {isSubmitting ? 'Đang thêm...' : `Thêm ${selectedSongs.size} Bài hát`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSinglesToAlbumModal;