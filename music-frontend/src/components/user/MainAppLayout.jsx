// music-frontend/src/components/MainAppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';
import PlayerBar from './PlayerBar';
import ChatWidget from './ChatWidget'; // <-- 1. Import Widget vào đây
import '../../App.css';

const MainAppLayout = () => {
  // Giả sử bạn lấy thông tin user từ localStorage hoặc Context
  const currentUser = JSON.parse(localStorage.getItem('user')); 

  return (
    <div className="app-container">
      <Sidebar />
      <Header />

      <div className="right-section">
        <main className="main-content">
          <Outlet /> 
        </main>
        <PlayerBar />
      </div>
      
      <ChatWidget currentUser={{ id: 1, username: 'test' }} />
    </div>
  );
};

export default MainAppLayout;