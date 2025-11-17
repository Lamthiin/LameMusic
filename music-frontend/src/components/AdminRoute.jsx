// music-frontend/src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
 // Import layout chính

const AdminRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // 1. Chờ AuthContext kiểm tra
  if (isLoading) {
    return <div>Đang tải trang quản trị...</div>;
  }

  // 2. Nếu chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // 3. Nếu đăng nhập nhưng KHÔNG PHẢI ADMIN
  if (user.role !== 'admin') {
    // Thông báo lỗi và "đá" về trang chủ
    alert('Bạn không có quyền truy cập trang này!');
    return <Navigate to="/" replace />;
  }

  // 4. NẾU LÀ ADMIN: Hiển thị Layout chính (Header, Sidebar)
  // và bên trong là AdminPage (do <Outlet /> render)
  return <Outlet />;
};

export default AdminRoute;