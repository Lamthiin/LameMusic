// src/components/SongFormModal.jsx
import React, { useState, useEffect } from "react";
import {
    createSongApi,
    updateMySongApi,
    getMyAlbumsApi,
    fetchCategories,
    fetchAllArtistsApi
} from "../../utils/api";

import "./SongFormModal.css";
import { FaTimes } from "react-icons/fa";

const showToast = (msg) => alert(msg);
const getDurationMock = () => "180";

const SongFormModal = ({ onClose, onComplete, songToEdit, currentUserId }) => {
    const isEditMode = Boolean(songToEdit);

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

    // LOAD
    useEffect(() => {
        const loadAll = async () => {
            try {
                const [alb, cat, artists] = await Promise.all([
                    getMyAlbumsApi(),
                    fetchCategories(),
                    fetchAllArtistsApi()
                ]);

                setArtistAlbums(alb.map(a => ({ ...a, id: a.id.toString() })));
                setCategories(cat);
                setAllArtists(artists);
            } catch (e) {
                console.error(e);
                setError("Không thể tải dữ liệu.");
            }
        };

        // Prefill khi edit
        if (isEditMode && songToEdit) {
            setTitle(songToEdit.title || "");
            setGenre(songToEdit.genre || "");
            setAlbumId(songToEdit.album?.id?.toString() || "");
            setTrackNumber(songToEdit.track_number || "");
            setLyricsContent(songToEdit.lyrics?.lyrics || "");
            setLanguage(songToEdit.lyrics?.language || "vi");
            setImagePreview(songToEdit.image_url || "/images/default-album.png");

            const collabIds =
                songToEdit.songArtists
                    ?.map(sa => sa.artist)
                    .filter(a => a && a.id !== currentUserId)
                    .map(a => a.id.toString()) || [];

            setSelectedCollabIds(collabIds);
        }

        loadAll();
    }, [isEditMode, songToEdit, currentUserId]);

    // FILE
    const handleFileChange = (e, type) => {
        const f = e.target.files[0];
        if (!f) return;

        if (type === "audio") setAudioFile(f);
        if (type === "image") {
            setImageFile(f);
            setImagePreview(URL.createObjectURL(f));
        }
    };

    // COLLAPSE
    const toggleCollab = (id) => {
        const s = id.toString();
        setSelectedCollabIds(prev =>
            prev.includes(s)
                ? prev.filter(x => x !== s)
                : [...prev, s]
        );
    };

    // SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title || !genre || (!isEditMode && !audioFile)) {
            setError("Hãy nhập tiêu đề, thể loại và file nhạc.");
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

        formData.append("duration", getDurationMock());

        if (audioFile) formData.append("audioFile", audioFile);
        if (imageFile) formData.append("imageFile", imageFile);

        const allArtistIds = [currentUserId.toString(), ...selectedCollabIds];
        formData.append("artistIds", JSON.stringify(allArtistIds));

        try {
            if (isEditMode) {
                await updateMySongApi(songToEdit.id, formData);
                showToast("Đã cập nhật bài hát. Chờ duyệt lại.");
            } else {
                await createSongApi(formData);
                showToast("Đã gửi bài hát và chờ duyệt.");
            }
            onComplete();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi gửi dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    const collabArtists = allArtists.filter(a => a.id !== currentUserId);

    return (
        <div className="sm-modal-overlay" onClick={onClose}>
            <div className="sm-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="sm-modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <h2>{isEditMode ? "Sửa Bài Hát" : "Tải Lên Bài Hát"}</h2>

                {error && <p className="sm-modal-error">{error}</p>}

                <form className="sm-modal-form" onSubmit={handleSubmit}>
                    {/* LEFT */}
                    <div className="sm-modal-left">

                        <div className="sm-form-group">
                            <label>Tiêu đề</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} />
                        </div>

                        <div className="sm-form-group">
                            <label>Thể loại</label>
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
                            <label>File Nhạc</label>
                            <input type="file" accept=".mp3,.wav" onChange={e => handleFileChange(e, "audio")} required={!isEditMode} />
                        </div>

                        {/* DROPDOWN COLLAB */}
                        <div className="sm-form-group">
                            <label>Nghệ sĩ cộng tác</label>

                            <div className="collab-dropdown">
                                <div
                                    className="collab-dropdown-btn"
                                    onClick={() => setCollabOpen(o => !o)}
                                >
                                    {selectedCollabIds.length === 0
                                        ? "Chọn nghệ sĩ"
                                        : `${selectedCollabIds.length} nghệ sĩ`}
                                    <span className="arrow">▼</span>
                                </div>

                                <div className={`collab-dropdown-menu ${collabOpen ? "open" : ""}`}>
                                    {collabArtists.map(a => (
                                        <div
                                            className="collab-item"
                                            key={a.id}
                                            onClick={() => toggleCollab(a.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCollabIds.includes(a.id.toString())}
                                                readOnly
                                            />
                                            {a.stage_name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="sm-modal-right">

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
                                <img src={imagePreview} alt="" />
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

export default SongFormModal;
