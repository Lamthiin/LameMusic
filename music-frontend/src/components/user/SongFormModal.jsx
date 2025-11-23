import React, { useState, useEffect } from 'react';
import { createSongApi, updateMySongApi, getMyAlbumsApi, fetchCategories } from '../../utils/api'; 
import './SongFormModal.css'; 
import { FaTimes, FaMusic, FaImage } from 'react-icons/fa';

const showToast = (message) => { alert(message); };
const getDurationMock = () => '180';

const SongFormModal = ({ onClose, onComplete, songToEdit }) => {
    const isEditMode = Boolean(songToEdit);

    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [albumId, setAlbumId] = useState(''); 
    const [trackNumber, setTrackNumber] = useState('');
    const [lyricsContent, setLyricsContent] = useState('');
    const [language, setLanguage] = useState('vi'); 
    const [audioFile, setAudioFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('/images/default-album.png');
    const [artistAlbums, setArtistAlbums] = useState([]); 
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode && songToEdit) {
            setTitle(songToEdit.title || '');
            setGenre(songToEdit.genre || '');
            setAlbumId(songToEdit.album?.id?.toString() || ''); 
            setTrackNumber(songToEdit.track_number || '');
            setLyricsContent(songToEdit.lyrics?.content || '');
            setLanguage(songToEdit.lyrics?.language || 'vi');
            setImagePreview(songToEdit.image_url || songToEdit.album?.cover_url || '/images/default-album.png');
        }

        const loadDependencies = async () => {
            try {
                const [albumRes, categoryRes] = await Promise.all([
                    getMyAlbumsApi(),
                    fetchCategories()
                ]);
                setArtistAlbums(albumRes.map(a => ({ ...a, id: a.id.toString() })));
                setCategories(categoryRes);
            } catch (e) {
                console.error("Lỗi tải Dependencies:", e);
                setError("Lỗi tải Album hoặc Thể loại.");
            }
        };
        loadDependencies();
    }, [isEditMode, songToEdit]);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'audio') setAudioFile(file);
            if (type === 'image') {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!title || !genre || (!isEditMode && !audioFile)) {
            setError('Vui lòng điền Tiêu đề, Thể loại và Tải lên File nhạc.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('genre', genre); 
        if (albumId !== '') formData.append('albumId', albumId);
        else if (isEditMode) formData.append('albumId', '');
        if (trackNumber) formData.append('track_number', trackNumber);
        if (lyricsContent.trim()) {
            formData.append('lyricsContent', lyricsContent);
            formData.append('language', language);
        }
        formData.append('duration', getDurationMock());
        if (audioFile) formData.append('audioFile', audioFile);
        if (imageFile) formData.append('imageFile', imageFile);

        try {
            if (isEditMode) {
                await updateMySongApi(songToEdit.id, formData); 
                showToast('Cập nhật bài hát thành công! Vui lòng chờ duyệt lại.');
            } else {
                await createSongApi(formData);
                showToast('Bài hát đã được gửi và đang chờ Admin duyệt!');
            }
            onComplete();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Thao tác thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sm-modal-overlay" onClick={onClose}>
            <div className="sm-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="sm-modal-close-btn" onClick={onClose}><FaTimes /></button>
                <h2>{isEditMode ? 'Sửa Bài hát' : 'Tải lên Bài hát Mới'}</h2>

                <form className="sm-modal-form" onSubmit={handleSubmit}>
                    {error && <p className="sm-modal-error">{error}</p>}

                    {/* 2 CỘT */}
                    <div className="sm-modal-left">
                        <div className="sm-form-group">
                            <label>Tiêu đề:</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>

                        <div className="sm-form-group">
                            <label>Thể loại:</label>
                            <select value={genre} onChange={(e) => setGenre(e.target.value)} required>
                                <option value="" disabled>--- Chọn Thể loại ---</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm-form-group">
                            <label>Album:</label>
                            <select value={albumId} onChange={(e) => setAlbumId(e.target.value)}>
                                <option value="">(Single - Gỡ Album)</option>
                                {artistAlbums.map(album => (
                                    <option key={album.id} value={album.id}>{album.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm-form-group">
                            <label>File Nhạc:</label>
                            <input type="file" accept=".mp3,.wav" onChange={(e) => handleFileChange(e, 'audio')} required={!isEditMode} />
                        </div>

                        <div className="sm-form-group">
                            <label>Lyrics:</label>
                            <textarea value={lyricsContent} onChange={(e) => setLyricsContent(e.target.value)} rows="5" placeholder="Nhập lyrics..." />
                        </div>
                    </div>

                    <div className="sm-modal-right">
                        <div className="sm-form-group">
                            <label>Track #:</label>
                            <input type="number" value={trackNumber} onChange={(e) => setTrackNumber(e.target.value)} placeholder="Thứ tự" />
                        </div>

                        <div className="sm-form-group">
                            <label>Ngôn ngữ:</label>
                            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="vi">Tiếng Việt</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <div className="sm-form-group">
                            <label>Ảnh Bìa:</label>
                            <div className="sm-avatar-preview">
                                <img src={imagePreview} alt="Cover" />
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                            </div>
                        </div>
                    </div>

                    <div className="sm-form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Đang xử lý...' : (isEditMode ? 'Lưu & Gửi Duyệt lại' : 'Tải lên & Gửi duyệt')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SongFormModal;
