// music-frontend/src/components/AlbumFormModal.jsx
import React, { useState, useEffect } from 'react';
import { createAlbumApi, updateAlbumApi } from '../../utils/api';
import './AlbumFormModal.css'; // 👈 File CSS mới
import { FaTimes } from 'react-icons/fa';

const showToast = (message, type = 'success') => { alert(message); };

const AlbumFormModal = ({ onClose, onComplete, albumToEdit }) => {
    const isEditMode = Boolean(albumToEdit); 

    const [title, setTitle] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [coverFile, setCoverFile] = useState(null);
    const [preview, setPreview] = useState('/images/default-album.png');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            setTitle(albumToEdit.title);
            setReleaseDate(new Date(albumToEdit.release_date).toISOString().split('T')[0]);
            setPreview(albumToEdit.cover_url);
        }
    }, [isEditMode, albumToEdit]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title || !releaseDate) {
            setError('Vui lòng điền Tiêu đề và Ngày phát hành.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('release_date', releaseDate);
        if (coverFile) formData.append('coverFile', coverFile);

        try {
            if (isEditMode) {
                await updateAlbumApi(albumToEdit.id, formData);
                showToast('Cập nhật Album thành công!');
            } else {
                await createAlbumApi(formData);
                showToast('Tạo Album mới thành công!');
            }
            onComplete();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || (isEditMode ? 'Sửa thất bại' : 'Tạo thất bại'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="album-modal-overlay" onClick={onClose}>
            <div className="album-modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="album-modal-close" onClick={onClose}><FaTimes /></button>
                <h2>{isEditMode ? 'Sửa Album' : 'Tạo Album Mới'}</h2>

                <form className="album-form" onSubmit={handleSubmit}>
                    {error && <p className="album-error">{error}</p>}

                    <div className="album-upload-section">
                        <label>Ảnh bìa Album ({isEditMode ? 'Để trống nếu không đổi' : 'Bắt buộc'})</label>
                        <div className="album-preview-box">
                            <img src={preview} alt="Album Preview" className="album-preview-img" />
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                required={!isEditMode}
                            />
                        </div>
                    </div>

                    <div className="album-field">
                        <label>Tiêu đề Album:</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>

                    <div className="album-field">
                        <label>Ngày phát hành:</label>
                        <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} required />
                    </div>

                    <div className="album-buttons">
                        <button type="submit" disabled={loading} className="album-btn">
                            {loading ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo Album')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AlbumFormModal;
