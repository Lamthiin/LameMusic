// src/components/CreatePlaylistModal.jsx – ĐẸP, ĐỘC LẬP HOÀN TOÀN
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './CreatePlaylistModal.css';

const api = axios.create({ baseURL: 'http://localhost:3000' });

const CreatePlaylistModal = ({ isOpen, onClose, onPlaylistCreated }) => {
  const token = localStorage.getItem('accessToken');
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleClose = () => {
    setName('');
    setPrivacy('public');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.post(
        '/playlists',
        {
          name: name.trim(),
          isPrivate: privacy === 'private',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onPlaylistCreated(response.data.playlist);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi không xác định khi tạo Playlist.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="cp-overlay" onClick={handleClose}>
        <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
          <button className="cp-close-btn" onClick={handleClose}>
            <FaTimes size={20} />
          </button>

          <h2 className="cp-title">Tạo Playlist mới</h2>

          <form onSubmit={handleSubmit} className="cp-form">
            <div className="cp-input-wrapper">
              <input
                type="text"
                placeholder="Nhập tên Playlist..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="cp-input"
              />
            </div>

            <div className="cp-privacy-group">
              <label className="cp-radio-label">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={privacy === 'public'}
                  onChange={() => setPrivacy('public')}
                  disabled={loading}
                />
                <span className="cp-radio-custom"></span>
                Công khai
              </label>
              <label className="cp-radio-label">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={privacy === 'private'}
                  onChange={() => setPrivacy('private')}
                  disabled={loading}
                />
                <span className="cp-radio-custom"></span>
                Riêng tư
              </label>
            </div>

            {error && <p className="cp-error">{error}</p>}

            <button 
              type="submit" 
              className="cp-create-btn" 
              disabled={loading || !name.trim()}
            >
              {loading ? 'Đang tạo...' : 'Tạo Playlist'}
            </button>
          </form>
        </div>
      </div>

      {/* Toast thành công */}
      {showToast && (
        <div className="cp-toast">
          <span>Playlist đã được tạo thành công!</span>
        </div>
      )}
    </>
  );
};

export default CreatePlaylistModal;