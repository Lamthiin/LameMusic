import React, { useState, useEffect, useRef } from "react";
import "./AlbumDropdown.css";

const AlbumDropdown = ({ albums = [], value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(5);

  const ref = useRef(null);

  // CLICK OUTSIDE → CLOSE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // FILTER (dùng title, không phải name)
  const filtered = albums.filter((a) =>
    (a?.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Reset limit khi search
  useEffect(() => {
    setLimit(5);
  }, [search]);

  // SCROLL LOAD MORE
  const handleScroll = (e) => {
    const el = e.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      setLimit((prev) => Math.min(prev + 5, filtered.length));
    }
  };

  return (
    <div className="dropdown-container" ref={ref}>
      <div className="dropdown-selected" onClick={() => setOpen(!open)}>
        {value ? value.title : "-- Chọn album --"}
      </div>

      {open && (
        <div className="dropdown-panel">
          <input
            placeholder="Tìm album..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dropdown-search"
          />

          <div className="dropdown-list" onScroll={handleScroll}>
            {filtered.slice(0, limit).map((album) => (
              <div
                key={album.id}
                className="dropdown-item"
                onClick={() => {
                  onChange(album);
                  setOpen(false);
                }}
              >
                {album.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumDropdown;
