// music-frontend/src/components/AddToPlaylistModal.jsx
import React, { useState, useEffect } from "react";
import {
    fetchMyPlaylists,
    addSongToPlaylistApi
} from "../../utils/api";

import "./AddToPlaylistModal.css";
import { FaTimes, FaPlus } from "react-icons/fa";
import CreatePlaylistModal from "./CreatePlaylistModal";

// ========= TOAST =========
const showToast = (message, type='success') => {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(()=> toast.classList.add("show"),10);

    setTimeout(()=> {
        toast.classList.remove("show");
        setTimeout(()=> toast.remove(),400);
    },2500);
};

// ========= MAIN COMPONENT =========
const AddToPlaylistModal = ({ songId, onClose }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // MODAL CON (tạo playlist)
    const [openCreate, setOpenCreate] = useState(false);

    // LOAD PLAYLIST
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchMyPlaylists();
                setPlaylists(data);
            } catch {
                setError("Không tải được playlist.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ADD SONG
    const addSong = async (id) => {
        try {
            await addSongToPlaylistApi(id, songId);
            showToast("✅ Đã thêm vào playlist!");
            onClose();
        } catch (err) {
            showToast(err.response?.data?.message || "Thêm thất bại","error");
        }
    };

    // UPDATES WHEN CREATE PLAYLIST SUCCESS
    const handleNewPlaylist = (newPlaylist) => {
        setPlaylists(prev => [newPlaylist, ...prev]);
        setOpenCreate(false);
        showToast("🎉 Playlist mới đã tạo!");
    };

    // FILTER
    const list = playlists.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                
                <button className="modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <h2>Thêm vào playlist</h2>

                <input
                    className="playlist-search"
                    placeholder="Tìm playlist..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                {/* CREATE NEW */}
                <div className="create-playlist-row"
                     onClick={() => setOpenCreate(true)}>
                    <div className="create-playlist-icon">
                        <FaPlus />
                    </div>
                    <span>Tạo playlist mới</span>
                </div>

                {error && <p className="modal-error">{error}</p>}

                <h3>Playlist của bạn</h3>

                {loading ? (
                    <p className="loading">Đang tải...</p>
                ) : (
                    <ul className="playlist-list">
                        {list.length ? (
                            list.map(p => (
                                <li key={p.id}
                                    onClick={() => addSong(p.id)}>
                                    {p.name}
                                </li>
                            ))
                        ) : (
                            <p className="empty">
                                {search ? "Không tìm thấy." : "Bạn chưa có playlist."}
                            </p>
                        )}
                    </ul>
                )}

            </div>
        </div>

        {/* MODAL CON */}
        <CreatePlaylistModal
            isOpen={openCreate}
            onClose={() => setOpenCreate(false)}
            onPlaylistCreated={handleNewPlaylist}
        />
        </>
    );
};

export default AddToPlaylistModal;
