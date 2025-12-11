import React, { useState, useEffect } from "react";
import {
    createSongApi,
    updateMySongApi,
    getMyAlbumsApi,
    fetchCategories,
    fetchAllArtistsApi,
    // ⭐ ĐẢM BẢO HÀM NÀY ĐÃ ĐƯỢC IMPORT
    getSongDetailApi 
} from "../../utils/api";

import "./SongFormModal.css";
import { FaTimes } from "react-icons/fa";

// Mock functions (nếu chưa có global functions)
const showToast = (msg) => alert(msg); 
const getDurationMock = () => "180"; 

const SongFormModal = ({ onClose, onComplete, songToEdit, currentArtistId }) => {
    const isEditMode = Boolean(songToEdit);
    const songId = songToEdit?.id; // Lấy ID của bài hát (dùng để gọi API chi tiết)

    // State mới để lưu trữ DỮ LIỆU CHI TIẾT bài hát (đã load đầy đủ)
    // Khởi tạo bằng songToEdit (dữ liệu tóm tắt) để dùng tạm nếu không ở chế độ edit
    const [detailSongData, setDetailSongData] = useState(songToEdit); 

    const [title, setTitle] = useState("");
    const [genre, setGenre] = useState("");
    const [albumId, setAlbumId] = useState("");
    const [trackNumber, setTrackNumber] = useState("");
    const [lyricsContent, setLyricsContent] = useState("");
    const [language, setLanguage] = useState("vi");
    const [audioFile, setAudioFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("/images/default-album.png");

    const [artistAlbums, setArtistAlbums] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allArtists, setAllArtists] = useState([]);
    const [selectedCollabIds, setSelectedCollabIds] = useState([]);

    const [collabOpen, setCollabOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // LOAD DATA & INITIALIZE STATE
    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);

            try {
                // 1. Tải dữ liệu cần thiết (Async Parallel)
                const [alb, cat, artists] = await Promise.all([
                    getMyAlbumsApi(),
                    fetchCategories(),
                    fetchAllArtistsApi()
                ]);

                setArtistAlbums((alb || []).map(a => ({ ...a, id: a.id.toString() })));
                setCategories(cat || []);

                const currentArtistIdNumber = Number(currentArtistId);
                
                if (!currentArtistIdNumber) {
                    setError("ID Nghệ sĩ không hợp lệ.");
                    setLoading(false);
                    return;
                }

                const collabOptions = (artists || []).filter(a => Number(a.id) !== currentArtistIdNumber);
                setAllArtists(collabOptions);

                let songToUse = songToEdit;

                // ⭐ 2. CHỈ GỌI API CHI TIẾT KHI CHỈNH SỬA
                if (isEditMode && songId) {
                    try {
                        const detail = await getSongDetailApi(songId); // Gọi API chi tiết
                        setDetailSongData(detail); // Lưu dữ liệu chi tiết
                        songToUse = detail;
                    } catch (e) {
                        console.error("Lỗi tải chi tiết bài hát:", e);
                        setError("Không thể tải chi tiết bài hát để chỉnh sửa.");
                        setLoading(false);
                        return;
                    }
                }
                
                // ⭐ 3. KHỞI TẠO STATE TỪ DỮ LIỆU ĐÃ LOAD ĐẦY ĐỦ
                if (isEditMode && songToUse) {
                    setTitle(songToUse.title || "");
                    setGenre(songToUse.genre || "");
                    setAlbumId(songToUse.album?.id?.toString() || "");
                    setTrackNumber(songToUse.track_number || "");
                    setLyricsContent(songToUse.lyrics?.lyrics || "");
                    setLanguage(songToUse.lyrics?.language || "vi");
                    setImagePreview(songToUse.image_url || "/images/default-album.png");

                    // ⭐ LOGIC XỬ LÝ COLLAB ARTISTS (Sử dụng songArtists)
                    const allArtistsFromSong = (songToUse.songArtists || [])
                        .map(sa => sa.artist)
                        .filter(artist => artist && artist.id);

                    const selectedCollab = allArtistsFromSong
                        .filter(a => Number(a.id) !== currentArtistIdNumber)
                        .map(a => a.id.toString()); 
                        
                    setSelectedCollabIds(selectedCollab);
                }

            } catch (e) {
                console.error("Lỗi tải dữ liệu chung:", e);
                setError("Không thể tải dữ liệu cần thiết.");
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, [isEditMode, songId, currentArtistId]); 

    // FILE CHANGE (Giữ nguyên)
    const handleFileChange = (e, type) => {
        const f = e.target.files[0];
        if (!f) return;

        if (type === "audio") setAudioFile(f);
        if (type === "image") {
            setImageFile(f);
            setImagePreview(URL.createObjectURL(f));
        }
    };

    // TOGGLE COLLAB (Giữ nguyên)
    const toggleCollab = (id) => {
        const s = id.toString();
        setSelectedCollabIds(prev =>
            prev.includes(s)
                ? prev.filter(x => x !== s)
                : [...prev, s]
        );
    };

    // SUBMIT FORM (Giữ nguyên logic gửi Collab IDs)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const primaryArtistId = Number(currentArtistId); 
        
        if (!primaryArtistId) {
            setError("ID Nghệ sĩ không hợp lệ.");
            return;
        }

        if (!title || !genre) {
            setError("Vui lòng nhập Tiêu đề và Thể loại.");
            return;
        }

        if (!isEditMode && !audioFile) {
            setError("Vui lòng chọn File nhạc.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("genre", genre);
        if (albumId !== "") formData.append("albumId", albumId);
        else if (isEditMode) formData.append("albumId", "");
        if (trackNumber) formData.append("track_number", trackNumber);
        if (lyricsContent.trim()) {
            formData.append("lyricsContent", lyricsContent);
            formData.append("language", language);
        }
        if (audioFile) formData.append("audioFile", audioFile);
        if (imageFile) formData.append("imageFile", imageFile);
        formData.append("duration", getDurationMock());

        // CHỈ GỬI ID CỦA CÁC ARTIST CỘNG TÁC (COLLAB IDs), loại bỏ ID chính
        const artistIdsToSend = selectedCollabIds
            .map(id => Number(id))
            .filter(id => id && id !== primaryArtistId); 

        // Gửi mảng ID dưới dạng JSON string (Chỉ chứa ID Cộng tác viên)
        formData.append("artistIds", JSON.stringify(artistIdsToSend));
        
        try {
            if (isEditMode) {
                // Sử dụng ID từ detailSongData (đã load đầy đủ) hoặc songToEdit (dữ liệu ban đầu)
                const submitId = detailSongData?.id || songToEdit.id; 
                await updateMySongApi(submitId, formData);
                showToast("Đã cập nhật bài hát. Chờ duyệt lại.");
            } else {
                await createSongApi(formData);
                showToast("Đã gửi bài hát và chờ duyệt.");
            }
            onComplete();
            onClose();
        } catch (err) {
            console.error("Lỗi API:", err);
            setError(err.response?.data?.message || "Lỗi gửi dữ liệu.");
        } finally {
            setLoading(false);
        }
    };


    if (loading && isEditMode) return (
        <div className="sm-modal-overlay">
            <div className="sm-modal-content">Đang tải chi tiết bài hát...</div>
        </div>
    );
    
    return (
        <div className="sm-modal-overlay" onClick={onClose}>
            <div className="sm-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="sm-modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <h2>{isEditMode ? "Sửa Bài Hát" : "Tải Lên Bài Hát"}</h2>
                {error && <p className="sm-modal-error">{error}</p>}

                <form className="sm-modal-form" onSubmit={handleSubmit}>
                    <div className="sm-modal-left">
                        {/* INPUTS BÌNH THƯỜNG */}
                        <div className="sm-form-group">
                            <label>Tiêu đề *</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} />
                        </div>

                        <div className="sm-form-group">
                            <label>Thể loại *</label>
                            <select value={genre} onChange={e => setGenre(e.target.value)}>
                                <option value="">— chọn —</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm-form-group">
                            <label>Album</label>
                            <select value={albumId} onChange={e => setAlbumId(e.target.value)}>
                                <option value="">(Single)</option>
                                {artistAlbums.map(a => (
                                    <option key={a.id} value={a.id}>{a.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm-form-group">
                            <label>File Nhạc {isEditMode ? "(Không bắt buộc)" : "*"}</label>
                            <input 
                                type="file" 
                                accept=".mp3,.wav" 
                                onChange={e => handleFileChange(e, "audio")} 
                                required={!isEditMode} 
                            />
                        </div>

                        {/* HIỂN THỊ NGHỆ SĨ CỘNG TÁC VIÊN */}
                        <div className="sm-form-group">
                            <label>Nghệ sĩ cộng tác</label>
                            <div className="collab-dropdown">
                                <div
                                    className="collab-dropdown-btn"
                                    onClick={() => setCollabOpen(o => !o)}
                                >
                                    {selectedCollabIds.length === 0
                                        ? "Chọn nghệ sĩ"
                                        : `${selectedCollabIds.length} nghệ sĩ đã chọn`}
                                    <span className="arrow">▼</span>
                                </div>

                                <div className={`collab-dropdown-menu ${collabOpen ? "open" : ""}`}>
                                    {allArtists.map(a => {
                                        const isSelected = selectedCollabIds.includes(a.id.toString());
                                        return (
                                            <div
                                                className={`collab-item ${isSelected ? 'selected' : ''}`}
                                                key={a.id}
                                                onClick={() => toggleCollab(a.id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    readOnly
                                                />
                                                {a.stage_name || a.name} 
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sm-modal-right">
                        {/* INPUTS CỘT PHẢI */}
                        <div className="sm-form-group">
                            <label>Track #</label>
                            <input type="number" value={trackNumber} onChange={e => setTrackNumber(e.target.value)} />
                        </div>

                        <div className="sm-form-group">
                            <label>Lyrics</label>
                            <textarea rows="5" value={lyricsContent} onChange={e => setLyricsContent(e.target.value)} />
                        </div>

                        <div className="sm-form-group">
                            <label>Ngôn ngữ</label>
                            <select value={language} onChange={e => setLanguage(e.target.value)}>
                                <option value="vi">Việt</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <div className="sm-form-group">
                            <label>Ảnh bìa</label>
                            <div className="sm-avatar-preview">
                                <img src={imagePreview} alt="Ảnh bìa bài hát" />
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, "image")} />
                            </div>
                        </div>
                    </div>

                    <div className="sm-form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Tải lên"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


SongFormModal.propTypes = {
    currentArtistId: () => {} 
};

export default SongFormModal;