import React, { useState, useRef, useEffect } from "react";
import "./admin.css";

const AdminHeader = () => {
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="admin-header-card">
      <div className="admin-header-title-box">
        <h2 className="admin-header-title">Brian</h2>
        <p className="admin-header-subtitle">Quản trị viên hệ thống</p>
      </div>

      <div className="admin-header-right">
        {/* AVATAR */}
        <div
          className="admin-avatar-box"
          ref={avatarRef}
          onClick={() => setOpen(!open)}
        >
          <div className="admin-avatar-wrapper">
            <img
              src="https://i.pravatar.cc/80"
              alt="Admin Avatar"
              className="admin-avatar"
            />
          </div>
        </div>

        {/* DROPDOWN */}
        {open && (
          <div className="admin-dropdown" ref={dropdownRef}>
            <p className="dropdown-item">Profile</p>
            <p className="dropdown-item logout">Log out</p>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
