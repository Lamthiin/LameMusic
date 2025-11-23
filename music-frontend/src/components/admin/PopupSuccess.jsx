"use client";
import { useEffect } from "react";
import "./PopupSuccess.css";

export default function PopupSuccess({ message = "Success!", onClose }) {
  
  // Auto close sau 1.5 giây (tuỳ chỉnh)
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="success-overlay" onClick={onClose}>
      <div className="success-card" onClick={(e) => e.stopPropagation()}>
        
        <div className="success-icon">
          ✓
        </div>

        <h3 className="success-title">{message}</h3>

        <button className="success-btn" onClick={onClose}>
          Đóng
        </button>

      </div>
    </div>
  );
}
