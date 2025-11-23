// music-frontend/src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthHeader from '../../components/user/AuthHeader';
import './Login.css'; 

const api = axios.create({ baseURL: 'http://localhost:3000' }); 

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  
  // Lấy email từ state (truyền từ ForgotPassword.jsx)
  const email = location.state?.email; 

  if (!email) {
    // Nếu không có email, đá về trang yêu cầu
    navigate('/forgot-password', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và Xác nhận Mật khẩu không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    
    try {
      // Gọi API Reset Password
      await api.post('/auth/reset-password-otp', {
        email: email,
        otpCode: otpCode,
        newPassword: newPassword,
      });

      setResetComplete(true);
      // Chuyển hướng về Login sau 3 giây
      setTimeout(() => navigate('/login'), 3000); 

    } catch (err) {
      setError(err.response?.data?.message || 'Đặt lại thất bại. Mã OTP không hợp lệ/hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeader />
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Đặt Lại Mật Khẩu</h2>
          
          {resetComplete ? (
            <p className="success-message">Mật khẩu đã được thay đổi! Đang chuyển hướng...</p>
          ) : (
            <>
              {error && <p className="error-message-general">{error}</p>}
              
              <p className="sub-text">Đặt lại mật khẩu cho: <span className="email-highlight">{email}</span>
</p>

              <input
                type="text"
                placeholder="Nhập mã OTP 6 chữ số"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                maxLength={6}
              />
              
              <input
                type="password"
                placeholder="Mật khẩu Mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Xác nhận Mật khẩu Mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Đang xác nhận...' : 'Đặt Lại Mật Khẩu'}
              </button>
            </>
          )}
        </form>
      </div>
    </>
  );
};

export default ResetPassword;