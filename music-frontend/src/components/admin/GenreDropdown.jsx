import React, { useState, useRef, useEffect } from "react";
import "./GenreDropdown.css";

const GenreDropdown = ({ genres = [], value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = genres.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dropdown-container" ref={ref}>
      <div className="dropdown-selected" onClick={() => setOpen(!open)}>
        {value ? value.name : "-- Chọn thể loại --"}
      </div>

      {open && (
        <div className="dropdown-panel">
          <input
            placeholder="Tìm thể loại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dropdown-search"
          />

          <div className="dropdown-list">
            {filtered.map((g) => (
              <div
                key={g.id}
                className="dropdown-item"
                onClick={() => {
                  onChange(g);
                  setOpen(false);
                }}
              >
                {g.name}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="dropdown-more">Không tìm thấy</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenreDropdown;
