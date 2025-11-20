import React from "react";
import "./ArtistActiveList.css";


const ArtistFormModal = ({ isOpen, artist, setArtist, onSave, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>{artist.id ? "Chỉnh sửa nghệ sĩ" : "Thêm nghệ sĩ mới"}</h3>

        <input
          type="text"
          placeholder="Tên nghệ sĩ"
          value={artist.stage_name}
          onChange={(e) =>
            setArtist({ ...artist, stage_name: e.target.value })
          }
        />

        <textarea
          placeholder="Mô tả / Tiểu sử"
          value={artist.bio}
          onChange={(e) =>
            setArtist({ ...artist, bio: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="URL avatar"
          value={artist.avatar_url}
          onChange={(e) =>
            setArtist({ ...artist, avatar_url: e.target.value })
          }
        />

        <div className="modal-actions">
          <button className="btn-save" onClick={onSave}>Lưu</button>
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default ArtistFormModal;
