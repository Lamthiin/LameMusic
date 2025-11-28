import React from "react";
import axios from "axios";
import "./ArtistActiveList.css"; // dùng chung CSS

const ArtistRejectedList = ({ artists = [], refresh }) => {

  // SẮP XẾP A → Z
  const sortedArtists = [...artists].sort((a, b) =>
    a.stage_name.localeCompare(b.stage_name, "vi", { sensitivity: "base" })
  );

  // ============================
  // API: Khôi phục nghệ sĩ
  // ============================
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


  // ============================
  // API: Xóa vĩnh viễn (active = 0)
  // ============================
  const purgeArtist = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá vĩnh viễn?")) return;

    try {
      await axios.delete(`http://localhost:3000/admin/artists/${id}`);
      alert("Đã xoá vĩnh viễn nghệ sĩ!");
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
        <div className="active-list">
          {sortedArtists.map((a) => (
            <div className="active-row" key={a.id}>
              <img className="row-avatar" src={a.avatar_url} alt={a.stage_name} />

              <div className="row-info">
                <h3>{a.stage_name}</h3>
              </div>

              <div className="row-actions">
                <button className="btn-edit" onClick={() => restoreArtist(a.id)}>
                  Khôi phục
                </button>

                <button className="btn-delete" onClick={() => purgeArtist(a.id)}>
                  Xoá vĩnh viễn
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistRejectedList;
