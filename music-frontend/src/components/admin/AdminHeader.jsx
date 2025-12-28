import React, { useState, useRef, useEffect } from "react";
import "./Admin.css";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("admin_profile");
    return saved ? JSON.parse(saved) : null;
  });

  // Update user khi quay lại trang hoặc reload component
  useEffect(() => {
    const saved = localStorage.getItem("admin_profile");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // Theo dõi sự thay đổi localStorage để update Header ngay lập tức
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem("admin_profile");
      if (saved) setUser(JSON.parse(saved));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);


  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  // // FETCH USER (chỉ chạy 1 lần)
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const token = localStorage.getItem("accessToken");
  //     console.log("Token lấy được:", token);

  //     if (!token) return; //RETURN TRONG ASYNC, KHÔNG RETURN TRONG COMPONENT

  //     try {
  //       const res = await fetch("http://localhost:3000/auth/me", {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       console.log("Status /auth/me:", res.status);
  //       const data = await res.json();
  //       console.log("Data trả về:", data);

  //       setUser(data.content);
  //     } catch (err) {
  //       console.error("Lỗi fetch user:", err);
  //     }
  //   };

  //   fetchUser();
  // }, []);

  // CLICK OUTSIDE
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
  

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  const navigate = useNavigate();


  return (
    <header className="admin-header-card">
      <div className="admin-header-title-box">
        <h2 className="admin-header-title">
          {user ? user.name : "Đang tải..."}
        </h2>

        <p className="admin-header-subtitle">Quản trị viên hệ thống</p>
      </div>

      <div className="admin-header-right">
        <div
          className="admin-avatar-box"
          ref={avatarRef}
          onClick={() => setOpen(!open)}
        >
          <div className="admin-avatar-wrapper">
            <img
              src={
                user?.avatar ??
                `https://api.dicebear.com/7.x/lorelei/svg?seed=${user?.id || 1}`
              }
              alt="Avatar"
              className="admin-avatar"
            />
          </div>
        </div>

        {open && (
          <div className="admin-dropdown" ref={dropdownRef}>
            <p
              className="dropdown-item"
              onClick={() => {
                navigate("/admin/profile"); 
                setOpen(false);             
              }}
            >
              Tài khoản
            </p>

            <p className="dropdown-item logout" onClick={handleLogout}>
              Đăng xuất
            </p>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
