"use client";
import "./PopupApproveConfirm.css";

export default function PopupApproveConfirm({ title, message, onCancel, onConfirm }) {
  return (
    <div className="popup-overlay" onClick={onCancel}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="popup-title">{title}</h3>
        <p className="popup-message">{message}</p>

        <div className="popup-footer">
          <button className="popup-btn-cancel" onClick={onCancel}>
            Hủy
          </button>

          <button className="popup-btn-approve" onClick={onConfirm}>
            Duyệt
          </button>
        </div>
      </div>
    </div>
  );
}
