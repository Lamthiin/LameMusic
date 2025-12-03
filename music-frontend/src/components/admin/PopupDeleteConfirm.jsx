"use client";
import "./PopupDeleteConfirm.css";

export default function PopupDeleteConfirm({ title, message, onCancel, onConfirm, confirmText }) {
  return (
    <div className="popup-overlay" onClick={onCancel}>
      <div className="popup-delete-card" onClick={(e) => e.stopPropagation()}>
        
        <h3 className="popup-delete-title">{title || "Xác nhận xoá"}</h3>
        <p className="popup-delete-message">{message || "Bạn có chắc muốn xoá mục này?"}</p>

        <div className="popup-delete-actions">
          <button className="btn-cancel" onClick={onCancel}>Hủy</button>
          <button className="btn-confirm" onClick={onConfirm}>
            {confirmText || "Xoá"}
          </button>
        </div>

      </div>
    </div>
  );
}
