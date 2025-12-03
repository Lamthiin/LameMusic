// music-frontend/src/components/ReportModal.jsx (TẠO MỚI)
import React, { useState } from 'react';
import { api } from '../../utils/api'; // Sử dụng api instance
import './ChangePasswordModal.css'; // Dùng CSS Modal chung
import { FaTimes, FaFlag } from 'react-icons/fa';

const showToast = (message) => { alert(message); };

const ReportModal = ({ songId, songTitle, onClose, onReportSent }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Vui lòng nhập tiêu đề/lý do báo cáo.');
            return;
        }

        setLoading(true);

        try {
            // API Backend: POST /report (Protected)
            const response = await api.post('/report', {
                songId: parseInt(songId), // Bắt buộc là số
                title: title,
                description: description
            });

            showToast(`Báo cáo đã được gửi thành công! Mã: ${response.data.reportId}`, 'success');
            onReportSent(); // Gọi callback để đóng/tải lại
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Gửi báo cáo thất bại.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
                <h2><FaFlag /> Báo cáo Vi phạm Nội dung</h2>
                <p className="subtle-text">Bài hát: <strong>{songTitle}</strong></p>

                <form className="profile-edit-form" onSubmit={handleSubmit}>
                    {error && <p className="modal-error">{error}</p>}
                    
                    {/* Trường Lý do */}
                    <div className="form-group">
                        <label>Lý do chính (Tiêu đề):</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            maxLength={250}
                            placeholder="Ví dụ: Nội dung vi phạm bản quyền / Không phù hợp"
                            required
                        />
                    </div>

                    {/* Trường Mô tả chi tiết */}
                    <div className="form-group">
                        <label>Mô tả chi tiết (Tùy chọn):</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            rows="4"
                            placeholder="Cung cấp thêm chi tiết về vi phạm..."
                        />
                    </div>
                    
                    <div className="form-buttons">
                        <button type="submit" disabled={loading} className="btn-create-new">
                            {loading ? 'Đang gửi...' : 'Gửi Báo cáo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;