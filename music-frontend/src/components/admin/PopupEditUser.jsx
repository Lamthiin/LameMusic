"use client";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./PopupEditUser.css";

export default function PopupEditUser({ user, onClose, onSubmit }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [birthYear, setBirthYear] = useState(user.birthYear);
  const [gender, setGender] = useState(user.gender);

  // NEW: password fields
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Toggle show/hide
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Nếu admin không đổi mật khẩu → không bắt buộc nhập
    if (password) {
      if (password !== confirmPass) {
        alert("Mật khẩu nhập lại không khớp!");
        return;
      }
    }

    onSubmit({
      ...user,
      name,
      email,
      birthYear,
      gender,
      password: password || undefined,   // Nếu không nhập, gửi undefined - nếu không đổi thì giữ mật khẩu cũ
    });

    onClose();
  };

  return (
    <div className="edit-overlay">
      <div className="edit-card">
        <h2 className="edit-title">Chỉnh Sửa Người Dùng</h2>

        <div className="edit-grid">

          {/* Name */}
          <div className="edit-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="edit-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="new-email"
              name="edit-email"
            />
          </div>

          {/* BirthYear */}
          <div className="edit-group">
            <label>Năm sinh</label>
            <input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
            />
          </div>

          {/* Gender */}
          <div className="edit-group">
            <label>Giới tính</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* PASSWORD */}
          <div className="edit-group">
            <label>Mật khẩu mới</label>
            <div className="password-wrapper">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                placeholder="Để trống nếu không đổi..."
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"   // <-- THÊM
                name="new-password"           // <-- THÊM
              />
              <span className="eye-icon" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="edit-group">
            <label>Xác nhận mật khẩu</label>
            <div className="password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPass}
                placeholder="Nhập lại mật khẩu..."
                onChange={(e) => setConfirmPass(e.target.value)}
                autoComplete="new-password"   // <-- THÊM
                name="confirm-new-password"   // <-- THÊM
              />
              <span
                className="eye-icon"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="edit-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-save" onClick={handleSave}>Lưu</button>
        </div>

      </div>
    </div>
  );
}
