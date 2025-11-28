import React, { useState } from "react";
import "./AlbumSongSelector.css";

const SAMPLE_SONGS = [
  { id: 1, name: "Nàng Thơ" },
  { id: 2, name: "Có Chắc Yêu Là Đây" },
  { id: 3, name: "Sao Anh Chưa Về Nhà" },
];

export default function AlbumSongSelector({ onSelect }) {
  const [key, setKey] = useState("");

  const filtered = SAMPLE_SONGS.filter((s) =>
    s.name.toLowerCase().includes(key.toLowerCase())
  );

  return (
    <div className="song-selector">
      <input
        className="selector-search"
        placeholder="Tìm bài hát..."
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />

      <div className="selector-list">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="selector-item"
            onClick={() => onSelect?.(s)}
          >
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}
