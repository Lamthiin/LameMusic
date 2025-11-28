import React from "react";
import AlbumSongSelector from "./AlbumSongSelector";
import "./AlbumAddSongModal.css";

export default function AlbumAddSongModal({ show, onClose, albumId }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Thêm bài hát vào album #{albumId}</h2>

        <AlbumSongSelector />

        <div className="modal-footer">
          <button className="am-btn danger" onClick={onClose}>Đóng</button>
          <button className="am-btn primary">Thêm</button>
        </div>
      </div>
    </div>
  );
}
