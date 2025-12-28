"use client";
import { useState } from "react";
import "./PopupAddAdmin.css";
import { api } from "@/utils/api";

export default function PopupAddAdmin({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const res = await fetch("/admin/users/admins/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email,
          password,
        }),
      });

      // kiểm tra trước khi parse json
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        alert(error.message || "Tạo admin thất bại!");
        return;
      }

      const data = await res.json(); // { message, user }

      // báo cho trang AdminAccountPage
      onSubmit(data);
      onClose();
    } catch (err) {
      console.error("Create admin failed:", err);
      alert("Không thể kết nối server!");
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="popup-title">Thêm Admin</h3>

        <div className="popup-body">
          <div className="popup-group">
            <label>Tên Admin</label>
            <input
              type="text"
              placeholder="Nhập tên admin..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="popup-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="popup-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Tạo mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="popup-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-save" onClick={handleSubmit}>Thêm</button>
        </div>
      </div>
    </div>
  );
}
