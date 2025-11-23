"use client";
import { useState } from "react";
import "./PopupAddUser.css";

export default function PopupAddUser({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // trả dữ liệu về trang gọi popup
    onSubmit({ name, email, password });

    // đóng popup
    onClose();
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="popup-title">Thêm Người Dùng</h3>

        <div className="popup-body">

          {/* Họ tên */}
          <div className="popup-group">
            <label>Họ và tên</label>
            <input
              type="text"
              placeholder="Nhập họ tên..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="popup-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Mật khẩu */}
          <div className="popup-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Tạo mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="popup-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-save" onClick={handleSubmit}>
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
