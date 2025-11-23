"use client";
import "./PopupRoleUser.css";

export default function PopupRoleUser({ user, onClose, onSubmit }) {
  return (
    <div className="role-overlay" onClick={onClose}>
      <div className="role-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="role-title">Nâng Quyền Nghệ Sĩ</h2>

        <p className="role-message">
          Bạn có chắc muốn nâng người dùng "{user.name}" thành nghệ sĩ?
        </p>

        <div className="role-footer">
          <button className="role-btn cancel" onClick={onClose}>
            Hủy
          </button>

          <button className="role-btn confirm" onClick={onSubmit}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
