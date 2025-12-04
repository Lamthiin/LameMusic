import React from "react";
import "./AlbumViewModal.css";

export default function AlbumViewModal({ album, isOpen, onClose, onAddSong }) {
  if (!isOpen || !album) return null;

  return (
    <div className="album-detail-overlay">
      <div className="album-detail-container">

        {/* CLOSE BUTTON */}
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        {/* HERO */}
        <div className="album-hero">
          <img
            src={album.cover_url}
            alt={album.name}
            className="album-cover-large"
          />

          <div className="album-info">
            <h1>{album.name}</h1>

            <p className="album-artist">
              Nghệ sĩ: <strong>{album.artist?.name ?? "—"}</strong>
            </p>

            <p className="album-release">
              Ngày phát hành:{" "}
              {album.release_date
                ? new Date(album.release_date).toLocaleDateString("vi-VN")
                : "—"}
            </p>

            <div className="album-stats">
              <div className="stat-card">
                <strong>{album.songs ?? 0}</strong>
                <span>Bài hát</span>
              </div>
            </div>
          </div>
        </div>

        {/* INFO SECTION */}
        {album.info && (
          <div className="section">
            <h2>Giới thiệu Album</h2>
            <p className="album-bio">{album.info}</p>
          </div>
        )}

        {/* SONG SECTION */}
        <div className="section">
          <h2>Danh sách bài hát</h2>

          {album.songs_list?.length > 0 ? (
            <table className="song-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên bài hát</th>
                  <th>Thời lượng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {album.songs_list.map((song, index) => (
                  <tr key={song.id}>
                    <td>{index + 1}</td>
                    <td>{song.title}</td>
                    <td>{song.duration ?? "—"}</td>
                    <td>
                      <span className={`song-status ${song.status?.toLowerCase()}`}>
                        {song.status || "UNKNOWN"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="alb-empty-song">Chưa có bài hát nào</div>
          )}
        </div>

        {/* ACTION BAR */}
        <div className="detail-actions">
          <button className="btn-addsong" onClick={() => onAddSong(album.id, album.name)}>
            + Thêm bài hát
          </button>

          <button className="btn-close" onClick={onClose}>
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
