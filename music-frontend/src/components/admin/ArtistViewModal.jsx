"use client";
import "./ArtistViewModal.css";

export default function ArtistViewModal({ artist, onClose }) {
  if (!artist) return null;

  return (
    <div className="view-overlay" onClick={onClose}>
      <div className="view-card" onClick={(e) => e.stopPropagation()}>

        <div className="view-header">
          <h3 className="view-title">Thông Tin Nghệ Sĩ</h3>
          <button className="view-close" onClick={onClose}>✕</button>
        </div>

        <div className="view-body">

          <div className="view-avatar">
            <img src="/images/default_avatar.png" alt="avatar" />
          </div>

          <div className="view-info">
            <p><span>Tên nghệ sĩ:</span> {artist.name}</p>
            <p><span>Email:</span> {artist.email}</p>
            <p><span>Số bài hát:</span> {artist.songs}</p>
            <p><span>Trạng thái:</span> 
              {artist.status === "pending" ? " Pending" : " Artist"}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
