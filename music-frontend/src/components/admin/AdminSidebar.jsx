import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { socket } from "../../utils/socket"; 
import "./Admin.css"; 

import { 
  MdDashboard,
  MdPerson,
  MdAlbum,
  MdMusicNote,
  MdGroup,
  MdChat 
} from "react-icons/md";

const AdminSidebar = () => {
  const [totalUnread, setTotalUnread] = useState(0);
  const token = localStorage.getItem('accessToken');

  // Hàm lấy tổng số tin chưa đọc từ API
  const fetchTotalUnread = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3000/chat/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        // Tính tổng unreadCount của tất cả các user/phòng chat
        const total = data.reduce((acc, room) => acc + (Number(room.unreadCount) || 0), 0);
        setTotalUnread(total);
      }
    } catch (err) {
      console.error("Lỗi cập nhật badge sidebar chính:", err);
    }
  };

useEffect(() => {
  fetchTotalUnread();

  // Khi có tin nhắn mới, không cần gọi API ngay, cộng 1 vào state luôn cho nhanh
  socket.on('receive_message', (msg) => {
    console.log("🔔 Nhận tin nhắn mới!");
    setTotalUnread(prev => prev + 1); 
  });

  // Khi admin đọc tin nhắn ở tab Chat
  socket.on('admin_read_message', () => {
    fetchTotalUnread(); // Khi này mới gọi API để lấy con số chính xác từ DB
  });

  return () => {
    socket.off('receive_message');
    socket.off('admin_read_message');
  };
}, []);

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <img 
          src="/images/Logomusic.png" 
          alt="Logo" 
          className="admin-logo" 
        />
      </div>

      <nav className="admin-nav">
        <NavLink to="/admin" end className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}>
          <MdDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}>
          <MdGroup size={20} />
          <span>Quản lý tài khoản</span>
        </NavLink>

        {/* MỤC HỖ TRỢ KHÁCH HÀNG - CÓ BADGE TỰ ĐỘNG CẬP NHẬT */}
        <NavLink 
          to="/admin/support" 
          className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
        >
          <div className="admin-link-content">
            <MdChat size={20} />
            <span>Hỗ trợ khách hàng</span>
            
            {totalUnread > 0 && (
              <span className="sidebar-badge-red">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
        </NavLink>

        <NavLink to="/admin/artists" className={({ isActive }) => (isActive ? "active admin-link" : "admin-link")}>
          <MdPerson size={20} />
          <span>Quản lý nghệ sĩ</span>
        </NavLink>

        <NavLink to="/admin/albums" className={({ isActive }) => (isActive ? "active admin-link" : "admin-link")}>
          <MdAlbum size={20} />
          <span>Quản lý album</span>
        </NavLink>

        <NavLink to="/admin/songs" className={({ isActive }) => (isActive ? "active admin-link" : "admin-link")}>
          <MdMusicNote size={20} />
          <span>Quản lý bài hát</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminSidebar;