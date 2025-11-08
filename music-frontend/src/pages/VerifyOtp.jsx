// music-frontend/src/pages/VerifyOtp.jsx (TẠO MỚI)
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthHeader from '../components/AuthHeader';
// import './Login.css'; // Dùng chung CSS cho form

// Sử dụng instance axios đã được cấu hình (không có token)
const api = axios.create({ baseURL: 'http://localhost:3000' }); 

const VerifyOtp = () => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); 
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); // Lấy email từ state

  // Lấy email từ state truyền từ trang Đăng ký
  const email = location.state?.email; 

  if (!email) {
    // Nếu không có email (truy cập trực tiếp), đá về trang đăng ký
    navigate('/register', { replace: true });
    return null;
  }
  
  // === HÀM GỬI LẠI MÃ (API /auth/resend-otp) ===
  const handleResend = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Gọi API resend-otp
      const response = await api.post('/auth/resend-otp', { email: email });
      setSuccess(response.data.message); // Hiển thị thông báo thành công
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi lại mã thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // === HÀM XÁC THỰC MÃ (API /auth/verify-otp) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Gọi API xác thực OTP
      await api.post('/auth/verify-otp', {
        email: email,
        otpCode: otpCode,
      });

      // Nếu thành công: Chuyển hướng về Login và truyền thông báo
      navigate('/login', { state: { message: 'Tài khoản đã được kích hoạt thành công!' } });

    } catch (err) {
      // Lỗi hết hạn hoặc mã sai
      setError(err.response?.data?.message || 'Xác nhận thất bại. Vui lòng kiểm tra lại mã.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeader />
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Xác nhận Email</h2>
          <p className="sub-text">
            Mã xác nhận (OTP) đã được gửi đến: <strong>{email}</strong>
          </p>
          
          {/* Hiển thị lỗi và thông báo thành công */}
          {error && <p className="error-message-general">{error}</p>}
          
          <input
            type="text"
            placeholder="Nhập mã OTP (6 chữ số)"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            required
            maxLength={6}
          />
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Đang xác nhận...' : 'Xác Nhận'}
          </button>
          
          {/* NÚT GỬI LẠI MÃ */}
          <p 
            className="resend-link" 
            onClick={handleResend} 
            style={{ cursor: 'pointer', marginTop: '15px', color: 'var(--color-accent)' }}
          >
            Bạn chưa nhận được mã? **Gửi lại mã xác thực**
          </p>
          {success && <p className="success-message">{success}</p>} 
          
        </form>
      </div>
    </>
  );
};

export default VerifyOtp;