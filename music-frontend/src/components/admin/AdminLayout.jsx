// src/components/admin/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./Admin.css";

const AdminLayout = () => {
  return (
    <div className="admin-wrapper">

      {/* SIDEBAR TRÁI */}
      <AdminSidebar />

      {/* PHẦN BÊN PHẢI */}
      <div className="admin-right">

        {/* HEADER TRONG CARD */}
        <AdminHeader />

        {/* CONTENT */}
        <div className="admin-content">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;
