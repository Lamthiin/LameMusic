import React from "react";
import "./ArtistActiveList.css"; // vẫn dùng CSS cũ

const ArtistPendingList = ({ artists = [], approve, reject, view }) => {
  const safeArtists = Array.isArray(artists) ? artists : [];

  // ⭐ Thêm wrapper để log kết quả duyệt
  const handleApprove = async (id) => {
    try {
      await approve?.(id);
      alert("✔ Nghệ sĩ đã được duyệt thành công!");
    } catch (err) {
      console.error("APPROVE ARTIST ERROR:", err);
      alert("❌ Lỗi khi duyệt nghệ sĩ!");
    }
  };

  // ⭐ Thêm wrapper để log kết quả từ chối
  const handleReject = async (id) => {
    try {
      await reject?.(id);
      alert("✔ Đã từ chối nghệ sĩ!");
    } catch (err) {
      console.error("REJECT ARTIST ERROR:", err);
      alert("❌ Lỗi khi từ chối nghệ sĩ!");
    }
  };

  return (
    <div className="active-container">

      <div className="top-bar">
        <h2 className="active-title">Nghệ sĩ chờ duyệt</h2>
      </div>

      {safeArtists.length === 0 ? (
        <div className="empty-active">Không có nghệ sĩ nào chờ duyệt</div>
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
            {safeArtists.map((a, index) => (
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

                <td>
                  {a.created_at
                    ? new Date(a.created_at).toLocaleDateString("vi-VN")
                    : "—"}
                </td>

                <td className="artist-status-pending">Pending</td>

                <td>
                  <div className="admin-actions">

                    <button
                      className="btn-save"
                      onClick={() => handleApprove(a.id)}
                    >
                      Duyệt
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleReject(a.id)}
                    >
                      Từ chối
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

export default ArtistPendingList;
