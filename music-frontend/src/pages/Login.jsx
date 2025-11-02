// music-frontend/src/pages/Login.jsx (FULL CODE ĐÃ SỬA LỖI TRÙNG LẶP)
import React, { useState, useEffect } from 'react'; // <-- Gộp React, useState, useEffect
import { useNavigate, useSearchParams } from 'react-router-dom'; // <-- Gộp useNavigate, useSearchParams
import { useAuth } from '../context/AuthContext'; 
import './Login.css'; 
import AuthHeader from '../components/AuthHeader'; 
import { loginApi } from '../utils/api'; // <-- Cần import loginApi

const Login = () => {
  // === STATE CỦA COMPONENT ===
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); 
  
  // === HOOKS VÀ CONTEXT ===
  const { login } = useAuth(); 
  const navigate = useNavigate(); 
  const [searchParams] = useSearchParams(); 

  // Lắng nghe query parameter khi trang tải (Xử lý xác nhận email)
  useEffect(() => {
    // Kiểm tra query parameter 'status=verified'
    if (searchParams.get('status') === 'verified') {
      setSuccessMessage('Xác nhận Email thành công! Bạn có thể đăng nhập.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Gọi hàm login từ Context
      await login(email, password); 
      // Context sẽ tự xử lý chuyển hướng
      
    } catch (err) {
      // Xử lý lỗi từ Backend (sai email/pass)
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <>
      <AuthHeader />
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>

          {/* TIÊU ĐỀ CHỈ XUẤT HIỆN 1 LẦN */}
          <h2>Đăng Nhập</h2>
          
          {/* HIỂN THỊ THÔNG BÁO THÀNH CÔNG (từ Email Verification) */}
          {successMessage && <p className="success-message">{successMessage}</p>}
          
          {/* HIỂN THỊ LỖI (từ API) */}
          {error && <p className="error-message">{error}</p>}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <p 
             className="forgot-password-link" 
             onClick={() => navigate('/forgot-password')} 
          >
            Quên mật khẩu?
          </p>

          <button type="submit" className="login-button">Đăng Nhập</button>
          
          <p 
            className="register-link" 
            onClick={() => navigate('/register')}
          >
            Chưa có tài khoản? Đăng ký ngay!
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;