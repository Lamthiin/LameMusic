// music-frontend/src/components/MainAppLayout.jsx (BẢN SỬA LỖI)
import React from 'react';
import { Outlet } from 'react-router-dom';
// import { Navigate } from 'react-router-dom'; // <-- KHÔNG CẦN
// import { useAuth } from '../context/AuthContext'; // <-- KHÔNG CẦN

import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import Header from './Header'; 
import '../App.css'; 

const MainAppLayout = () => {
  // === XÓA HẾT LOGIC KIỂM TRA AUTH Ở ĐÂY ===
  // const { isAuthenticated, isLoading } = useAuth(); // <-- XÓA
  // if (isLoading) { ... } // <-- XÓA
  // if (!isAuthenticated) { ... } // <-- XÓA
  // =========================================

  // Chỉ cần return (trả về) layout
  return (
    <div className="app-container">
      <Header /> 
      <Sidebar />
      <div className="main-content">
        <Outlet /> {/* Render Home, Search... */}
      </div>
      <PlayerBar />
    </div>
  );
};

export default MainAppLayout;