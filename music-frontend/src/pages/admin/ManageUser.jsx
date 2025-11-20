import React, { useState } from "react";
import "./ManageUser.css";

//  IMPORT 3 TRANG CON
import AdminCustomerPage from "./AdminCustomerPage";
import AdminArtistPage from "./AdminArtistPage";
import AdminAccountPage from "./AdminAccountPage";

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

        {/* NGHỆ SĨ */}
        <div
          className={`um-card ${activeTab === "artists" ? "active" : ""}`}
          onClick={() => setActiveTab("artists")}
        >
          <h3>Nghệ sĩ</h3>
          <p>Quản lý tài khoản nghệ sĩ</p>
        </div>

        {/* ADMIN */}
        <div
          className={`um-card ${activeTab === "admins" ? "active" : ""}`}
          onClick={() => setActiveTab("admins")}
        >
          <h3>Admin</h3>
          <p>Quản lý tài khoản quản trị viên</p>
        </div>

      </div>

      {/* BẢNG HIỂN THỊ DỮ LIỆU */}
      <div className="um-table-area">
        {activeTab === "customers" && <AdminCustomerPage />}
        {activeTab === "artists" && <AdminArtistPage />}
        {activeTab === "admins" && <AdminAccountPage />}
      </div>

    </div>
  );
};

export default ManageUser;
