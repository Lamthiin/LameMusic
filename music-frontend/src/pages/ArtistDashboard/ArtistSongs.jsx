import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySongsApi, deleteMySongApi } from '../../utils/api';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import SongFormModal from '../../components/user/SongFormModal';
import './ArtistDashboard.css';
// 1. IMPORT HOOK useAuth TỪ AUTH CONTEXT
import { useAuth } from '../../context/AuthContext'; // <--- Đảm bảo đường dẫn đúng
// const useAuth = () => {
//     // THAY THẾ: Loại bỏ giá trị mặc định '1'
//     const storedUserId = localStorage.getItem('userId');
    
//     // Nếu storedUserId là chuỗi ID hợp lệ, sử dụng nó. Nếu không, coi là không có ID (hoặc dùng ID test đã biết)
//     // Nếu ID của bạn là 23, bạn cần đảm bảo localStorage đang lưu 23.
//     // Tạm thời dùng ID 23 để test nếu không có Auth:
//     const mockUserId = storedUserId || '23'; // <--- Tạm thời dùng '23' nếu không có stored ID
    
//     return { currentUserId: mockUserId };
// };
const ArtistSongs = () => {
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("PENDING");
  const { user } = useAuth();
   // ID người dùng (từ JWT)
    const currentUserId = user?.userId; // Ví dụ: 28

    // ID Nghệ sĩ (Từ JWT, đã được Backend thêm vào)
    const currentArtistId = user?.artistId; // Ví dụ: 23
  const loadSongs = async () => {
    setLoading(true);
    try {
      const res = await getMySongsApi(filter);
      setSongs(res);
    } catch {
      alert("Không tải được danh sách bài hát");
    }
    setLoading(false);
  };

  useEffect(() => { loadSongs(); }, [filter]);

  const createSong = () => {
    setEditing(null);
    setShowModal(true);
  };

  const editSong = (song) => {
    setEditing(song);
    setShowModal(true);
  };

  const deleteSong = async (id) => {
    if (!window.confirm("Xóa bài hát này?")) return;
    try {
      await deleteMySongApi(id);
      alert("Đã xóa bài hát");
      loadSongs();
    } catch {
      alert("Xóa thất bại");
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="artist-songs-container">
      <div className="artist-songs-header">
        <h2>Quản lý Bài hát ({songs.length})</h2>
        <button className="btn-create" onClick={createSong}><FaPlus /> Thêm bài hát</button>
      </div>

      <div className="artist-songs-filters">
        {["APPROVED","PENDING","REJECTED"].map(type => (
          <button
            key={type}
            className={filter === type ? "active" : ""}
            onClick={() => setFilter(type)}
          >
            {type === "APPROVED" ? "Đã duyệt" : type === "PENDING" ? "Chờ duyệt" : "Bị từ chối"}
          </button>
        ))}
      </div>

      <div className="artist-songs-list">
        <div className="artist-songs-header-row">
          <span>Bài hát</span>
          <span>Album</span>
          <span>Hành động</span>
        </div>

        {songs.length === 0 && <p className="empty">Không có bài hát nào.</p>}

        {songs.map(song => (
          <div key={song.id} className="song-row">
            <div className="song-info" onClick={() => navigate(`/song/${song.id}`)}>
              <img src={song.image_url || '/images/default-album.png'} alt={song.title} />
              <div>
                <p>{song.title}</p>
                <p>{song.artist?.stage_name}</p>
              </div>
            </div>
            <div className="song-album" onClick={() => navigate(`/album/${song.album?.id}`)}>
              {song.album?.title || "Single"}
            </div>
            <div className="song-actions">
              {song.status !== "APPROVED" && <button onClick={(e) => { e.stopPropagation(); editSong(song); }}><FaEdit /></button>}
              <button className="danger" onClick={(e) => { e.stopPropagation(); deleteSong(song.id); }}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <SongFormModal
          onClose={() => setShowModal(false)}
          onComplete={loadSongs}
          songToEdit={editing}
          currentArtistId={currentArtistId}
        />
      )}
    </div>
  );
};

export default ArtistSongs;
