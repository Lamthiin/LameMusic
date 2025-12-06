// src/components/admin/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./Admin.css";



const AdminLayout = () => {
  return (
    <div className="admin-wrapper">

  
      <AdminSidebar />


      <div className="admin-right">

    
        <AdminHeader />

      
        <div className="admin-content">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;
