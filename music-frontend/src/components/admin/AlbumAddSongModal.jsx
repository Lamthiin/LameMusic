import React, { useState } from "react";
import "./AlbumAddSongModal.css";
import axios from "axios";
import AlbumSongSelector from "./AlbumSongSelector";

export default function AlbumAddSongModal({ show, onClose, albumId, albumName }) {
  const [selectedSongs, setSelectedSongs] = useState([]);

  if (!show) return null;

  const handleAddSongs = async () => {
    if (selectedSongs.length === 0) return alert("Vui lòng chọn ít nhất 1 bài hát!");

    try {
      await axios.patch(
        `http://localhost:3000/admin/albums/${albumId}/add-songs`,
        { song_ids: selectedSongs }
      );

      alert("Thêm bài hát vào album thành công!");
      onClose();
    } catch (err) {
      console.error("ADD SONG ERROR:", err);
      alert("Không thể thêm bài hát!");
    }
  };

  return (
    <div className="addsong-overlay" onClick={onClose}>
      <div className="addsong-box" onClick={(e) => e.stopPropagation()}>
        
        <h2 className="addsong-title">
          Thêm bài hát vào album: <span className="album-id">{albumName}</span>
        </h2>

        <div className="addsong-content">
          <AlbumSongSelector
            albumId={albumId}
            selectedSongs={selectedSongs}
            onSelect={setSelectedSongs}
          />
        </div>

        <div className="addsong-actions">
          <button className="btn-save" onClick={handleAddSongs}>
            + Thêm bài hát
          </button>
          <button className="btn-close" onClick={onClose}>
            Hủy
          </button>
        </div>

      </div>
    </div>
  );
}
