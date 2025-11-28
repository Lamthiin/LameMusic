import React, { useState } from "react";
import AlbumArtistSelector from "./AlbumArtistSelector";
import "./AlbumForm.css";

export default function AlbumForm({ initialData }) {
  const [name, setName] = useState(initialData?.name || "");
  const [cover_url, setCoverUrl] = useState(initialData?.cover_url || "");
  const [artist, setArtist] = useState(initialData?.artist || null);

  return (
    <div className="album-form">
      <label>Tên Album</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nhập tên album"
      />

      <label>Ảnh (URL)</label>
      <input
        value={cover_url}
        onChange={(e) => setCoverUrl(e.target.value)}
        placeholder="URL ảnh album"
      />

      <label>Nghệ sĩ</label>
      <AlbumArtistSelector selected={artist} onSelect={setArtist} />
    </div>
  );
}
