// src/admin/ProfileAdmin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PopupSuccess from "../../components/admin/PopupSuccess";

import "./ProfileAdmin.css";

const ProfileAdmin = () => {
  const [admin, setAdmin] = useState(null);

  // form fields riêng
  const [gender, setGender] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // popup
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

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
        console.log("Auth /me:", json);

        if (!json.content) {
          setErrorMessage("Không thể tải thông tin admin!");
          setShowError(true);
          return;
        }

        const info = json.content;
        setAdmin(info);

        // set lại form phụ
        setGender(info.gender ?? "");
        setBirthYear(info.birth_year ? String(info.birth_year) : "");

        // MẬT KHẨU LUÔN RỖNG
        setNewPassword("");
        setConfirmPassword("");
      } catch (err) {
        console.error("Lỗi load admin:", err);
        setErrorMessage("Lỗi kết nối server khi tải thông tin admin.");
        setShowError(true);
      }
    };

    if (token) {
      loadAdmin();
    }
  }, [token]);

  if (!admin) return <div style={{ color: "white" }}>Đang tải...</div>;

  // =========================
  // 2. VALIDATE FE
  // =========================
  const validateForm = () => {
    // Tên
    if (!admin.name || !admin.name.trim()) {
      return "Họ và tên không được để trống.";
    }

    // Email
    const email = (admin.email || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email không được để trống.";
    if (!emailRegex.test(email)) return "Email không hợp lệ.";

    // Năm sinh (nếu có)
    if (birthYear) {
      const yearNum = Number(birthYear);
      const currentYear = new Date().getFullYear();

      if (Number.isNaN(yearNum)) {
        return "Năm sinh phải là số.";
      }
      if (yearNum < 1900 || yearNum > currentYear) {
        return `Năm sinh phải từ 1900 đến ${currentYear}.`;
      }
    }

    // Mật khẩu (optional)
    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        return "Mật khẩu mới phải có ít nhất 6 ký tự.";
      }
      if (newPassword !== confirmPassword) {
        return "Mật khẩu nhập lại không khớp.";
      }
    }

    return null; // hợp lệ
  };

  // =========================
  // 3. GỬI PATCH CẬP NHẬT
  // =========================
  const handleSave = async () => {
    // FE validate trước
    const err = validateForm();
    if (err) {
      setErrorMessage(err);
      setShowError(true);
      return;
    }

    try {
      const body = {
        username: admin.name.trim(), // BE dùng username
        email: admin.email.trim(),
        gender: gender || null,
        birth_year: birthYear ? Number(birthYear) : null,
        password: newPassword || null, // nếu null BE sẽ bỏ qua không đổi
      };

      const res = await fetch("http://localhost:3000/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      console.log("PATCH /admin/profile:", json);

      if (!res.ok || json.status !== 200) {
        setErrorMessage(json.message || "Cập nhật thất bại, vui lòng thử lại.");
        setShowError(true);
        return;
      }

      // cập nhật lại state từ response
      if (json.data) {
        setAdmin((prev) => ({
          ...prev,
          name: json.data.username,
          email: json.data.email,
        }));
      }

      // reset mật khẩu
      setNewPassword("");
      setConfirmPassword("");

      setShowSuccess(true);
    } catch (err) {
      console.error("Lỗi cập nhật profile:", err);
      setErrorMessage("Không thể kết nối server. Vui lòng thử lại sau.");
      setShowError(true);
    }
  };

  // =========================
  // 4. RENDER
  // =========================
  return (
    <div className="admin-profile-wrapper">
      <h2 className="admin-profile-title">Thông tin tài khoản quản trị</h2>

      <div className="admin-profile-card">
        {/* LEFT SIDE – AVATAR + NAME */}
        <div className="admin-profile-left">
          <img
            src={
              admin.avatar ??
              `https://api.dicebear.com/7.x/notionists/svg?seed=${admin.name}`
            }
            alt="Avatar"
            className="admin-profile-avatar"
          />

          <h3 className="admin-profile-name">{admin.name}</h3>
          <p className="admin-profile-role">Quản trị viên hệ thống</p>
        </div>

        {/* RIGHT SIDE – FORM */}
        <div className="admin-profile-right">
          {/* HỌ TÊN */}
          <div className="admin-form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={admin.name}
              onChange={(e) =>
                setAdmin({
                  ...admin,
                  name: e.target.value,
                })
              }
              className="admin-input"
              placeholder="Nhập họ tên..."
            />
          </div>

          {/* EMAIL */}
          <div className="admin-form-group">
            <label>Email</label>
            <input
              type="email"
              value={admin.email}
              onChange={(e) =>
                setAdmin({
                  ...admin,
                  email: e.target.value,
                })
              }
              className="admin-input"
              placeholder="Nhập email..."
            />
          </div>

          {/* GIỚI TÍNH */}
          <div className="admin-form-group">
            <label>Giới tính</label>
            <select
              className="admin-input admin-select"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* NĂM SINH */}
          <div className="admin-form-group">
            <label>Năm sinh</label>
            <input
              type="number"
              className="admin-input"
              placeholder="Ví dụ: 2004"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
            />
          </div>

          {/* PASSWORD MỚI */}
          <div className="admin-form-group">
            <label>Mật khẩu mới (không bắt buộc)</label>
            <input
              type="password"
              className="admin-input password-animated"
              placeholder="Nhập mật khẩu mới..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {/* NHẬP LẠI PASSWORD */}
          <div className="admin-form-group">
            <label>Nhập lại mật khẩu</label>
            <input
              type="password"
              className="admin-input password-animated"
              placeholder="Nhập lại mật khẩu..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* BUTTONS */}
          <div className="admin-profile-buttons">
            <button
              className="admin-cancel-btn"
              onClick={() => navigate(-1)}
            >
              Hủy
            </button>

            <button className="admin-save-btn" onClick={handleSave}>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      {/* POPUP THÀNH CÔNG */}
      {showSuccess && (
        <PopupSuccess
          message="Cập nhật tài khoản thành công!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* POPUP LỖI LINH ĐỘNG */}
      {showError && (
        <div className="success-overlay">
          <div className="success-card">
            <h3 style={{ color: "#ff4d4f" }}>⚠️ Có lỗi xảy ra</h3>
            <p style={{ marginBottom: "20px", color: "#ddd" }}>
              {errorMessage}
            </p>
            <div className="success-actions">
              <button
                className="success-btn cancel"
                onClick={() => setShowError(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAdmin;
