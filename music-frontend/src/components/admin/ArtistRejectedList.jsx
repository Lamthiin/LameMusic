import React from "react";
import axios from "axios";
import "./ArtistActiveList.css"; // dùng chung CSS bảng

const ArtistRejectedList = ({ artists = [], refresh }) => {

  const sortedArtists = [...artists].sort((a, b) =>
    a.stage_name.localeCompare(b.stage_name, "vi", { sensitivity: "base" })
  );

  const restoreArtist = async (id) => {
    if (!window.confirm("Khôi phục nghệ sĩ này về trạng thái chờ duyệt?")) return;

    try {
      await axios.patch(`http://localhost:3000/admin/artists/${id}/pending`);
      refresh && refresh();
    } catch (err) {
      console.error("RESTORE ERROR:", err);
      alert("Lỗi khôi phục nghệ sĩ!");
    }
  };

  const purgeArtist = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá vĩnh viễn?")) return;

    try {
      await axios.delete(`http://localhost:3000/admin/artists/${id}`);
      alert("Đã xoá nghệ sĩ thành công!");
      refresh && refresh();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Lỗi xoá nghệ sĩ!");
    }
  };

  return (
    <div className="active-container">
      <div className="top-bar">
        <h2 className="active-title">Nghệ sĩ bị từ chối</h2>
      </div>

      {sortedArtists.length === 0 ? (
        <div className="empty-active">Không có nghệ sĩ nào bị từ chối</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Ảnh</th>
              <th>Tên nghệ sĩ</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {sortedArtists.map((a, index) => (
              <tr key={a.id}>
                {/* STT */}
                <td>{index + 1}</td>

                {/* Avatar */}
                <td>
                  <img
                    className="artist-avatar-table"
                    src={a.avatar_url}
                    alt={a.stage_name}
                  />
                </td>

                {/* Tên nghệ sĩ */}
                <td>{a.stage_name}</td>

                {/* Ngày tạo */}
                <td>
                  {a.created_at
                    ? new Date(a.created_at).toLocaleDateString("vi-VN")
                    : "—"}
                </td>

                {/* Trạng thái */}
                <td className="status-cell">
                  <span className="artist-status-rejected">Rejected</span>
                </td>

                {/* Hành động */}
                <td>
                  <div className="admin-actions">

                    <button
                      className="btn-edit"
                      onClick={() => restoreArtist(a.id)}
                    >
                      Khôi phục
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => purgeArtist(a.id)}
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
    </div>
  );
};

export default ArtistRejectedList;
