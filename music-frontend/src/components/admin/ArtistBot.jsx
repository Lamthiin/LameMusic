import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ArtistActiveList.css"; 
import ArtistFormModal from "../../components/admin/ArtistFormModal.jsx";
import { useNavigate } from "react-router-dom";

export default function ArtistBot() {
  const [artists, setArtists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editArtist, setEditArtist] = useState(null);
  const navigate = useNavigate();

  // LOAD INTERNAL ARTISTS
  useEffect(() => {
    loadInternalArtists();
  }, []);

  const loadInternalArtists = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/artists/inactive");

      const sorted = (Array.isArray(res.data) ? res.data : []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setArtists(sorted);

    } catch (err) {
      console.error("LOAD INTERNAL ARTISTS ERROR:", err);
      setArtists([]);
    }
  };

  const deleteArtist = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá nghệ sĩ này?")) return;

    try {
      await axios.delete(`http://localhost:3000/admin/artists/${id}`);
      alert("Đã xoá nghệ sĩ!");
      loadInternalArtists();
    } catch (err) {
      console.error("DELETE ARTIST ERROR:", err);
      alert("Lỗi xoá nghệ sĩ!");
    }
  };

  const saveArtist = async (data) => {
    try {
      if (editArtist?.id) {
        await axios.patch(
          `http://localhost:3000/admin/artists/${editArtist.id}`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("Đã cập nhật nghệ sĩ!");
      } else {
        await axios.post("http://localhost:3000/admin/artists", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Đã thêm nghệ sĩ mới!");
      }

      setShowModal(false);
      setEditArtist(null);
      loadInternalArtists();
    } catch (err) {
      console.error("SAVE ARTIST ERROR:", err);
      alert("Lỗi lưu nghệ sĩ!");
    }
  };

  return (
    <div className="active-container">

      {/* TOP BAR */}
      <div className="top-bar">
        <h2 className="active-title">Nghệ sĩ trực thuộc Lame Music</h2>

        <button
          className="am-btn-add"
          onClick={() => {
            setEditArtist(null);
            setShowModal(true);
          }}
        >
          + Thêm nghệ sĩ
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Ảnh</th>
            <th>Tên nghệ sĩ</th>
            <th>Tổng Album</th>
            <th>Tổng Bài hát</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {artists.map((a, index) => (
            <tr key={a.id}>
              <td>{index + 1}</td>

              <td>
                <img
                  src={a.avatar_url}
                  className="artist-avatar-table"
                  alt={a.stage_name}
                />
              </td>

              <td>{a.stage_name}</td>

              {/* ⭐ Tổng album */}
              <td>{a.total_albums ?? 0}</td>

              {/* ⭐ Tổng bài hát */}
              <td>{a.total_songs ?? 0}</td>

              {/* ⭐ Ngày tạo */}
              <td>
                {a.created_at
                  ? new Date(a.created_at).toLocaleDateString("vi-VN")
                  : "—"}
              </td>

              {/* ⭐ Status */}
              {/* ⭐ Status */}
              <td className="status-cell">
                {a.registrationStatus === "PENDING" && (
                  <span className="artist-status-pending">Pending</span>
                )}

                {a.registrationStatus === "APPROVED" && (
                  <span className="artist-status-active">Active</span>
                )}

                {a.registrationStatus === "REJECTED" && (
                  <span className="artist-status-rejected">Rejected</span>
                )}

                {!a.registrationStatus && (
                  <span className="artist-status-bot">Internal</span>
                )}
              </td>


              <td>
                <div className="admin-actions">

                  <button
                    className="btn-view"
                    onClick={() =>
                      navigate(`/admin/artists/${a.id}`, {
                        state: { fromTab: "bot" }
                      })
                    }
                  >
                    Xem
                  </button>

                  <button
                    className="btn-edit"
                    onClick={() => {
                      setEditArtist(a);
                      setShowModal(true);
                    }}
                  >
                    Sửa
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() => deleteArtist(a.id)}
                  >
                    Xoá
                  </button>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>



      <ArtistFormModal
        isOpen={showModal}
        initialArtist={editArtist}
        onSubmit={saveArtist}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
