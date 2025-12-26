import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { socket } from "../../utils/socket";
import "./Admin.css";

import {
  MdDashboard,
  MdPerson,
  MdMusicNote,
  MdGroup,
  MdChat
} from "react-icons/md";

const AdminSidebar = () => {
  const [totalUnread, setTotalUnread] = useState(0);

  const token = localStorage.getItem("accessToken");
  const adminId = localStorage.getItem("userId");

  const fetchTotalUnread = async () => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3000/chat/rooms", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) return;

      const data = await res.json();

      if (Array.isArray(data)) {
        const total = data.reduce(
          (sum, r) => sum + (Number(r.unreadCount) || 0),
          0
        );
        setTotalUnread(total);
      }
    } catch (e) {
      console.log("Sidebar unread error");
    }
  };

  useEffect(() => {
    fetchTotalUnread();

    if (!socket.connected) socket.connect();

    socket.on("receive_message", (msg) => {
      if (msg.senderId !== adminId) {
        fetchTotalUnread();
      }
    });

    socket.on("admin_read_message", () => {
      fetchTotalUnread();
    });

    return () => {
      socket.off("receive_message");
      socket.off("admin_read_message");
    };
  }, [adminId]);

  return (
    <div className="admin-sidebar">
      {/* LOGO */}
      <div
        className="admin-sidebar-header"
        onClick={() => navigate("/admin")}
      >
        <span className="admin-logo-text galaxy-text">🎧 Lame</span>
      </div>

      <nav className="admin-nav">
        <NavLink to="/admin" end className="admin-link">
          <MdDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/users" className="admin-link">
          <MdGroup size={20} />
          <span>Quản lý tài khoản</span>
        </NavLink>

        <NavLink to="/admin/support" className="admin-link support-link">
          <MdChat size={20} />
          <span>Hỗ trợ khách hàng</span>

          {totalUnread > 0 && (
            <span className="sidebar-badge-red">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </NavLink>


        <NavLink to="/admin/artists" className="admin-link">
          <MdPerson size={20} />
          <span>Quản lý nghệ sĩ</span>
        </NavLink>

        <NavLink to="/admin/songs" className="admin-link">
          <MdMusicNote size={20} />
          <span>Quản lý bài hát</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminSidebar;
