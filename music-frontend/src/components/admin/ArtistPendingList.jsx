import React from "react";
import "./ArtistActiveList.css"; // ⭐ Dùng chung CSS

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
        <div className="active-list">
          {safeArtists.map((a) => (
            <div className="active-row" key={a.id}>
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
                  className="btn-edit" // dùng style nút xanh
                  onClick={() => view && view(a.id)}
                >
                  Xem
                </button>

                <button
                  className="btn-save" // xanh lá ✔
                  onClick={() => approve && approve(a.id)}
                >
                  Duyệt
                </button>

                <button
                  className="btn-delete" // đỏ
                  onClick={() => reject && reject(a.id)}
                >
                  Từ chối
                </button>

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistPendingList;
