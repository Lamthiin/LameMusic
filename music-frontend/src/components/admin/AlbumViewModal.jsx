import React from "react";
import "./AlbumViewModal.css";

export default function AlbumViewModal({ album, isOpen, onClose, onAddSong }) {
  if (!isOpen || !album) return null;

  return (
    <div className="alb-view-overlay">
      <div className="alb-view-box">

        <h2 className="alb-view-title">Chi tiết Album</h2>

        {/* Cover */}
        <img
          src={album.cover_url}
          alt={album.name}
          className="alb-view-cover"
        />

        {/* Album Info */}
        <div className="alb-view-info">
          <p><strong>Tên Album:</strong> {album.name}</p>

          <p><strong>Nghệ sĩ:</strong> {album.artist?.name ?? "—"}</p>

          <p>
            <strong>Ngày phát hành:</strong>{" "}
            {album.release_date
              ? new Date(album.release_date).toLocaleDateString("vi-VN")
              : "—"}
          </p>

          <p><strong>Số bài hát:</strong> {album.songs ?? 0}</p>
        </div>

        <h3 className="alb-view-subtitle">Danh sách bài hát</h3>

        {/* Songs List */}
        {album.songs_list?.length > 0 ? (
          <ul className="alb-song-list">
            {album.songs_list.map((song, idx) => (
              <li key={song.id} className="alb-song-item">
                <span>{idx + 1}. {song.title}</span>

                {/* Nếu cần thêm nút xoá bài hát trong tương lai */}
                {/* <button className="alb-btn-delete-small">Xoá</button> */}
              </li>
            ))}
          </ul>
        ) : (
          <div className="alb-empty-song">Chưa có bài hát nào</div>
        )}

        {/* Action bar */}
        <div className="alb-view-actions">
          <button
            className="btn-addsong"
            onClick={() => onAddSong(album.id)}
          >
            + Thêm bài hát
          </button>

          <button className="btn-delete" onClick={onClose}>
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
