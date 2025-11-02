// music-frontend/src/App.jsx (FULL CODE SỬA LỖI CRASH)
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Layouts
import MainAppLayout from './components/MainAppLayout'; 
import AdminRoute from './components/AdminRoute'; 

// Import Trang
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPage from './pages/AdminPage';
import SongDetail from './pages/SongDetail'; 
import ArtistDetail from './pages/ArtistDetail'; 
import VerifyOtp from './pages/VerifyOtp'; // <-- (1) IMPORT COMPONENT MỚI

function App() {
  return (
    <Routes>
      {/* 1. ROUTE PUBLIC KHÔNG CÓ LAYOUT (Login/Register) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* === (2) THÊM ROUTE BỊ THIẾU === */}
      <Route path="/verify-otp" element={<VerifyOtp />} /> 
      {/* ================================= */}
      
      {/* 2. ROUTE CHÍNH (LAYOUT GỐC: Header, Sidebar, PlayerBar) */}
      <Route path="/" element={<MainAppLayout />}> 
        
        {/* Index Route: Trang chủ (URL: /) */}
        <Route index element={<Home />} /> 
        
        {/* Trang chi tiết Bài hát */}
        <Route path="song/:id" element={<SongDetail />} /> 
        
        {/* Trang chi tiết Nghệ sĩ */}
        <Route path="artist/:id" element={<ArtistDetail />} /> 

        {/* Thêm các Route Public khác vào đây (Search, Blog...) */}
        <Route path="blog" element={<div>Trang Blog (Sắp ra mắt)</div>} />

        {/* 3. ROUTE ADMIN (BẢO VỆ RIÊNG) */}
        {/* Vì AdminRoute tự kiểm tra, chúng ta đặt nó là một route độc lập */}
        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminPage />} />
        </Route>
        
        {/* Catch-all cho các URL không hợp lệ (optional) */}
        <Route path="*" element={<div>404: Không tìm thấy trang này.</div>} />

      </Route>
      
    </Routes>
  );
}

export default App;