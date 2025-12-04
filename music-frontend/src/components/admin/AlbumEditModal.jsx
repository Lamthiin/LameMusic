import React, { useState, useEffect } from "react";
import "./AlbumEditModal.css";
import { FaTimes } from "react-icons/fa";
import AlbumArtistSelector from "./AlbumArtistSelector";

export default function AlbumEditModal({ show, onClose, initialData, onSubmit }) {
  if (!show) return null;

  const [name, setName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [preview, setPreview] = useState("/images/default-album.png");
  const [artist, setArtist] = useState(null);
  const [info, setInfo] = useState("");

  const [error, setError] = useState("");

  // ============================
  // LOAD ALBUM DATA INTO FORM
  // ============================
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setReleaseDate(initialData.release_date || "");
      setPreview(initialData.cover_url || "/images/default-album.png");
      setArtist(initialData.artist || null);
      setInfo(initialData.info || "");
    }
  }, [initialData]);

  // ============================
  // HANDLE FILE CHANGE
  // ============================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ============================
  // SUBMIT
  // ============================
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Tên album không được để trống.");
    if (!artist) return setError("Vui lòng chọn nghệ sĩ.");
    if (!releaseDate) return setError("Ngày phát hành không hợp lệ.");

    onSubmit({
      id: initialData.id,
      name,
      release_date: releaseDate,
      artist_id: artist.id,
      info,
      coverFile,                // người dùng có thể không đổi ảnh
      old_cover: initialData.cover_url
    });

    onClose();
  };

  return (
    <div className="albumedit-overlay" onClick={onClose}>
      <div className="albumedit-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* CLOSE BUTTON */}
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {/* TITLE */}
        <h2 className="modal-title">Sửa Album</h2>

        <form className="modal-form" onSubmit={handleSubmit}>

          {error && <p className="modal-error">{error}</p>}

          {/* COVER PREVIEW */}
          <div className="form-group">
            <label>Ảnh bìa hiện tại:</label>

            <div className="cover-preview-container">
              <img src={preview} alt="Preview" className="cover-preview" />

              <label className="change-cover-btn">
                Đổi ảnh
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {/* NAME */}
          <div className="form-group">
            <label>Tên Album:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên album..."
            />
          </div>

          {/* ARTIST */}
          <div className="form-group">
            <label>Nghệ sĩ:</label>
            <AlbumArtistSelector
              selected={artist}
              onSelect={(artist) => setArtist(artist)}
            />
          </div>

          {/* RELEASE DATE */}
          <div className="form-group">
            <label>Ngày phát hành:</label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-group full-width">
            <label>Mô tả:</label>
            <textarea
              rows="4"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder="Nhập mô tả album..."
            ></textarea>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="submit-container">
            <button type="submit" className="save-btn">
              Lưu thay đổi
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
