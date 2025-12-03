"use client";
import { useState } from "react";
import "./PopupAddUser.css";

export default function PopupAddUser({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = async () => {
    if (!name || !email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email: email,
          password: password,
        }),
      });

      // Chỉ parse JSON duy nhất 1 lần
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Tạo user thất bại!");
        return;
      }
      onSubmit(data);
      onClose();
    } catch (err) {
      console.error("Create user failed:", err);
      alert("Không thể kết nối server!");
    }
  };


  return (
    <div className="popup-overlay">
      <div className="popup-card">
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
              autoComplete="new-password"
              name="new-password"
              id="new-password-input"
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
