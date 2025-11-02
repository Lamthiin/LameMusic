// music-frontend/src/pages/AdminPage.jsx
import React from 'react';
import './AdminPage.css'; // File CSS riêng

const AdminPage = () => {
  return (
    <div className="admin-container">
      <h1>Chào mừng Admin!</h1>
      <p>Đây là khu vực quản trị của Lame Music.</p>
      
      <div className="admin-grid">
        <div className="admin-widget">
          <h2>Quản lý Người dùng</h2>
          <p>Xem, sửa, xóa người dùng.</p>
          <button>Đi đến</button>
        </div>
        <div className="admin-widget">
          <h2>Quản lý Bài hát</h2>
          <p>Xem, sửa, xóa bài hát.</p>
          <button>Đi đến</button>
        </div>
        <div className="admin-widget">
          <h2>Quản lý Blog</h2>
          <p>Viết bài, duyệt bài.</p>
          <button>Đi đến</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;