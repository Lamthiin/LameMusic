// music-frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Thư viện để giải mã token
import { loginApi } from '../utils/api'; // Chỉ cần import loginApi

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider (Component cha bọc toàn bộ ứng dụng)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Lưu thông tin user { userId, username, role }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Trạng thái kiểm tra token khi tải lại trang
  const navigate = useNavigate();

  // 3. Tự động kiểm tra đăng nhập khi tải lại trang (useEffect)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        
        // Kiểm tra xem token còn hạn không
        if (decodedUser.exp * 1000 < Date.now()) {
          // Token hết hạn
          logout(); 
        } else {
          // Token còn hạn
          setUser(decodedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Token bị lỗi, coi như đăng xuất
        logout(); 
      }
    }
    // Dù có token hay không, cũng phải dừng loading
    setIsLoading(false); 
  }, []);

  // 4. Hàm Login (Được gọi từ trang Login.jsx)
  const login = async (email, password) => {
    try {
      // Gọi API, token sẽ được lưu vào localStorage (nhờ api.js)
      const token = await loginApi(email, password); 
      
      // Giải mã token (lấy thông tin user)
      const decodedUser = jwtDecode(token.accessToken);
      
      // Cập nhật state (để ứng dụng biết đã đăng nhập)
      setUser(decodedUser);
      setIsAuthenticated(true);
      
      // === LOGIC PHÂN LUỒNG QUAN TRỌNG ===
      // Kiểm tra vai trò (role) từ token
      if (decodedUser.role === 'admin') {
        // Nếu là admin, chuyển hướng về trang Admin
        navigate('/admin');
      } else {
        // Nếu là listener/artist/writer, chuyển hướng về trang chủ
        navigate('/'); 
      }
      // =============================

    } catch (error) {
      // Ném lỗi ra để trang Login.jsx có thể bắt và hiển thị
      throw error;
    }
  };

  // 5. Hàm Logout
  const logout = () => {
    localStorage.removeItem('accessToken'); // Xóa token
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login'); // Chuyển về trang login
  };

  // 6. Giá trị được cung cấp cho toàn bộ App
  const value = {
    user,
    isAuthenticated,
    isLoading, // Dùng cho Protected Routes
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Chỉ render các component con khi đã kiểm tra token xong */}
      {!isLoading && children} 
    </AuthContext.Provider>
  );
};

// 7. Hook tùy chỉnh (để dễ dàng sử dụng context)
export const useAuth = () => {
  return useContext(AuthContext);
};