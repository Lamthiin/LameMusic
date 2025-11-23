// music-frontend/src/components/SongFormModal.jsx (BẢN SỬA LỖI FINAL)
import React, { useState, useEffect } from 'react';
import { createSongApi, updateMySongApi, getMyAlbumsApi } from '../../utils/api'; 
import './SongFormModal.css'; 
import '../../pages/ArtistDashboard/ArtistDashboard.css'; 
import { FaTimes, FaMusic, FaImage } from 'react-icons/fa';

const showToast = (message) => { alert(message); };
const getDurationMock = () => { return '180'; }; // Giả lập duration cho DTO

const SongFormModal = ({ onClose, onComplete, songToEdit }) => {
    const isEditMode = Boolean(songToEdit);

    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [albumId, setAlbumId] = useState(''); // Mặc định rỗng
    const [trackNumber, setTrackNumber] = useState('');
    const [lyricsContent, setLyricsContent] = useState('');
    const [language, setLanguage] = useState('vi'); 
    
    const [audioFile, setAudioFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('/images/default-album.png');
    
    const [artistAlbums, setArtistAlbums] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // === FIX 1: KHỞI TẠO STATE BAN ĐẦU KHI CHẾ ĐỘ SỬA MỞ ===
    useEffect(() => {
        if (isEditMode && songToEdit) {
            setTitle(songToEdit.title || '');
            setGenre(songToEdit.genre || '');
            // FIX LỖI: Khởi tạo Album ID (album?.id là số)
            setAlbumId(songToEdit.album?.id?.toString() || ''); 
            setTrackNumber(songToEdit.track_number || '');
            setLyricsContent(songToEdit.lyrics?.content || '');
            setLanguage(songToEdit.lyrics?.language || 'vi');
            setImagePreview(songToEdit.image_url || songToEdit.album?.cover_url || '/images/default-album.png');
        } else {
            // Đảm bảo các giá trị được reset khi tạo mới
            setTitle(''); setGenre(''); setAlbumId(''); 
            setTrackNumber(''); setLyricsContent(''); setLanguage('vi');
        }
        
        // Load danh sách Album
        const loadAlbums = async () => {
            try {
                const albums = await getMyAlbumsApi();
                // FIX: Map ID sang string vì <select> trả về string
                setArtistAlbums(albums.map(a => ({ ...a, id: a.id.toString() }))); 
            } catch (e) {
                console.error("Lỗi tải Album:", e);
            }
        };
        loadAlbums();
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
        
        // 1. Kiểm tra bắt buộc
        if (!title || !genre || (!isEditMode && !audioFile)) {
            setError('Vui lòng điền Tiêu đề, Thể loại và Tải lên File nhạc (bắt buộc khi tạo mới).');
            return;
        }

        setLoading(true);
        
        // 2. Tạo FormData
        const formData = new FormData();
        formData.append('title', title);
        formData.append('genre', genre); 
        
        // Xử lý Album ID (cần là chuỗi số)
        if (albumId) formData.append('albumId', albumId); 
        
        if (trackNumber) formData.append('track_number', trackNumber);
        if (lyricsContent.trim()) formData.append('lyricsContent', lyricsContent); 
        formData.append('language', language);
        formData.append('duration', getDurationMock()); 
        
        // === FIX 2: LOGIC UPLOAD/SỬA FILE ===
        if (audioFile) {
            // Nếu có file mới, gửi nó
            formData.append('audioFile', audioFile); 
        } else if (!isEditMode) {
             // Chỉ xảy ra khi tạo mới mà quên kiểm tra
            setError('Vui lòng chọn file nhạc.');
            setLoading(false);
            return;
        }
        
        // Gửi image file (nếu người dùng đã chọn file mới)
        if (imageFile) {
            formData.append('imageFile', imageFile); 
        }

        try {
            if (isEditMode) {
                // PATCH /song/my/:id
                await updateMySongApi(songToEdit.id, formData); 
                showToast('Cập nhật bài hát thành công! Vui lòng chờ duyệt lại.');
            } else {
                // POST /song/my
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

    const LANGUAGE_OPTIONS = [ 
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'en', name: 'English' },
    ];


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
                <h2>{isEditMode ? 'Sửa Bài hát' : 'Tải lên Bài hát Mới'}</h2>
                
                <form className="song-profile-edit-form" onSubmit={handleSubmit}>
    {error && <p className="song-modal-error">{error}</p>}

    <div className="song-form-left">
        <div className="song-form-group">
            <label>Tiêu đề:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="song-input" required />
        </div>
        <div className="song-form-group">
            <label>Thể loại:</label>
            <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Pop, Rock..." className="song-input" required />
        </div>
        <div className="song-form-group">
            <label>Album:</label>
            <select value={albumId} onChange={(e) => setAlbumId(e.target.value)} className="song-form-select">
                <option value="">(Chọn Album - Single)</option>
                {artistAlbums.map(album => (
                    <option key={album.id} value={album.id}>{album.title}</option>
                ))}
            </select>
        </div>
        <div className="song-form-group">
            <label>Track #:</label>
            <input type="number" value={trackNumber} onChange={(e) => setTrackNumber(e.target.value)} placeholder="Thứ tự" className="song-input" />
        </div>
    </div>

    <div className="song-form-right">
        <div className="song-form-group">
            <label>File Nhạc: <FaMusic /></label>
            <input type="file" accept=".mp3,.wav" onChange={(e) => handleFileChange(e, 'audio')} required={!isEditMode} className="song-input"/>
            {isEditMode && songToEdit?.file_url && <p className="song-subtle-text">File hiện tại: {songToEdit.file_url.split('/').pop()}</p>}
        </div>
        <div className="song-form-group song-avatar-upload-section">
            <label>Ảnh Bìa: <FaImage /></label>
            <div className="song-avatar-preview-box">
                <img src={imagePreview} alt="Cover Preview" className="song-avatar-preview"/>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="song-input"/>
            </div>
        </div>
        <div className="song-form-group">
            <label>Lời Bài Hát:</label>
            <textarea value={lyricsContent} onChange={(e) => setLyricsContent(e.target.value)} rows="5" className="song-textarea"/>
        </div>
        <div className="song-form-group">
            <label>Ngôn ngữ Lyrics:</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="song-form-select">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
            </select>
        </div>
    </div>

    <div className="song-form-buttons">
        <button type="submit" disabled={loading} className="song-button song-button-save">
            {loading ? 'Đang xử lý...' : (isEditMode ? 'Lưu & Gửi Duyệt lại' : 'Tải lên & Gửi duyệt')}
        </button>
    </div>
</form>

            </div>
        </div>
    );
};

export default SongFormModal;