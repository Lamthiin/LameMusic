// music-frontend/src/pages/AdminPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-page">
      <h1 className="admin-title">Trang Quản Trị</h1>
      <p className="admin-subtitle">Chào mừng bạn đến bảng điều khiển của Lame Music.</p>

      <div className="admin-dashboard-grid">
        
        <div className="admin-dashboard-card">
          <h2>Quản lý Người dùng</h2>
          <p>Xem danh sách, nâng cấp quyền, khóa tài khoản.</p>
          <button onClick={() => navigate("/admin/users")}>Đi đến</button>
        </div>

        <div className="admin-dashboard-card">
          <h2>Quản lý Nghệ sĩ</h2>
          <p>Duyệt nghệ sĩ mới, chỉnh sửa hồ sơ nghệ sĩ.</p>
          <button onClick={() => navigate("/admin/artists")}>Đi đến</button>
        </div>

        <div className="admin-dashboard-card">
          <h2>Quản lý Bài hát</h2>
          <p>Thêm mới, duyệt bài hát, chỉnh sửa metadata.</p>
          <button onClick={() => navigate("/admin/songs")}>Đi đến</button>
        </div>

        <div className="admin-dashboard-card">
          <h2>Quản lý Album</h2>
          <p>Quản lý album, thêm bài hát vào album.</p>
          <button onClick={() => navigate("/admin/albums")}>Đi đến</button>
        </div>

      </div>
    </div>
  );
};

export default AdminPage;
