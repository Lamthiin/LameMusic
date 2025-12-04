import React from "react";
import AlbumSongSelector from "./AlbumSongSelector";
import "./AlbumAddSongModal.css";

export default function AlbumAddSongModal({ show, onClose, albumId, albumName }) {
  if (!show) return null;

  return (
    <div className="addsong-overlay" onClick={onClose}>
      <div className="addsong-box" onClick={(e) => e.stopPropagation()}>
        
        {/* Title */}
        <h2 className="addsong-title">
          Thêm bài hát vào album <span className="album-id">{albumName}</span>
        </h2>

        {/* Song list */}
        <div className="addsong-content">
          <AlbumSongSelector albumId={albumId} />
        </div>

      </div>
    </div>
  );
}
