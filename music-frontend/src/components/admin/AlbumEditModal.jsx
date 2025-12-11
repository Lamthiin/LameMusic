import React, { useState, useEffect } from "react";
import "./AlbumEditModal.css";
import { FaTimes } from "react-icons/fa";
import AlbumArtistSelector from "./AlbumArtistSelector";
import axios from "axios";

export default function AlbumEditModal({ show, onClose, initialData, onSubmit }) {
  if (!show) return null;

  const formatDateDisplay = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN"); // dd/MM/yyyy
};

  const [name, setName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [preview, setPreview] = useState("/images/default-album.png");
  const [artist, setArtist] = useState(null);
  const [info, setInfo] = useState("");

  const [error, setError] = useState("");

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "—"; // tránh lỗi

    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");

    return `${m}:${s}`;
  };


  // ⭐ THÊM STATE BỊ THIẾU
  const [songs, setSongs] = useState([]);
  const [availableSongs, setAvailableSongs] = useState([]);

  // ============================
  // LOAD ALBUM DATA + SONGS
  // ============================
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setReleaseDate(initialData.release_date || "");
      setPreview(initialData.cover_url || "/images/default-album.png");
      setArtist(initialData.artist || null);
      setInfo(initialData.info || "");
      setSongs(initialData.songs_list || []);

      // ⭐ Load danh sách bài hát có thể thêm
      axios
        .get(`http://localhost:3000/admin/albums/${initialData.id}/available-songs`)
        .then((res) => setAvailableSongs(res.data || []))
        .catch(() => setAvailableSongs([]));
    }
  }, [initialData]);

  // ============================
  // HANDLE FILE CHANGE
  // ============================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

 
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Tên album không được để trống.");
    if (!artist) return setError("Vui lòng chọn nghệ sĩ.");
    if (!releaseDate) return setError("Ngày phát hành không hợp lệ.");

    // TRUYỀN DATA ĐÚNG VỀ ManageAlbum
    onSubmit({
      name,
      release_date: releaseDate,
      artist_id: artist.id,
      info,
      coverFile,   // file ảnh (nếu có)
    });
  };




  // ============================================================
  // ====================== JSX RETURN ==========================
  // ============================================================
  return (
    <div className="albumedit-overlay" onClick={onClose}>
      <div className="albumedit-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* CLOSE BUTTON */}
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {/* TITLE */}
        <h2 className="modal-title">
          Sửa Album: <span className="highlight">{initialData.name}</span>
        </h2>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <p className="modal-error">{error}</p>}

          {/* COVER PREVIEW */}
          <div className="form-group">
            <label>Ảnh bìa hiện tại:</label>
            <div className="cover-preview-container">
              <img src={preview} alt="Preview" className="cover-preview" />
              <label className="change-cover-btn">
                Đổi ảnh
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {/* NAME */}
          <div className="form-group">
            <label>Tên Album:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên album..."
            />
          </div>

          {/* ARTIST */}
          <div className="form-group">
            <label>Nghệ sĩ:</label>
            <AlbumArtistSelector selected={artist} onSelect={setArtist} />
          </div>

          {/* RELEASE DATE */}
          <div className="form-group">
            <label>Ngày phát hành:</label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-group full-width">
            <label>Mô tả:</label>
            <textarea
              rows="4"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder="Nhập mô tả album..."
            ></textarea>
          </div>

          {/* ====================== SONGS IN ALBUM ====================== */}
          <div className="section">
            <h2>Bài hát trong album</h2>

            {songs.length > 0 ? (
              <table className="song-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên bài hát</th>
                    <th>Thời lượng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song, index) => (
                    <tr key={song.id}>
                      <td>{index + 1}</td>
                      <td>{song.title}</td>
                      <td>{song.duration}</td>
                      <td>{song.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="alb-empty-song">Chưa có bài hát nào</div>
            )}
          </div>

          {/* ====================== AVAILABLE SONGS ====================== */}
          <div className="section">
            <h2>Bài hát có thể thêm</h2>

            {availableSongs.length > 0 ? (
              <table className="song-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên bài hát</th>
                    <th>Nghệ sĩ</th>
                    <th>Thời lượng</th>
                    <th>Thêm</th>
                  </tr>
                </thead>
                <tbody>
                  {availableSongs.map((song, index) => (
                    <tr key={song.id}>
                      <td>{index + 1}</td>
                      <td>{song.title}</td>
                      <td>{song.artist_name}</td>
                      <td>{formatDuration(song.duration)}</td>
                      <td>
                        <button
                          className="song-add-btn"
                          onClick={async () => {
                            await axios.patch(
                              `http://localhost:3000/admin/albums/${initialData.id}/add-song`,
                              { songId: song.id }
                            );

                            setSongs((prev) => [...prev, song]);
                            setAvailableSongs((prev) =>
                              prev.filter((s) => s.id !== song.id)
                            );
                          }}
                        >
                          + Thêm
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="alb-empty-song">Không còn bài hát nào để thêm</div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="submit-container">
            <button type="submit" className="save-btn">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}