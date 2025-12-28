import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ArtistFormModal from "../admin/ArtistFormModal.jsx";
import "./ArtistActiveList.css";
import { api } from "@/utils/api";

const ArtistRemovedList = ({ artists = [], refresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editArtist, setEditArtist] = useState(null);
  const navigate = useNavigate();

  // Sắp xếp tên nghệ sĩ theo tiếng Việt
  const sortedArtists = [...artists].sort((a, b) =>
    a.stage_name.localeCompare(b.stage_name, "vi", { sensitivity: "base" })
  );

  // Khôi phục artist (soft delete → active = 1)
  const restoreArtist = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn khôi phục nghệ sĩ này?")) return;

    try {
      await axios.patch(`/admin/artists/${id}/pending`);
      alert("Đã khôi phục nghệ sĩ!");
      refresh();
    } catch (err) {
      console.error("RESTORE ARTIST ERROR:", err);
      alert("Lỗi khôi phục nghệ sĩ!");
    }
  };

  return (
    <div className="removed-container">
      <div className="top-bar">
        <h2 className="removed-title">Nghệ sĩ bị xóa</h2>
      </div>

      {sortedArtists.length === 0 ? (
        <div className="empty-removed">Không có nghệ sĩ nào</div>
      ) : (
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
            {sortedArtists.map((a, index) => (
              <tr key={a.id}>
                <td>{index + 1}</td>

                <td>
                  <img
                    src={a.avatar_url || "/uploads/defaults/default-artist.png"}
                    className="artist-avatar-table"
                    alt={a.stage_name}
                  />
                </td>

                <td>{a.stage_name}</td>

                <td>{a.total_albums ?? 0}</td>
                <td>{a.total_songs ?? 0}</td>

                <td>
                  {a.created_at
                    ? new Date(a.created_at).toLocaleDateString("vi-VN")
                    : "—"}
                </td>

                <td className="status-cell">
                  <span className="artist-status-removed">{a.registrationStatus}</span>
                </td>

                <td>
                  <div className="admin-actions">

                    {/* Xem chi tiết */}
                    <button
                      className="btn-view"
                      onClick={() =>
                        navigate(`/admin/artists/${a.id}`, {
                          state: { fromTab: "removed" },
                        })
                      }
                    >
                      Xem
                    </button>

                    {/* Khôi phục */}
                    <button
                      className="btn-restore"
                      onClick={() => restoreArtist(a.id)}
                    >
                      Khôi phục
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal thêm / sửa */}
      <ArtistFormModal
        isOpen={showModal}
        initialArtist={editArtist}
        onSubmit={async (data) => {
          try {
            if (editArtist?.id) {
              await axios.patch(
                `/admin/artists/${editArtist.id}`,
                data,
                { headers: { "Content-Type": "multipart/form-data" } }
              );
              alert("Đã cập nhật nghệ sĩ!");
            }
            setShowModal(false);
            setEditArtist(null);
            refresh();
          } catch (err) {
            console.error("SAVE ARTIST ERROR:", err);
            alert("Lỗi lưu nghệ sĩ!");
          }
        }}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default ArtistRemovedList;
