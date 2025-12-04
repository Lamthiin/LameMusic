import React, { useState } from "react";
import axios from "axios";
import "./ArtistActiveList.css";
import ArtistFormModal from "../admin/ArtistFormModal.jsx";
import { useNavigate } from "react-router-dom";

const ArtistActiveList = ({ artists = [], refresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editArtist, setEditArtist] = useState(null);
  const navigate = useNavigate();

  const sortedArtists = [...artists].sort((a, b) =>
    a.stage_name.localeCompare(b.stage_name, "vi", { sensitivity: "base" })
  );

  const deleteArtist = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá nghệ sĩ này?")) return;

    try {
      await axios.delete(`http://localhost:3000/admin/artists/${id}`);
      alert("Đã xoá nghệ sĩ!");
      refresh();
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
      refresh();
    } catch (err) {
      console.error("SAVE ARTIST ERROR:", err);
      alert("Lỗi lưu nghệ sĩ!");
    }
  };

  return (
    <div className="active-container">

      <div className="top-bar">
        <h2 className="active-title">Nghệ sĩ đang hoạt động</h2>
      </div>

      {sortedArtists.length === 0 ? (
        <div className="empty-active">Không có nghệ sĩ nào hoạt động</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Ảnh</th>
              <th>Tên nghệ sĩ</th>

              {/* ⭐ CỘT MỚI */}
              <th>Tổng Album</th>
              <th>Tổng Bài hát</th>

              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {sortedArtists.map((a, index) => (
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

                {/* ⭐ DỮ LIỆU 2 CỘT MỚI */}
                <td>{a.total_albums ?? 0}</td>
                <td>{a.total_songs ?? 0}</td>

                <td>
                  {a.created_at
                    ? new Date(a.created_at).toLocaleDateString("vi-VN")
                    : "—"}
                </td>

                <td className="status-cell">
                  <span className="artist-status-active">Active</span>
                </td>

                <td>
                  <div className="admin-actions">

                    <button
                      className="btn-view"
                      onClick={() => navigate(`/admin/artists/${a.id}`, { state: { fromTab: "active" } })}
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
      )}

      <ArtistFormModal
        isOpen={showModal}
        initialArtist={editArtist}
        onSubmit={saveArtist}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default ArtistActiveList;
