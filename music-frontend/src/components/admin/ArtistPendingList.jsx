import React from "react";
import "./ArtistActiveList.css"; // vẫn dùng CSS cũ

const ArtistPendingList = ({ artists = [], approve, reject, view }) => {
  const safeArtists = Array.isArray(artists) ? artists : [];

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
              <th>Ngày tạo</th>     {/* ⭐ thêm cột mới */}
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {safeArtists.map((a, index) => (
              <tr key={a.id}>
                {/* STT */}
                <td>{index + 1}</td>

                {/* Ảnh */}
                <td>
                  <img
                    src={a.avatar_url}
                    className="artist-avatar-table"
                    alt={a.stage_name}
                  />
                </td>

                {/* Tên nghệ sĩ */}
                <td>{a.stage_name}</td>

                {/* ⭐ Ngày tạo */}
                <td>{a.created_at ? new Date(a.created_at).toLocaleDateString("vi-VN") : "—"}</td>

                {/* Status */}
                <td className="artist-status-pending">Pending</td>

                {/* Actions */}
                <td>
                  <div className="admin-actions">
        

                    <button className="btn-save" onClick={() => approve?.(a.id)}>
                      Duyệt
                    </button>

                    <button className="btn-delete" onClick={() => reject?.(a.id)}>
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
