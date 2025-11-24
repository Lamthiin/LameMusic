import React from "react";
import "./ArtistPendingList.css";

// Component chỉ nhận dữ liệu từ cha, KHÔNG tự gọi axios nữa
const ArtistPendingList = ({ artists, approve, reject, view }) => {
  // Chắc chắn artists luôn là array
  const safeArtists = Array.isArray(artists) ? artists : [];

  const handleView = (id) => {
    if (view) view(id);
    else alert("Xem chi tiết nghệ sĩ ID: " + id);
  };

  const handleApprove = (id) => {
    if (approve) approve(id);
  };

  const handleReject = (id) => {
    if (reject) reject(id);
    else alert("TODO: Từ chối nghệ sĩ ID: " + id);
  };

  return (
    <div className="pending-container">
      <h2 className="pending-title">Danh sách nghệ sĩ chờ duyệt</h2>

      <div className="pending-list">
        {safeArtists.length === 0 ? (
          <div className="empty-message">Không có nghệ sĩ nào chờ duyệt</div>
        ) : (
          safeArtists.map((a) => (
            <div className="pending-row" key={a.id}>
              <img
                className="row-avatar"
                src={a.avatar_url}
                alt={a.stage_name}
              />

              <div className="row-info">
                <h3>{a.stage_name}</h3>
              </div>

              <div className="row-actions">
                <button
                  className="btn-view"
                  onClick={() => handleView(a.id)}
                >
                  Xem
                </button>
                <button
                  className="btn-accept"
                  onClick={() => handleApprove(a.id)}
                >
                  Duyệt
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleReject(a.id)}
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ArtistPendingList;
