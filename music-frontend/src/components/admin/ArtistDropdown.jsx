// music-frontend/src/components/ArtistDropdown.jsx
import React, { useState } from "react";
import "./ArtistDropdown.css";

const ArtistDropdown = ({ artists, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = artists.filter((a) =>
    a.stage_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dropdown-container">
      <div className="dropdown-selected" onClick={() => setOpen(!open)}>
        {value ? value.stage_name : "Chọn nghệ sĩ"}
      </div>

      {open && (
        <div className="dropdown-panel">
          <input
            placeholder="Tìm nghệ sĩ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dropdown-search"
          />

          <div className="dropdown-list">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="dropdown-item"
                onClick={() => {
                  onChange(a);
                  setOpen(false);
                }}
              >
                <img src={a.avatar_url} alt="" className="dropdown-avatar" />
                <span>{a.stage_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistDropdown;
