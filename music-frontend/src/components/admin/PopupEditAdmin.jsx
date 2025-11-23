"use client";
import { useState } from "react";
import "./PopupEditAdmin.css";

export default function PopupEditAdmin({ admin, onClose, onSubmit }) {
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [role, setRole] = useState(admin.role);

  const handleSave = () => {
    onSubmit({
      ...admin,
      name,
      email,
      role,
    });
    onClose();
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="popup-title">Chỉnh Sửa Admin</h3>

        <div className="popup-group">
          <label>Tên Admin</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="popup-group">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="popup-group">
          <label>Vai trò</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Super Admin</option>
            <option>Moderator</option>
          </select>
        </div>

        <div className="popup-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-save" onClick={handleSave}>Lưu</button>
        </div>
      </div>
    </div>
  );
}
