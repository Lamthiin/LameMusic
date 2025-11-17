import React, { useState } from "react";
import "./admin.css";

const AdminHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="admin-header-card">
      <h2 className="admin-header-title">Admin Dashboard</h2>

      <div className="admin-header-right">
        <div className="admin-avatar-box" onClick={() => setOpen(!open)}>
          <img
            src="https://i.pravatar.cc/40"
            alt="Admin Avatar"
            className="admin-avatar"
          />
        </div>

        {open && (
          <div className="admin-dropdown">
            <p className="dropdown-item">Profile</p>
            <p className="dropdown-item logout">Logout</p>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
