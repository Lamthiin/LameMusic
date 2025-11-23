"use client";
import { useState } from "react";
import "./PopupEditArtist.css";

export default function PopupEditArtist({ artist, onClose, onSubmit }) {
  const [name, setName] = useState(artist.name);
  const [email, setEmail] = useState(artist.email);
  const [songs, setSongs] = useState(artist.songs);

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !songs) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    onSubmit({
      ...artist,
      name,
      email,
      songs: Number(songs),
    });

    onClose();
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="popup-title">Chỉnh Sửa Nghệ Sĩ</h3>

        <div className="popup-body">
          <div className="popup-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="popup-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="popup-group">
            <label>Số bài hát</label>
            <input
              type="number"
              value={songs}
              onChange={(e) => setSongs(e.target.value)}
            />
          </div>
        </div>

        <div className="popup-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-save" onClick={handleSave}>Lưu</button>
        </div>
      </div>
    </div>
  );
}
