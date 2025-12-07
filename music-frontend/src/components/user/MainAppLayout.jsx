// music-frontend/src/components/MainAppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';
import PlayerBar from './PlayerBar';
import '../../App.css';

const MainAppLayout = () => {
  return (
    <div className="app-container">
      {/* Sidebar fixed full height */}
      <Sidebar />

      {/* Header fixed, cùng level với Sidebar → không bị đè */}
      <Header />

      {/* Phần nội dung chính + player */}
      <div className="right-section">
        <main className="main-content">
          <Outlet /> {/* Home, Search, Album, v.v. */}
        </main>
        <PlayerBar />
      </div>
    </div>
  );
};

export default MainAppLayout;