import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // ⭐ thêm useLocation
import axios from "axios";
import "./AdminArtistDetail.css";

export default function ArtistDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // ⭐ lấy state từ navigate

  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3000/admin/artists/${id}/full`)
      .then(res => {
        setArtist(res.data);
        setAlbums(res.data.albums);
        setSongs(res.data.songs);
      });
  }, [id]);

  if (!artist) return <div className="loading">Đang tải...</div>;

  const handleClose = () => {
    // ⭐ giữ tab trước đó, mặc định 'active'
    const tab = location.state?.fromTab || "active";
    navigate("/admin/artists", { state: { tab } });
  };

  return (
    <div className="artist-admin-detail">

      {/* HERO */}
      <div className="artist-hero">
        <button
          className="close-btn"
          onClick={handleClose} // ⭐ dùng hàm handleClose
        >
          ✕
        </button>

        <img src={artist.avatar_url} className="artist-avatar" alt="avatar" />

        <div className="artist-info">
          <h1>{artist.stage_name}</h1>

          <p className="created-date">
            Nghệ sĩ đăng ký
            <span>
              {artist.created_at
                ? " — " + new Date(artist.created_at).toLocaleDateString("vi-VN")
                : ""}
            </span>
          </p>

          <p className="artist-status">
            Trạng thái: <strong>{artist.registrationStatus || "UNKNOWN"}</strong>
          </p>

          <div className="artist-stats">
            <div className="stat-card">
              <strong>{albums.length}</strong>
              <span>Album</span>
            </div>

            <div className="stat-card">
              <strong>{songs.length}</strong>
              <span>Bài hát</span>
            </div>
          </div>
        </div>
      </div>

      {/* BIO */}
      {artist.bio && (
        <div className="section">
          <h2>Giới thiệu</h2>
          <p className="artist-bio">{artist.bio}</p>
        </div>
      )}

      {/* ALBUM TABLE */}
      <div className="section">
        <h2>Album</h2>

        {albums.length === 0 ? (
          <p className="empty">Nghệ sĩ chưa có album nào.</p>
        ) : (
          <table className="song-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>ẢNh</th>
                <th>Tên album</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>

            <tbody>
              {albums.map((al, i) => (
                <tr key={al.id}>
                  <td>{i + 1}</td>

                  <td>
                    <img
                      src={al.cover_url}
                      className="album-thumb"
                      alt="cover"
                    />
                  </td>

                  <td>{al.title}</td>

                  <td>
                    {al.created_at
                      ? new Date(al.created_at).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SONG TABLE */}
      <div className="section">
        <h2>Bài hát</h2>

        {songs.length === 0 ? (
          <p className="empty">Chưa có bài hát nào.</p>
        ) : (
          <table className="song-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên bài hát</th>
                <th>Thời lượng</th>
                <th>Album</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {songs.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{s.title}</td>
                  <td>{s.duration || "—"}</td>
                  <td>{s.album_title || "—"}</td>

                  <td>
                    <span className={`song-status ${s.status?.toLowerCase()}`}>
                      {s.status || "UNKNOWN"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
