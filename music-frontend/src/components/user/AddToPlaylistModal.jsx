// src/components/AddToPlaylistModal.jsx

import React, { useState, useEffect } from "react";
// Giả định fetchMyPlaylists được import từ utils/api
import { fetchMyPlaylists } from "../../utils/api"; 

import "./AddToPlaylistModal.css";
import { FaTimes, FaPlus } from "react-icons/fa";
import CreatePlaylistModal from "./CreatePlaylistModal";

// Lấy API Base URL từ biến môi trường
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

// ========= TOAST =========
// Hàm hiển thị thông báo ngắn (Bạn nên tích hợp Toast/Snackbar sẵn có của bạn)
const showToast = (message, type='success') => {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Đảm bảo toast không bị trùng lặp nếu gọi nhanh
    const existingToasts = document.querySelectorAll('.toast');
    if (existingToasts.length > 0) {
        existingToasts.forEach(t => t.remove());
    }
    
    document.body.appendChild(toast);

    setTimeout(()=> toast.classList.add("show"),10);

    setTimeout(()=> {
        toast.classList.remove("show");
        setTimeout(()=> toast.remove(),400);
    },2500);
};

// ========= MAIN COMPONENT =========
/**
 * Modal thêm bài hát vào Playlist (Hỗ trợ thêm hàng loạt)
 * @param {Array<number>} songIds - Mảng ID các bài hát cần thêm
 * @param {function} onClose - Hàm đóng modal
 */
const AddToPlaylistModal = ({ songIds, onClose }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [openCreate, setOpenCreate] = useState(false);

    // Chuẩn hóa songIds thành mảng số nguyên, loại bỏ các giá trị không phải số
    const songIdList = Array.isArray(songIds) 
        ? songIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        : [];
        
    // LOAD PLAYLIST
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                // Giả định fetchMyPlaylists đã xử lý Authorization header
                const data = await fetchMyPlaylists(); 
                setPlaylists(data);
            } catch {
                setError("Không tải được danh sách playlist.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // HÀM THÊM HÀNG LOẠT (Gọi API mới của Backend)
    const addSongsToPlaylist = async (playlistId) => { 
        if (songIdList.length === 0) {
            showToast("Không có bài hát nào để thêm.", "error");
            return;
        }
        
        // Payload chỉ chứa songIds, vì playlistId đã ở trong URL
        const payload = {
            songIds: songIdList
        };
        
        // Giả định bạn đã có hàm lấy token hoặc token được xử lý trong fetch bọc ngoài
        const token = localStorage.getItem('accessToken'); 

        try {
            // SỬ DỤNG ENDPOINT MỚI: POST /playlist/:playlistId/add-songs
            const response = await fetch(`${API_BASE}/playlists/${playlistId}/add-songs`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Thêm thất bại.");
            }

            showToast(`✅ Đã thêm ${songIdList.length} bài hát vào playlist!`);
            onClose();
        } catch (err) {
            showToast(err.message || "Thêm thất bại", "error");
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
                                    // GỌI HÀM THÊM HÀNG LOẠT MỚI
                                    onClick={() => addSongsToPlaylist(p.id)}>
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