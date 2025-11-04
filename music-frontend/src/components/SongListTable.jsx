// music-frontend/src/components/SongListTable.jsx (TẠO MỚI)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import './SongListTable.css'; // CSS mới
import { FaPlay } from 'react-icons/fa';

// Component này nhận vào danh sách bài hát (songs)
const SongListTable = ({ songs, title, showIndex = true }) => {
    const navigate = useNavigate();
    const { playTrack, currentTrack } = usePlayer();

    // Hàm Play/Pause cho từng dòng
    const handlePlayPause = (song, index) => {
        const isCurrent = currentTrack?.id === song.id;
        if (isCurrent && currentTrack) {
            // Tạm dừng/Phát tiếp (logic sẽ được PlayerBar xử lý)
            playTrack(song, songs, index); 
        } else {
            // Phát bài hát mới (Play)
            playTrack(song, songs, index);
        }
    };

    return (
        <div className="song-list-table-container">
            {title && <h3 className="section-title">{title} ({songs.length})</h3>}
            
            <div className="song-table-header">
                {showIndex && <span>#</span>}
                <span className="col-title">TÊN BÀI HÁT</span>
                <span className="col-artist">NGHỆ SĨ</span>
                <span className="col-album">ALBUM</span>
                <span className="col-duration">THỜI GIAN</span>
            </div>
            
            <div className="song-table-body">
                {songs.map((song, index) => (
                    <div 
                        key={song.id} 
                        className={`song-table-row ${currentTrack?.id === song.id ? 'active' : ''}`}
                    >
                        <div className="col-index">
                            <span 
                                className="index-number" 
                                onClick={() => navigate(`/song/${song.id}`)}
                            >
                                {index + 1}
                            </span>
                            <button className="play-button" onClick={() => handlePlayPause(song, index)}>
                                <FaPlay />
                            </button>
                        </div>
                        
                        <div className="col-title" onClick={() => navigate(`/song/${song.id}`)}>
                            <img src={song.image_url || song.album?.cover_url} alt={song.title} />
                            <div>
                                <p className="song-title">{song.title}</p>
                            </div>
                        </div>
                        
                        <div className="col-artist" onClick={() => navigate(`/artist/${song.artist?.id}`)}>
                            {song.artist?.stage_name || 'Nghệ sĩ'}
                        </div>
                        
                        <div className="col-album" onClick={() => navigate(`/album/${song.album?.id}`)}>
                            {song.album?.title || 'Single'}
                        </div>

                        <div className="col-duration">
                            {song.duration || '0:00'}
                        </div>
                    </div>
                ))}
            </div>
            {songs.length === 0 && <p className="subtle-text">Không có bài hát nào trong danh sách này.</p>}
        </div>
    );
};

export default SongListTable;