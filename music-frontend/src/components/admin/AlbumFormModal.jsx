import React, { useState } from "react";
import "./AlbumFormModal.css";
import AlbumArtistSelector from "./AlbumArtistSelector";

export default function AlbumFormModal({ show, onClose, initialData, onSubmit }) {
  if (!show) return null;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    cover_url: initialData?.cover_url || "",
    artist: initialData?.artist || null,
    release_date: initialData?.release_date || "",
    info: initialData?.info || "",
  });

  const handleSave = () => {
    if (!form.name.trim()) return alert("Tên album không được để trống");
    if (!form.artist) return alert("Chưa chọn nghệ sĩ");

    onSubmit({
      ...form,
      artist_id: form.artist.id,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <h2>{initialData ? "Sửa Album" : "Thêm Album"}</h2>

        <div className="album-form">

          <label>Tên Album</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <label>Ảnh cover</label>
          <input type="text"
            value={form.cover_url}
            onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
          />

          {form.cover_url && (
            <img className="album-cover-preview" src={form.cover_url} alt="cover" />
          )}

          <label>Chọn nghệ sĩ</label>
          <AlbumArtistSelector
            selected={form.artist}
            onSelect={(artist) => setForm({ ...form, artist })}
          />

          <label>Ngày phát hành</label>
          <input
            type="date"
            value={form.release_date}
            onChange={(e) => setForm({ ...form, release_date: e.target.value })}
          />

        </div>

        <div className="modal-footer">
          <button className="btn-delete" onClick={onClose}>Hủy</button>
          <button className="btn-addsong" onClick={handleSave}>
            {initialData ? "Cập nhật" : "Thêm"}
          </button>
        </div>

      </div>
    </div>
  );
}
