// music-frontend/src/pages/Profile/ProfileInfo.jsx
import React, { useState, useEffect } from 'react';
import { getMyProfileApi, updateMyProfileApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from '../../components/user/ChangePasswordModal';
import './Profile.css';

const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} show`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
};

const ProfileInfo = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    gender: 'prefer not to say',
    birth_year: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await getMyProfileApi();
        setProfile(res);
        setFormData({
          username: res.username || '',
          gender: res.gender || 'prefer not to say',
          birth_year: res.birth_year || '',
        });
      } catch (err) {
        showToast('Không thể tải thông tin', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      showToast('Vui lòng nhập họ tên', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        birth_year: formData.birth_year ? parseInt(formData.birth_year, 10) : null,
      };
      const res = await updateMyProfileApi(data);
      setProfile(res);
      showToast('Cập nhật thành công!');
      setIsEditing(false);
    } catch (err) {
      const msg = err.response?.data?.message;
      const text = Array.isArray(msg) ? msg.join(', ') : msg || 'Lỗi server';
      showToast(text, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatGender = (g) => {
    const map = { male: 'Nam', female: 'Nữ', other: 'Khác' };
    return map[g] || 'Không muốn tiết lộ';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (!profile) {
    return <p className="error-text">Không thể tải thông tin. Vui lòng đăng nhập lại.</p>;
  }

  return (
    <div className="profile-info-container">
      <div className="profile-card">
        <h2>Thông tin Chung</h2>

        {!isEditing ? (
          // VIEW MODE
          <div className="profile-view-grid">
            <div className="profile-view-item">
              <strong>Họ và tên</strong>
              <p>{profile.username}</p>
            </div>
            <div className="profile-view-item">
              <strong>Email</strong>
              <p>{profile.email}</p>
            </div>
            <div className="profile-view-item">
              <strong>Giới tính</strong>
              <p>{formatGender(profile.gender)}</p>
            </div>
            <div className="profile-view-item">
              <strong>Năm sinh</strong>
              <p>{profile.birth_year || 'Chưa cung cấp'}</p>
            </div>
            <div className="profile-view-actions">
              <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                Chỉnh sửa
              </button>
            </div>
          </div>
        ) : (
          // EDIT MODE – 2 CỘT SIÊU ĐẸP
          <form className="profile-edit-form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Họ và tên <span className="required">*</span></label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength="2"
                placeholder="Nhập tên của bạn"
              />
            </div>

            <div className="form-row">
              <label>Giới tính</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="prefer not to say">Không muốn tiết lộ</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="form-row">
              <label>Năm sinh</label>
              <input
                type="number"
                name="birth_year"
                value={formData.birth_year}
                onChange={handleChange}
                min="1900"
                max="2010"
                placeholder="1998"
              />
            </div>

            <div className="form-actions-full">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-cancel">
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* ĐỔI MẬT KHẨU */}
        <div className="change-password-section">
          <h3>Đổi Mật khẩu</h3>
          <p>Thay đổi mật khẩu để tăng cường bảo mật tài khoản.</p>
          <button onClick={() => setShowPasswordModal(true)} className="btn btn-secondary">
            Đổi mật khẩu
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

export default ProfileInfo;