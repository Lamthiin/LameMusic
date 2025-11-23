"use client";
import { useState } from "react";
import "./PopupEditUser.css";

export default function PopupEditUser({ user, onClose, onSubmit }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [birthYear, setBirthYear] = useState(user.birthYear);
  const [gender, setGender] = useState(user.gender);

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    onSubmit({
      ...user,
      name,
      email,
      birthYear,
      gender,
    });
  };

  return (
    <div className="edit-overlay" onClick={onClose}>
      <div className="edit-card" onClick={(e) => e.stopPropagation()}>
        
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
              <option value="other">Khác</option>
            </select>
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
