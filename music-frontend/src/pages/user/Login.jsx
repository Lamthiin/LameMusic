// music-frontend/src/pages/Login.jsx (FULL CODE HOÀN CHỈNH)
import React, { useState, useEffect } from 'react'; 
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'; // <-- THÊM useLocation
import { useAuth } from '../../context/AuthContext'; 
import './Login.css'; 
import AuthHeader from '../../components/user/AuthHeader'; 
// (Không cần import loginApi vì nó được gọi qua AuthContext)

const Login = () => {
  // === STATE CỦA COMPONENT ===
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // <-- STATE HIỂN THỊ THÔNG BÁO

  // === HOOKS VÀ CONTEXT ===
  const { login } = useAuth(); 
  const navigate = useNavigate(); 
  const location = useLocation(); // <-- LẤY STATE TỪ CÁC TRANG TRƯỚC
  const [searchParams] = useSearchParams();

  // 1. XỬ LÝ THÔNG BÁO TỪ VERIFY OTP PAGE
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      
      // Xóa state sau khi hiển thị (để F5 không hiện lại)
      // Dùng replace: true để thay thế lịch sử
      navigate(location.pathname, { replace: true, state: {} }); 
    }
  }, [location.state, navigate, location.pathname]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage(''); // Xóa thông báo thành công cũ khi user cố gắng login
    
    try {
      // Gọi hàm login từ Context
      await login(email, password); 
      
    } catch (err) {
            if (err.response?.status === 429) {
                setError('Bạn đã nhập sai/gửi quá nhiều yêu cầu. Vui lòng thử lại sau 30 phút.');
            } else {
                setError(err.response?.data?.message || 'Đăng nhập thất bại.');
            }
          }
  };

  return (
    <>
      <AuthHeader />
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>

          <h2>Đăng Nhập</h2>
          
          {/* HIỂN THỊ THÔNG BÁO THÀNH CÔNG (TỪ OTP VERIFY) */}
          {successMessage && <p className="success-message">{successMessage}</p>}
          
          {/* HIỂN THỊ LỖI (TỪ API) */}
          {error && <p className="error-message-general">{error}</p>}
          
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
          
          {/* NÚT QUÊN MẬT KHẨU */}
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