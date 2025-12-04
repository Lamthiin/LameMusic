import React, { useState } from "react";
import "./AlbumCreateModal.css";
import { FaTimes } from "react-icons/fa";
import AlbumArtistSelector from "./AlbumArtistSelector";

export default function AlbumCreateModal({ show, onClose, onSubmit }) {
  if (!show) return null;

  const [name, setName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [preview, setPreview] = useState("/images/default-album.png");
  const [artist, setArtist] = useState(null);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Tên album không được để trống.");
    if (!artist) return setError("Vui lòng chọn nghệ sĩ.");
    if (!releaseDate) return setError("Ngày phát hành không hợp lệ.");
    if (!coverFile) return setError("Vui lòng chọn ảnh bìa.");

    onSubmit({
      name,
      release_date: releaseDate,
      artist_id: artist.id,
      info,
      cover: coverFile,
      active: 1,
    });

    onClose();
  };

  return (
    <div className="albumcreate-overlay" onClick={onClose}>
      <div className="albumcreate-modal" onClick={(e) => e.stopPropagation()}>

        {/* CLOSE BUTTON */}
        <button className="close-modal-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {/* TITLE */}
        <h2 className="albumcreate-title">Tạo Album Mới</h2>

        {/* FORM */}
        <form className="album-form" onSubmit={handleSubmit}>

          {error && <p className="modal-error">{error}</p>}

          {/* COVER UPLOAD */}
          <div className="form-group">
            <label>Ảnh bìa</label>

            <div className="cover-preview-container">
              <img src={preview} className="cover-preview" alt="preview" />

              <label className="change-cover-btn">
                Chọn ảnh
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {/* NAME */}
          <div className="form-group">
            <label>Tên Album</label>
            <input
              type="text"
              placeholder="Nhập tên album..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* ARTIST */}
          <div className="form-group">
            <label>Nghệ sĩ</label>
            <AlbumArtistSelector selected={artist} onSelect={setArtist} />
          </div>

          {/* RELEASE DATE */}
          <div className="form-group">
            <label>Ngày phát hành</label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              rows="3"
              placeholder="Nhập mô tả album..."
              value={info}
              onChange={(e) => setInfo(e.target.value)}
            ></textarea>
          </div>

          {/* ACTION BUTTONS */}
          <div className="albumcreate-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>

            <button type="submit" className="btn-submit">
              Tạo Album
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
