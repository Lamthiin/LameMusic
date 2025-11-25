import React from "react";
import "./AlbumList.css";

export default function AlbumList({ albums, openEdit, deleteAlbum, openAddSong }) {
  return (
    <div className="album-list">
      {albums.map((alb) => (
        <div className="album-row" key={alb.id}>

          {/* Hình album */}
          <img className="album-cover" src={alb.coverUrl} alt={alb.name} />

          {/* Thông tin album */}
          <div className="album-info">
            <div className="album-title">{alb.name}</div>       {/* album */}
            <div className="album-artist">{alb.artist.stage_name}</div> {/* nghệ sĩ */}
          </div>

          {/* Actions */}
          <div className="album-actions">
            <button className="btn-edit" onClick={() => openEdit(alb)}>Sửa</button>
            <button className="btn-addsong" onClick={() => openAddSong(alb)}>+ Bài hát</button>
            <button className="btn-delete" onClick={() => deleteAlbum(alb.id)}>Xóa</button>
          </div>

        </div>
      ))}
    </div>
  );
}
