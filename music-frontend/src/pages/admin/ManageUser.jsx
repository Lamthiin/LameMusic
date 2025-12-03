import React, { useState } from "react";
import "./ManageUser.css";

import AdminCustomerPage from "./AdminCustomerPage";
import AdminAccountPage from "./AdminAccountPage";
import AdminBlockAccount from "./AdminBlockAccount";

const ManageUser = () => {
  const [activeTab, setActiveTab] = useState("customers");

  return (
    <div className="user-management">
      <h2 className="um-title">Quản lý người dùng</h2>

      <div className="um-grid">
        {/* NGƯỜI DÙNG */}
        <div
          className={`um-card ${activeTab === "customers" ? "active" : ""}`}
          onClick={() => setActiveTab("customers")}
        >
          <h3>Người dùng</h3>
          <p>Quản lý tài khoản người dùng</p>
        </div>

        {/* ADMIN */}
        <div
          className={`um-card ${activeTab === "admins" ? "active" : ""}`}
          onClick={() => setActiveTab("admins")}
        >
          <h3>Admin</h3>
          <p>Quản lý tài khoản quản trị viên</p>
        </div>


        {/* TÀI KHOẢN BỊ KHÓA – TAB THỨ 3 */}
        <div
          className={`um-card ${activeTab === "blocked" ? "active" : ""}`}
          onClick={() => setActiveTab("blocked")}
        >
          <h3>Blocked Account</h3>
          <p>Quản lý tài khoản bị khóa</p>
        </div>
     
      </div>
      {/* BẢNG HIỂN THỊ */}
      <div className="um-table-area">
        {activeTab === "customers" && <AdminCustomerPage />}
        {activeTab === "admins" && <AdminAccountPage />}
        {activeTab === "blocked" && <AdminBlockAccount />}
      </div>
    </div>
  );
};

export default ManageUser;
