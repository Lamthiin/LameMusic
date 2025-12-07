// src/components/ChangePasswordModal.jsx – ĐẸP, HOÀN CHỈNH, KHÔNG TRÙNG CLASS
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePasswordApi, requestPasswordResetOtpApi, resetPasswordOtpApi } from '../../utils/api';
import './ChangePasswordModal.css';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const showToast = (message) => alert(message);

const ChangePasswordModal = ({ onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('change');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải ít nhất 6 ký tự.');
      return;
    }
    setLoading(true);

    try {
      if (view === 'change') {
        await changePasswordApi({ oldPassword, newPassword });
        showToast('Đổi mật khẩu thành công!');
      } else {
        await resetPasswordOtpApi({
          email: user.email,
          otpCode,
          newPassword,
        });
        showToast('Đặt lại mật khẩu thành công!');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = async () => {
    if (!user?.email) {
      setError('Không tìm thấy email người dùng.');
      return;
    }
    setLoading(true);
    try {
      await requestPasswordResetOtpApi();
      showToast(`Đã gửi mã OTP đến ${user.email}`);
      setView('reset');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpCode('');
    } catch (err) {
      setError('Không thể gửi mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  if (!onClose) return null;

  return (
    <div className="cpw-overlay" onClick={onClose}>
      <div className="cpw-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cpw-close-btn" onClick={onClose}>
          <FaTimes size={20} />
        </button>

        <div className="cpw-header">
          <h2>{view === 'change' ? 'Đổi Mật Khẩu' : 'Đặt Lại Mật Khẩu'}</h2>
        </div>

        {error && <div className="cpw-error">{error}</div>}

        <form onSubmit={handleSubmit} className="cpw-form">
          {view === 'change' ? (
            <>
              <div className="cpw-input-group">
                <label>Mật khẩu cũ</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="cpw-input-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="cpw-input-group">
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="cpw-submit-btn" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
              </button>

              <p className="cpw-forgot-link" onClick={handleForgotPasswordClick}>
                Quên mật khẩu cũ? (Dùng OTP)
              </p>
            </>
          ) : (
            <>
              <p className="cpw-otp-info">
                Mã OTP đã được gửi đến <strong>{user?.email}</strong>
              </p>

              <div className="cpw-input-group">
                <label>Mã OTP (6 chữ số)</label>
                <input
                  type="text"
                  maxLength="6"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={loading}
                  placeholder="Nhập mã OTP"
                />
              </div>

              <div className="cpw-input-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="cpw-input-group">
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="cpw-submit-btn" disabled={loading}>
                {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </button>

              <p className="cpw-back-link" onClick={() => setView('change')}>
                Quay lại (Dùng mật khẩu cũ)
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;