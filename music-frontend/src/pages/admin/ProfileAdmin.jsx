import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PopupSuccess from "../../components/admin/PopupSuccess";

import "./ProfileAdmin.css";

const ProfileAdmin = () => {
  const [admin, setAdmin] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ⭐ CONFIRM PASSWORD
  const [showSuccess, setShowSuccess] = useState(false);
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  // =========================
  // FETCH THÔNG TIN ADMIN
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

  if (!admin) return <div style={{ color: "white" }}>Đang tải...</div>;

  // =========================
  // HANDLE SAVE
  // =========================
  const handleSave = async () => {
    // 🔥 Kiểm tra xác nhận mật khẩu
    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    try {
      const payload = {
        username: admin.name,
        email: admin.email,
        gender: admin.gender,
        birth_year: admin.birth_year,
        password: password || null, // BE sẽ mã hóa
      };

      const res = await fetch("http://localhost:3000/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.status === 200) {
        setShowSuccess(true);
        setPassword("");
        setConfirmPassword("");
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
        {/* LEFT SIDE */}
        <div className="admin-profile-left">
          <img
            src={
              admin.avatar ??
              `https://api.dicebear.com/7.x/notionists/svg?seed=${admin.username}`
            }
            alt="Avatar"
            className="admin-profile-avatar"
          />

          <h3 className="admin-profile-name">{admin.name}</h3>
          <p className="admin-profile-role">Quản trị viên hệ thống</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="admin-profile-right">
          <div className="admin-form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={admin.name}
              onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label>Email</label>
            <input
              type="email"
              value={admin.email}
              onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
            />
          </div>

          {/* ⭐ GIỚI TÍNH */}
          <div className="admin-form-group">
            <label>Giới tính</label>
            <select
              value={admin.gender || ""}
              onChange={(e) => setAdmin({ ...admin, gender: e.target.value })}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* ⭐ NĂM SINH */}
          <div className="admin-form-group">
            <label>Năm sinh</label>
            <input
              type="number"
              value={admin.birth_year || ""}
              onChange={(e) =>
                setAdmin({ ...admin, birth_year: Number(e.target.value) })
              }
            />
          </div>

          {/* ⭐ MẬT KHẨU */}
          <div className="admin-form-group">
            <label>Mật khẩu mới (không bắt buộc)</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* ⭐ XÁC NHẬN MẬT KHẨU */}
          <div className="admin-form-group">
            <label>Nhập lại mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* BUTTONS */}
          <div className="admin-profile-buttons">
            <button className="admin-cancel-btn" onClick={() => navigate(-1)}>
              Hủy
            </button>

            <button className="admin-save-btn" onClick={handleSave}>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      {/* POPUP SUCCESS */}
      {showSuccess && (
        <PopupSuccess
          message="Cập nhật tài khoản thành công!"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default ProfileAdmin;
