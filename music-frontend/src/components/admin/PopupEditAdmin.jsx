"use client";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./PopupEditAdmin.css";

export default function PopupEditAdmin({ admin, onClose, onSubmit }) {
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [role, setRole] = useState(admin.role);

  // NEW: password + confirm  
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // show/hide
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    if (password && password !== confirmPass) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    onSubmit({
      ...admin,
      name,
      email,
      role,
      ...(password ? { password } : {})  // chỉ gửi password nếu nhập
    });

    onClose();
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        
        <h3 className="popup-title">Chỉnh Sửa Admin</h3>

        {/* TÊN ADMIN */}
        <div className="popup-group">
          <label>Tên Admin</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* EMAIL */}
        <div className="popup-group">
          <label>Email</label>
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* ROLE */}
        <div className="popup-group">
          <label>Vai trò</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* PASSWORD */}
        <div className="popup-group">
          <label>Mật khẩu mới</label>
          <div className="password-wrapper">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Đổi mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="eye-icon" onClick={() => setShowPass(!showPass)}>
              {showPass ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="popup-group">
          <label>Nhập lại mật khẩu</label>
          <div className="password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Nhập lại mật khẩu..."
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
            <span className="eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="popup-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-save" onClick={handleSave}>Lưu</button>
        </div>

      </div>
    </div>
  );
}
