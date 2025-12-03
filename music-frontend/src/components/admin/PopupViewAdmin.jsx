"use client";
import "./PopupViewAdmin.css";

export default function PopupViewAdmin({ admin, onClose }) {
  if (!admin) return null;

  return (
    <div className="view-overlay" onClick={onClose}>
      <div className="view-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="view-title">Thông Tin Admin</h3>

        <div className="view-info-group">
          <div className="view-label">Tên:</div>
          <div className="view-value">{admin.username}</div>
        </div>

        <div className="view-info-group">
          <div className="view-label">Email:</div>
          <div className="view-value">{admin.email}</div>
        </div>

        <div className="view-info-group">
          <div className="view-label">Ngày tạo:</div>
          <div className="view-value">
            {admin.created_at?.split("T")[0]}
          </div>
        </div>

        <div className="view-info-group">
          <div className="view-label">Vai trò:</div>
          <div className="view-value">{admin.role}</div>
        </div>

        <div className="view-footer">
          <button className="view-btn" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
