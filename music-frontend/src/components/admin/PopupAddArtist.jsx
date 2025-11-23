"use client";
import { useState } from "react";
import "./PopupAddArtist.css";

export default function PopupAddArtist({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    onSubmit({
      name,
      email,
      password,
      role_id: 3, // automatic Artist
    });

    onClose();
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="popup-title">Thêm Nghệ Sĩ</h3>

        <div className="popup-body">
          <div className="popup-group">
            <label>Tên nghệ sĩ</label>
            <input
              type="text"
              placeholder="Nhập tên nghệ sĩ..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="popup-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập email nghệ sĩ..."
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
