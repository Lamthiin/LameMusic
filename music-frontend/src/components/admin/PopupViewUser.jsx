"use client";
import "./PopupViewUser.css";

export default function PopupViewUser({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="view-overlay" onClick={onClose}>
      <div className="view-card" onClick={(e) => e.stopPropagation()}>

        <h3 className="view-title">Thông Tin Người Dùng</h3>

        <div className="view-info"><b>Tên:</b> {user.name}</div>
        <div className="view-info"><b>Email:</b> {user.email}</div>
        <div className="view-info"><b>Năm sinh:</b> {user.birthYear}</div>
        <div className="view-info"><b>Giới tính:</b> {user.gender}</div>
        <div className="view-info"><b>Ngày đăng ký:</b> {user.createdAt}</div>
        <div className="view-info"><b>Vai trò:</b> {user.role}</div>

        <button className="view-btn" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}
