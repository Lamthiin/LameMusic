// music-frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthHeader from '../../components/user/AuthHeader';
import './Login.css'; // Dùng chung CSS

// Dùng instance Axios cơ bản (vì chưa đăng nhập, không cần interceptor)
const api = axios.create({ baseURL: 'http://localhost:3000' }); 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    
    try {
      // Gọi API Forgot Password
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message); // Hiển thị thông báo thành công từ Backend
      
      // Chuyển hướng sang trang ResetPassword và truyền email (dù thành công hay thất bại)
      setTimeout(() => {
        navigate('/reset-password', { state: { email: email } });
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Yêu cầu thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeader />
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Quên Mật Khẩu</h2>
          
          {error && <p className="error-message-general">{error}</p>}

          <p className="sub-text" style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            Vui lòng nhập địa chỉ email để đặt lại mật khẩu.
          </p>

          <input
            type="email"
            placeholder="Địa chỉ Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="login-button" disabled={loading || !!message}>
            {loading ? 'Đang gửi...' : 'Gửi Mã Đặt Lại'}
          </button>

          {message && <p className="success-message">{message}</p>}
        </form>
      </div>
    </>
  );
};

export default ForgotPassword;