// music-frontend/src/pages/Register.jsx (BẢN FINAL ĐÃ SỬA LỖI CHUYỂN HƯỚNG)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerApi } from '../utils/api'; 
import './Register.css'; 
import AuthHeader from '../components/AuthHeader'; 

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('prefer not to say');
  const [birthYear, setBirthYear] = useState(''); 
  
  // Dùng Object để lưu trữ lỗi theo từng trường (username, email, ...)
  const [errors, setErrors] = useState({}); 
  const navigate = useNavigate();

  // === HÀM PHÂN TÍCH LỖI TỪ NESTJS ===
  const parseErrors = (errorMessages) => {
    const newErrors = {};
    if (Array.isArray(errorMessages)) {
      errorMessages.forEach(msg => {
        // Dựa vào nội dung lỗi để gán vào đúng key
        if (msg.includes('username') || msg.includes('Tên')) newErrors.username = msg;
        else if (msg.includes('email')) newErrors.email = msg;
        else if (msg.includes('password') || msg.includes('Mật khẩu')) newErrors.password = msg;
        else if (msg.includes('birth_year') || msg.includes('Năm sinh')) newErrors.birth_year = msg;
        else newErrors.general = msg; // Lỗi chung
      });
    } else {
      // Lỗi chuỗi đơn (409 Conflict)
      newErrors.general = errorMessages || 'Đăng ký thất bại. Lỗi kết nối.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Xóa lỗi cũ
    
    const dataToSend = {
      username,
      email,
      password,
      birth_year: birthYear ? parseInt(birthYear) : null, 
      gender,
    };
    
    try {
      // 1. GỌI API ĐĂNG KÝ
      const response = await registerApi(dataToSend);
      
      // 2. NẾU THÀNH CÔNG: CHUYỂN HƯỚNG SANG TRANG NHẬP OTP
      // Chúng ta truyền email sang trang OTP để biết đang xác nhận cho ai
      navigate('/verify-otp', { 
          state: { 
              email: response.email // <-- Lấy email từ response của Backend
          } 
      }); 

    } catch (err) {
      // Xử lý lỗi validation hoặc lỗi 409
      const errorData = err.response?.data;
      setErrors(parseErrors(errorData?.message));
    }
  };

  // Tạo 'years' (giữ nguyên)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= 1900; i--) {
    years.push(i);
  }

  return (
    <>
      <AuthHeader /> 
      
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Đăng Ký Tài Khoản</h2>
          
          {/* Lỗi chung (General Error - Lỗi 409, 500...) */}
          {errors.general && (
            <p className="error-message-general">{errors.general}</p>
          )}
          
          {/* Username */}
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {errors.username && <p className="inline-error">{errors.username}</p>}

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && <p className="inline-error">{errors.email}</p>}

          {/* Password */}
          <input
            type="password"
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && <p className="inline-error">{errors.password}</p>}

          {/* GIỚI TÍNH (Dropdown) */}
          <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="form-select"
          >
              <option disabled>Chọn Giới tính</option>
              <option value="prefer not to say">Không muốn tiết lộ</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
          </select>
          {errors.gender && <p className="inline-error">{errors.gender}</p>}

          {/* NĂM SINH (Dropdown) */}
          <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="form-select"
              required 
          >
              <option value="">Năm sinh (Bắt buộc)</option>
              {years.map(year => (
                  <option key={year} value={year}>{year}</option>
              ))}
          </select>
          {errors.birth_year && <p className="inline-error">{errors.birth_year}</p>}
          
          <button type="submit" className="login-button">Đăng Ký</button>
          <p className="register-link" onClick={() => navigate('/login')}>Đã có tài khoản? Đăng nhập</p>
        </form>
      </div>
    </>
  );
};

export default Register;