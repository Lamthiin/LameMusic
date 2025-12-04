import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AlbumSongSelector.css";

export default function AlbumSongSelector({ albumId }) {
  const [songs, setSongs] = useState([]);

  // Load danh sách bài hát đủ điều kiện
  const loadSongs = () => {
    axios
      .get(`http://localhost:3000/admin/albums/${albumId}/available-songs`)
      .then(res => setSongs(res.data))
      .catch(err => console.error("LOAD SONGS ERROR:", err));
  };

  useEffect(() => {
    if (albumId) loadSongs();
  }, [albumId]);

  // ⭐ HANDLE ADD SONG
  const handleAddSong = async (song) => {
    const confirmAdd = window.confirm(
      `Bạn có muốn thêm bài hát "${song.title}" vào album này?`
    );
    if (!confirmAdd) return;

    try {
      await axios.patch(
        `http://localhost:3000/admin/albums/${albumId}/add-song/${song.id}`
      );

      alert("Đã thêm bài hát vào album!");

      // Reload danh sách sau khi thêm
      loadSongs();

    } catch (err) {
      console.error("ADD SONG ERROR:", err);
      alert("Lỗi khi thêm bài hát!");
    }
  };

  return (
    <div className="alb-selector">
      {songs.length === 0 ? (
        <p className="alb-empty">Không có bài hát phù hợp</p>
      ) : (
        <ul className="alb-list">
          {songs.map(song => (
            <li key={song.id} className="alb-item">
              <div className="alb-info">
                <span className="song-title">{song.title}</span>
                <span className="song-artist">{song.artist_name}</span>
              </div>

              <button
                className="alb-add-btn"
                onClick={() => handleAddSong(song)}
              >
                Thêm
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
