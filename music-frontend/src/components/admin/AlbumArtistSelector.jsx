import React, { useState } from "react";
import "./AlbumArtistSelector.css";

const SAMPLE_ARTISTS = [
  { id: 10, name: "Sơn Tùng M-TP" },
  { id: 11, name: "AMEE" },
  { id: 12, name: "Đen Vâu" },
];

export default function AlbumArtistSelector({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");

  const filtered = SAMPLE_ARTISTS.filter((a) =>
    a.name.toLowerCase().includes(key.toLowerCase())
  );

  return (
    <div className="artist-selector">
      <div className="selector-box" onClick={() => setOpen(!open)}>
        {selected ? selected.name : "Chọn nghệ sĩ..."}
      </div>

      {open && (
        <div className="selector-dropdown">
          <input
            className="selector-search"
            placeholder="Tìm nghệ sĩ..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />

          <div className="selector-list">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="selector-item"
                onClick={() => {
                  onSelect(a);
                  setOpen(false);
                }}
              >
                {a.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
