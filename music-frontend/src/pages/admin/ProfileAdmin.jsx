import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ProfileAdmin.css";

const ProfileAdmin = () => {
  const [admin, setAdmin] = useState(null);
  const [password, setPassword] = useState("");
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();


  // =========================
  // 1. FETCH THÔNG TIN ADMIN
  // =========================
  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();

        if (!json.content) {
          alert("Không thể tải thông tin admin!");
          return;
        }

        setAdmin(json.content);
      } catch (err) {
        console.error("Lỗi load admin:", err);
      }
    };

    loadAdmin();
  }, [token]);

  // Khi chưa có dữ liệu
  if (!admin) return <div style={{ color: "white" }}>Đang tải...</div>;

  // =========================
  // 2. GỬI PATCH CẬP NHẬT
  // =========================
  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:3000/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: admin.username,
          email: admin.email,
          password: password || null,
        }),
      });

      const json = await res.json();

      if (json.status === 200) {
        alert("Cập nhật thành công!");
        setPassword(""); // reset password field
      } else {
        alert(json.message || "Cập nhật thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi cập nhật. Kiểm tra console.");
    }
  };

  return (
    <div className="admin-profile-wrapper">
      <h2 className="admin-profile-title">Thông tin tài khoản quản trị</h2>

      <div className="admin-profile-card">
        {/* LEFT SIDE – AVATAR + NAME */}
        <div className="admin-profile-left">
          <img
            src={
              admin.avatar ??
              `https://api.dicebear.com/7.x/notionists/svg?seed=${admin.username}`
            }
            alt="Avatar"
            className="admin-profile-avatar"
          />

          <h3 className="admin-profile-name">{admin.username}</h3>
          <p className="admin-profile-role">Quản trị viên hệ thống</p>
        </div>

        {/* RIGHT SIDE – FORM */}
        <div className="admin-profile-right">
          <div className="admin-form-group">
            <label>Họ và tên</label>
            <input
                type="text"
                value={admin.name || ""}
                onChange={(e) =>
                    setAdmin({ ...admin, name: e.target.value })
                }
            />

          </div>

          <div className="admin-form-group">
            <label>Email</label>
            <input
              type="email"
              value={admin.email}
              onChange={(e) =>
                setAdmin({ ...admin, email: e.target.value })
              }
            />
          </div>

          <div className="admin-form-group">
            <label>Mật khẩu mới (không bắt buộc)</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="admin-save-btn" onClick={handleSave}>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;
