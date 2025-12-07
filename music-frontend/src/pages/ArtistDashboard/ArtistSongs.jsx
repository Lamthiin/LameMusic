// music-frontend/src/pages/ArtistDashboard/ArtistSongs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySongsApi, deleteMySongApi } from '../../utils/api';
import './ArtistDashboard.css';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import SongFormModal from '../../components/user/SongFormModal';

const showToast = msg => alert(msg);

const fixUrl = (url) => {
    if (!url) return "/images/default-album.png";
    if (url.startsWith("http")) return url;
    return `http://localhost:3000${url}`;
};

const ArtistSongs = () => {
    const navigate = useNavigate();

    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const [filter, setFilter] = useState("PENDING");

    // Load
    const loadSongs = async () => {
        setLoading(true);

        try {
            const res = await getMySongsApi(filter);

            setSongs(
                res.map(s => ({
                    ...s,
                    cover_url: fixUrl(s.image_url || s.album?.cover_url)
                }))
            );

        } catch (err) {
            showToast("Không tải được danh sách bài hát", "error");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadSongs();
    }, [filter]);

    // Actions
    const create = () => {
        setEditing(null);
        setShowModal(true);
    };

    const edit = (song) => {
        setEditing(song);
        setShowModal(true);
    };

    const remove = async (id) => {
        if (!window.confirm("Xóa bài hát này?")) return;

        try {
            await deleteMySongApi(id);
            showToast("Đã xóa bài hát!");
            loadSongs();
        } catch (err) {
            showToast("Xóa thất bại", "error");
        }
    };

    if (loading) return <p>Đang tải...</p>;

    return (
        <div className="artist-songs-container">

            <div className="artist-songs-header">
                <h2>Quản lý Bài hát ({songs.length})</h2>

                <button className="btn-create" onClick={create}>
                    <FaPlus/> Thêm bài hát
                </button>
            </div>

            {/* FILTER TABS */}
            <div className="artist-songs-filters">
                {["APPROVED","PENDING","REJECTED"].map(type => (
                    <button
                        key={type}
                        className={`filter-btn ${filter === type ? "active":""}`}
                        onClick={() => setFilter(type)}
                    >
                        {type === "APPROVED" && "Đã duyệt"}
                        {type === "PENDING" && "Chờ duyệt"}
                        {type === "REJECTED" && "Bị từ chối"}
                    </button>
                ))}
            </div>

            {/* LIST SONGS */}
            <div className="artist-songs-list">

                {songs.length === 0 && (
                    <p className="empty">Không có bài hát nào.</p>
                )}

                {songs.map(song => (
                    <div key={song.id} className="song-row">

                        <div className="song-info"
                             onClick={() => navigate(`/song/${song.id}`)}
                        >
                            <img src={song.cover_url}/>
                            <div>
                                <p className="song-title">{song.title}</p>
                                <p className="song-artist">{song.artist?.stage_name}</p>
                            </div>
                        </div>

                        <div className="song-album"
                             onClick={() => navigate(`/album/${song.album?.id}`)}
                        >
                            {song.album?.title || "Single"}
                        </div>

                        <div className="song-actions">

                            {song.status !== "APPROVED" && (
                                <button onClick={e => {
                                    e.stopPropagation();
                                    edit(song);
                                }}>
                                    <FaEdit />
                                </button>
                            )}

                            <button className="danger"
                                    onClick={e => {
                                        e.stopPropagation();
                                        remove(song.id);
                                    }}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {showModal && (
                <SongFormModal
                    onClose={() => setShowModal(false)}
                    onComplete={loadSongs}
                    songToEdit={editing}
                />
            )}

        </div>
    );
};

export default ArtistSongs;

