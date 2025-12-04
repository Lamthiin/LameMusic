import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AlbumSongSelector.css";

export default function AlbumSongSelector({ albumId, selectedSongs, onSelect }) {
  const [songs, setSongs] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/admin/albums/${albumId}/available-songs`)
      .then((res) => setSongs(res.data || []))
      .catch(() => setSongs([]));
  }, [albumId]);

  const toggleSong = (id) => {
    const updated = selectedSongs.includes(id)
      ? selectedSongs.filter((x) => x !== id)
      : [...selectedSongs, id];

    onSelect(updated);
  };

  const toggleAll = () => {
    if (selectAll) {
      setSelectAll(false);
      onSelect([]);
    } else {
      setSelectAll(true);
      onSelect(songs.map((s) => s.id));
    }
  };

  return (
    <div className="alb-selector">
      <div className="song-table-container">
        <table className="song-table">
          <thead>
            <tr>
              <th className="center">
                <input type="checkbox" checked={selectAll} onChange={toggleAll} />
              </th>
              <th>Tên bài hát</th>
              <th>Nghệ sĩ</th>
              <th>Thời lượng</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>

          <tbody>
            {songs.length === 0 ? (
              <tr>
                <td colSpan="5" className="alb-empty">
                  Không còn bài hát nào để thêm
                </td>
              </tr>
            ) : (
              songs.map((song) => (
                <tr key={song.id} className="song-row">
                  <td className="center">
                    <input
                      type="checkbox"
                      checked={selectedSongs.includes(song.id)}
                      onChange={() => toggleSong(song.id)}
                    />
                  </td>
                  <td className="song-title">{song.title}</td>
                  <td className="song-artist">
                    {song.artist_name || "—"}
                  </td>
                  <td>{song.duration || "—"}</td>
                  <td>{song.created_at?.slice(0, 10)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
