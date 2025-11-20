import React from "react";
import "./ArtistPendingList.css";

const ArtistPendingList = () => {
  const artists = [
    { id: 1, stage_name: "Sơn Tùng M-TP", avatar_url: "https://i.imgur.com/0ZfFQGh.jpeg" },
    { id: 2, stage_name: "AMEE", avatar_url: "https://i.imgur.com/xJpUZKz.jpeg" },
    { id: 3, stage_name: "Đen Vâu", avatar_url: "https://i.imgur.com/CXQHGxB.jpeg" },
    { id: 4, stage_name: "Hoàng Dũng", avatar_url: "https://i.imgur.com/pRLDYKY.jpeg" },
  ];

  const approve = (id) => alert("Duyệt ID: " + id);
  const reject = (id) => alert("Từ chối ID: " + id);
  const view = (id) => alert("Xem hồ sơ ID: " + id);

  return (
    <div className="pending-container">
      <h2 className="pending-title">Danh sách nghệ sĩ chờ duyệt</h2>

      <div className="pending-list">
  {artists.length === 0 ? (
    <div className="empty-message">Không có nghệ sĩ nào chờ duyệt</div>
  ) : (
    artists.map((a) => (
      <div className="pending-row" key={a.id}>
        <img className="row-avatar" src={a.avatar_url} alt={a.stage_name} />

        <div className="row-info">
          <h3>{a.stage_name}</h3>
        </div>

        <div className="row-actions">
          <button className="btn-view" onClick={() => view(a.id)}>Xem</button>
          <button className="btn-accept" onClick={() => approve(a.id)}>Duyệt</button>
          <button className="btn-reject" onClick={() => reject(a.id)}>Từ chối</button>
        </div>
      </div>
    ))
  )}
</div>

    </div>
  );
};

export default ArtistPendingList;