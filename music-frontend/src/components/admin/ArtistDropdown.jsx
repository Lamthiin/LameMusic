import React, { useState, useEffect, useRef } from "react";
import "./ArtistDropdown.css";

const ArtistDropdown = ({ artists = [], value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10); // ⭐ hiển thị 10 nghệ sĩ đầu tiên

  const ref = useRef(null);

  // =============================
  // CLICK BÊN NGOÀI → ĐÓNG DROPDOWN
  // =============================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =============================
  // FILTER THEO TÊN NGHỆ SĨ (stage_name)
  // =============================
  const filtered = (artists || []).filter((a) =>
    (a?.stage_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // ⭐ Reset limit mỗi khi search đổi
  useEffect(() => {
    setLimit(10);
  }, [search]);

  // =============================
  // SCROLL → LOAD THÊM
  // =============================
  const handleScroll = (e) => {
    const el = e.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      setLimit((prev) => Math.min(prev + 10, filtered.length));
    }
  };

  return (
    <div className="dropdown-container" ref={ref}>
      <div
        className="dropdown-selected"
        onClick={() => setOpen(!open)}
      >
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

          <div className="dropdown-list" onScroll={handleScroll}>
            {filtered.length === 0 && (
              <div className="dropdown-empty">Không tìm thấy nghệ sĩ</div>
            )}

            {filtered.slice(0, limit).map((a) => {
              const avatar =
                a.avatar_url || "/uploads/defaults/default-artist.png";

              return (
                <div
                  key={a.id}
                  className="dropdown-item"
                  onClick={() => {
                    onChange(a);
                    setOpen(false); // đóng dropdown khi chọn
                  }}
                >
                  <img
                    src={avatar}
                    alt={a.stage_name}
                    className="dropdown-avatar"
                  />
                  <span>{a.stage_name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistDropdown;
