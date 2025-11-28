import React from "react";
import "./AlbumItem.css";

export default function AlbumItem({ album, onEdit, onDelete, onAddSong }) {
  return (
    <div className="album-row">
      <img src={album.cover_url} className="album-cover" />

      <div className="album-info">
        <h3 className="album-name">{album.name}</h3>
        <p className="album-artist">Nghệ sĩ: {album.artist.name}</p>
        <p className="album-count">Bài hát: {album.songs}</p>
      </div>

      <div className="album-actions">
        <button className="am-btn primary" onClick={() => onEdit(album)}>
          Sửa
        </button>

        <button className="am-btn danger" onClick={() => onDelete(album.id)}>
          Xoá
        </button>

        <button className="am-btn" onClick={() => onAddSong(album.id)}>
          + Bài hát
        </button>
      </div>
    </div>
  );
}
