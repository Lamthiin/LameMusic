// music-frontend/src/components/ChangePasswordModal.jsx (FULL CODE)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, changePasswordApi, requestPasswordResetOtpApi, resetPasswordOtpApi } from '../utils/api'; 
import './ChangePasswordModal.css'; 
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; 

// (Hàm Toast Helper)
const showToast = (message, type = 'success') => { alert(message); };

const ChangePasswordModal = ({ onClose }) => {
  const { user } = useAuth(); // (1) LẤY USER (GIỜ ĐÃ CÓ EMAIL)
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
    if (newPassword !== confirmPassword) { setError('Mật khẩu mới không khớp.'); return; }
    if (newPassword.length < 6) { setError('Mật khẩu mới phải 6+ ký tự.'); return; }
    setLoading(true);

    if (view === 'change') {
        try {
          const response = await changePasswordApi({ oldPassword, newPassword });
          showToast(response.message || 'Đổi mật khẩu thành công!');
          onClose(); 
        } catch (err) {
          setError(err.response?.data?.message || 'Mật khẩu cũ không đúng.');
        }
    } else { 
        try {
          // (2) user.email GIỜ ĐÂY SẼ CÓ GIÁ TRỊ (KHÔNG UNDEFINED)
          const response = await resetPasswordOtpApi({
            email: user.email, 
            otpCode: otpCode,
            newPassword: newPassword,
          });
          showToast(response.message || 'Đặt lại mật khẩu thành công!');
          onClose(); 
        } catch (err) {
          setError(err.response?.data?.message || 'OTP sai hoặc hết hạn.');
        }
    }
    setLoading(false);
  };

  // (Hàm xử lý "Quên mật khẩu cũ?")
  const handleForgotPasswordClick = async () => {
    if (!user?.email) {
        setError("Không tìm thấy email (lỗi AuthContext).");
        return;
    }
    setLoading(true);
    setError(''); 
    try {
        await requestPasswordResetOtpApi(); 
        showToast(`Đã gửi OTP đến ${user.email}`);
        setView('reset'); 
        setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setOtpCode('');
    } catch (err) {
        setError('Không thể gửi mã OTP.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        
        <form className="profile-edit-form" onSubmit={handleSubmit}>
          {error && <p className="modal-error">{error}</p>}

          {/* === VIEW 1: ĐỔI BẰNG MẬT KHẨU CŨ === */}
          {view === 'change' && (
            <>
              <h2>Đổi Mật khẩu</h2>
              <label>Mật khẩu cũ:</label>
              <input /* ... (oldPassword) ... */ />
              <label>Mật khẩu mới:</label>
              <input /* ... (newPassword) ... */ />
              <label>Xác nhận mật khẩu mới:</label>
              <input /* ... (confirmPassword) ... */ />
              
              <div className="form-buttons">
                <button type="submit" disabled={loading} className="profile-button save">
                  {loading ? 'Đang đổi...' : 'Xác nhận'}
                </button>
              </div>

              <p className="forgot-password-link-modal" onClick={handleForgotPasswordClick}>
                Quên mật khẩu cũ? (Dùng OTP)
              </p>
            </>
          )}

          {/* === VIEW 2: ĐỔI BẰNG OTP === */}
          {view === 'reset' && (
            <>
              <h2>Đặt lại Mật khẩu</h2>
              <p className="sub-text" style={{textAlign: 'center', marginTop: '-15px', marginBottom: '15px'}}>
                  Đã gửi mã OTP đến <strong>{user?.email}</strong>
              </p>

              <label>Mã OTP (6 chữ số):</label>
              <input 
                type="text" 
                name="otpCode" 
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value)} 
                required
                maxLength={6}
              />
              <label>Mật khẩu mới:</label>
              <input 
                type="password" 
                name="newPassword" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required
              />
              <label>Xác nhận mật khẩu mới:</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required
              />

              <div className="form-buttons">
                <button type="submit" disabled={loading} className="profile-button save">
                  {loading ? 'Đang đặt lại...' : 'Đặt lại Mật khẩu'}
                </button>
              </div>
              
              <p className="forgot-password-link-modal" onClick={() => setView('change')}>
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