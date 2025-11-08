// music-frontend/src/components/MainAppLayout.jsx (BẢN SỬA LỖI)
//listener
import React from 'react';
import { Outlet } from 'react-router-dom';
// import { Navigate } from 'react-router-dom'; // <-- KHÔNG CẦN
// import { useAuth } from '../context/AuthContext'; // <-- KHÔNG CẦN

import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import Header from './Header'; 
import '../App.css'; 

const MainAppLayout = () => {

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