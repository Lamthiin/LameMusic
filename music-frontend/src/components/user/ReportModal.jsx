// src/components/ReportModal.jsx – ĐẸP, ĐỘC LẬP HOÀN TOÀN
import React, { useState } from 'react';
import { api } from '../../utils/api';
import './ReportModal.css';
import { FaTimes, FaFlag } from 'react-icons/fa';

const showToast = (message) => alert(message);

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
      const response = await api.post('/report', {
        songId: parseInt(songId),
        title: title.trim(),
        description: description.trim(),
      });

      showToast(`Báo cáo đã được gửi thành công! Mã: ${response.data.reportId}`);
      onReportSent?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gửi báo cáo thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <button className="report-close-btn" onClick={onClose}>
          <FaTimes size={18} />
        </button>

        <div className="report-header">
          <FaFlag className="report-icon" />
          <h2>Báo cáo Vi phạm</h2>
        </div>

        <p className="report-song-title">
          Bài hát: <strong>{songTitle}</strong>
        </p>

        {error && <div className="report-error">{error}</div>}

        <form onSubmit={handleSubmit} className="report-form">
          <div className="report-input-group">
            <label>Lý do báo cáo *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Vi phạm bản quyền, nội dung không phù hợp..."
              maxLength={200}
              required
              disabled={loading}
            />
          </div>

          <div className="report-input-group">
            <label>Mô tả chi tiết (tùy chọn)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Cung cấp thêm thông tin nếu cần..."
              disabled={loading}
            />
          </div>

          <div className="report-actions">
            <button type="submit" className="report-submit-btn" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi Báo cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;