// music-frontend/src/pages/VerifyOtp.jsx (TẠO MỚI)
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthHeader from '../components/AuthHeader';
import './Login.css'; // Dùng chung CSS cho form

// Cần tạo một instance Axios để gọi API (hoặc dùng hàm từ api.js)
const api = axios.create({ baseURL: 'http://localhost:3000' }); 

const VerifyOtp = () => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); // Lấy dữ liệu truyền từ trang Register
  
  // Lấy email từ state (Đảm bảo không truy cập trực tiếp trang này mà không có email)
  const email = location.state?.email; 

  if (!email) {
    // Nếu không có email (truy cập trực tiếp), đá về trang đăng ký
    navigate('/register', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. GỌI API XÁC THỰC OTP
      await api.post('/auth/verify-otp', {
        email: email,
        otpCode: otpCode,
      });

      // 2. NẾU THÀNH CÔNG: CHUYỂN HƯỚNG VỀ TRANG LOGIN
      navigate('/login', { state: { message: 'Tài khoản đã được kích hoạt thành công! Vui lòng đăng nhập.' } });

    } catch (err) {
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
          
          {error && <p className="error-message">{error}</p>}
          
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
          
          <p className="register-link" onClick={() => navigate('/register')}>Gửi lại mã hoặc Đăng ký lại.</p>
        </form>
      </div>
    </>
  );
};

export default VerifyOtp;