// music-frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component này sẽ bọc các route cần bảo vệ.
 * Nó kiểm tra trạng thái đăng nhập từ AuthContext.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Nếu AuthContext vẫn đang "kiểm tra" token
  if (isLoading) {
    return <div>Đang tải...</div>; // Hoặc một component Spinner đẹp hơn
  }

  // Nếu KHÔNG đăng nhập, điều hướng về trang /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu ĐÃ đăng nhập, cho phép hiển thị các route con (Home, Search, v.v.)
  return <Outlet />;
};

export default ProtectedRoute;