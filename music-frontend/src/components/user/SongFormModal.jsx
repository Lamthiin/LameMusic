import React, { useState, useEffect } from 'react';
import { createSongApi, updateMySongApi, getMyAlbumsApi } from '../../utils/api'; 
import './SongFormModal.css'; 
import { FaTimes, FaMusic, FaImage } from 'react-icons/fa';

const showToast = (message, type = 'success') => { alert(message); };
const getDurationMock = () => '180';

const LANGUAGE_OPTIONS = [ 
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' },
];

const SongFormModal = ({ onClose, onComplete, songToEdit }) => {
    const isEditMode = Boolean(songToEdit);

    const [title, setTitle] = useState(songToEdit?.title || '');
    const [genre, setGenre] = useState(songToEdit?.genre || '');
    const [albumId, setAlbumId] = useState(songToEdit?.album?.id || '');
    const [trackNumber, setTrackNumber] = useState(songToEdit?.track_number || '');
    const [lyricsContent, setLyricsContent] = useState(songToEdit?.lyrics?.content || '');
    const [language, setLanguage] = useState(songToEdit?.lyrics?.language || 'vi'); 
    const [audioFile, setAudioFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(
        songToEdit?.image_url || songToEdit?.cover_url || '/images/default-album.png'
    );
    const [artistAlbums, setArtistAlbums] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadAlbums = async () => {
            try {
                const albums = await getMyAlbumsApi();
                setArtistAlbums(albums);
            } catch (e) {
                console.error("Lỗi tải Album:", e);
            }
        };
        loadAlbums();
    }, []);

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
        if (albumId) formData.append('albumId', albumId);
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
                            <label>Album:</label>
                            <select value={albumId} onChange={(e) => setAlbumId(e.target.value)}>
                                <option value="">(Chọn Album - Single)</option>
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
                            <label>Thể loại:</label>
                            <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Pop, Rock..." required />
                        </div>
                        <div className="sm-form-group">
                            <label>Track #:</label>
                            <input type="number" value={trackNumber} onChange={(e) => setTrackNumber(e.target.value)} placeholder="Thứ tự" />
                        </div>
                        <div className="sm-form-group">
                            <label>Ngôn ngữ:</label>
                            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                {LANGUAGE_OPTIONS.map(opt => (
                                    <option key={opt.code} value={opt.code}>{opt.name}</option>
                                ))}
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
