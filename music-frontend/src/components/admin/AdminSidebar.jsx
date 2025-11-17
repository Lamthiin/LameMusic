import React from "react";
import { NavLink } from "react-router-dom";
import "./Admin.css"; // nếu bạn dùng CSS riêng

import { 
  MdDashboard,
  MdLibraryMusic,
  MdPerson,
  MdAlbum,
  MdMusicNote,
  MdGroup
} from "react-icons/md";

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar">
      <h3 className="admin-sidebar-title">Admin Panel</h3>

      <nav className="admin-nav">
        
        <NavLink 
          to="/admin"
          end
          className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
        >
          <MdDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/admin/users"
          className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
        >
          <MdGroup size={20} />
          <span>Quản lý tài khoản</span>
        </NavLink>

        <NavLink 
          to="/admin/artists"
          className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
        >
          <MdPerson size={20} />
          <span>Quản lý nghệ sĩ</span>
        </NavLink>

        <NavLink 
          to="/admin/albums"
          className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
        >
          <MdAlbum size={20} />
          <span>Quản lý album</span>
        </NavLink>

        <NavLink 
          to="/admin/songs"
          className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
        >
          <MdMusicNote size={20} />
          <span>Quản lý bài hát</span>
        </NavLink>

      </nav>
    </div>
  );
};

export default AdminSidebar;
