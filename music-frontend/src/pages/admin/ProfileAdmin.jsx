import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PopupSuccess from "../../components/admin/PopupSuccess";

import "./ProfileAdmin.css";

const ProfileAdmin = () => {
  const [admin, setAdmin] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  // =========================
  // 1. HÀM LOAD THÔNG TIN ADMIN
  // =========================
  const loadAdmin = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!json.content) {
        setErrorMessage("Không thể tải thông tin admin!");
        return;
      }

      // json.content: { id, name, email, avatar, role, gender, birthYear }
      setAdmin({
        ...json.content,
        birth_year: json.content.birth_year,
      });

      localStorage.setItem("admin_profile", JSON.stringify(json.content));


    } catch (err) {
      console.error("Lỗi load admin:", err);
      setErrorMessage("Lỗi kết nối server khi tải thông tin admin.");
    }
  };

  // Gọi khi mở trang
  useEffect(() => {
    loadAdmin();
    // eslint-disable-next-line
  }, [token]);

  // Chưa có dữ liệu
  if (!admin) {
    return <div style={{ color: "white" }}>Đang tải...</div>;
  }

  // =========================
  // 2. VALIDATE FE
  // =========================
  const validate = () => {
    if (!admin.name || admin.name.trim() === "") {
      return "Họ và tên không được để trống.";
    }

    if (!admin.email || admin.email.trim() === "") {
      return "Email không được để trống.";
    }

    // Validate email đơn giản
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(admin.email.trim())) {
      return "Email không hợp lệ.";
    }

    // Nếu có nhập 1 trong 2 ô password → bắt buộc validate cả 2
    if (password || confirmPassword) {
      if (password.length < 6) {
        return "Mật khẩu mới phải từ 6 ký tự trở lên.";
      }
      if (password !== confirmPassword) {
        return "Mật khẩu xác nhận không khớp.";
      }
    }

    // Birth year (nếu có) phải là số hợp lệ
    if (admin.birth_year && admin.birth_year !== "") {
      const yearNum = Number(admin.birth_year);
      if (Number.isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
        return "Năm sinh không hợp lệ.";
      }
    }


    return "";
  };

  // =========================
  // 3. GỬI PATCH CẬP NHẬT
  // =========================
  const handleSave = async () => {
    setErrorMessage("");

    const err = validate();
    if (err) {
      setErrorMessage(err);
      return;
    }

    try {
      const body = {
        username: admin.name,               // FE → BE
        email: admin.email,
        gender: admin.gender || null,
        birth_year: admin.birth_year || null,
        password: password || null,         // chỉ đổi nếu có nhập
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

      if (json.status === 200) {
        // Reload lại thông tin mới nhất từ /auth/me
        await loadAdmin();

        // ⭐️ LƯU USER MỚI VÀO LOCALSTORAGE
        localStorage.setItem("currentUser", JSON.stringify(json.data));

        setPassword("");
        setConfirmPassword("");
        setShowSuccess(true);
      } else {
        setErrorMessage(json.message || "Cập nhật thất bại!");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Lỗi cập nhật. Kiểm tra backend hoặc console.");
    }
  };

  // =========================
  // 4. RENDER
  // =========================
  return (
    <div className="admin-profile-wrapper">
      <h2 className="admin-profile-title">Thông tin tài khoản quản trị</h2>

      {/* THÔNG BÁO LỖI */}
      {errorMessage && (
        <div className="admin-profile-error">
          {errorMessage}
        </div>
      )}

      <div className="admin-profile-card">
        {/* LEFT SIDE – AVATAR + NAME */}
        <div className="admin-profile-left">
          <img
            src={
              admin.avatar ??
              `https://api.dicebear.com/7.x/lorelei/svg?seed=${admin.id}`
            }
            alt="Avatar"
            className="admin-profile-avatar"
          />

          <h3 className="admin-profile-name">{admin.name}</h3>
          <p className="admin-profile-role">
            {admin.role === "admin" ? "Quản trị viên hệ thống" : admin.role}
          </p>
        </div>

        {/* RIGHT SIDE – FORM */}
        <div className="admin-profile-right">
          {/* HỌ VÀ TÊN */}
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

          {/* EMAIL */}
          <div className="admin-form-group">
            <label>Email</label>
            <input
              type="email"
              value={admin.email || ""}
              onChange={(e) =>
                setAdmin({ ...admin, email: e.target.value })
              }
            />
          </div>

          {/* GIỚI TÍNH */}
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

          {/* NĂM SINH */}
          <div className="admin-form-group">
            <label>Năm sinh</label>
            <input
              type="number"
              placeholder="VD: 1999"
              value={admin.birth_year || ""}
              onChange={(e) =>
                setAdmin({ ...admin, birth_year: e.target.value })
              }

            />
          </div>

          {/* MẬT KHẨU MỚI */}
          <div className="admin-form-group">
            <label>Mật khẩu mới (không bắt buộc)</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-password-input"
            />
          </div>

          {/* XÁC NHẬN MẬT KHẨU */}
          <div className="admin-form-group">
            <label>Nhập lại mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="admin-password-input"
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
    </div>
  );
};

export default ProfileAdmin;
