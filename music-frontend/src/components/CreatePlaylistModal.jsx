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

      // ✅ Hiện toast chỉ 1 lần duy nhất
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
      <div className="playlist-modal-overlay" onClick={handleClose}>
        <div className="playlist-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="playlist-close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
          <h2>Tạo Playlist mới</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nhập tên Playlist..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />

            <div className="playlist-privacy-group">
              <label>
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={privacy === 'public'}
                  onChange={() => setPrivacy('public')}
                  disabled={loading}
                />
                Công khai
              </label>
              <label>
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={privacy === 'private'}
                  onChange={() => setPrivacy('private')}
                  disabled={loading}
                />
                Riêng tư
              </label>
            </div>

            {error && <p className="playlist-error">{error}</p>}

            <button type="submit" className="playlist-create-btn" disabled={loading || !name.trim()}>
              {loading ? 'Đang tạo...' : 'Tạo Playlist'}
            </button>
          </form>
        </div>
      </div>

      {/* Toast */}
      {showToast && <div className="playlist-toast">Tạo playlist thành công!</div>}
    </>
  );
};

export default CreatePlaylistModal;
