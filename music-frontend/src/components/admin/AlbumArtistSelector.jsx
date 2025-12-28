import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaChevronDown } from "react-icons/fa";
import "./AlbumArtistSelector.css";
import { api } from "@/utils/api";

export default function AlbumArtistSelector({ selected, onSelect }) {
  const [artists, setArtists] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios
      .get("/admin/artists")
      .then((res) => setArtists(res.data))
      .catch((err) => console.error("LOAD ARTISTS ERROR:", err));
  }, []);

  return (
    <div className="artist-dropdown">
      {/* SELECTED ITEM */}
      <div
        className="artist-dropdown-selected"
        onClick={() => setOpen(!open)}
      >
{selected ? (selected.stage_name || selected.name) : "— Chọn nghệ sĩ —"}
        <FaChevronDown className="dropdown-icon" />
      </div>

      {/* DROPDOWN LIST */}
      {open && (
        <div className="artist-dropdown-list">
          {artists.length === 0 ? (
            <div className="artist-dropdown-item disabled">Không có nghệ sĩ</div>
          ) : (
            artists.map((a) => (
              <div
                key={a.id}
                className="artist-dropdown-item"
                onClick={() => {
                  onSelect(a);
                  setOpen(false);
                }}
              >
                {a.stage_name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
