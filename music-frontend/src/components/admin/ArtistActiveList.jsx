import React, { useState } from "react";
import "./ArtistActiveList.css";

const ArtistActiveList = () => {
  // ============================
  //   MOCK DATA FE
  // ============================
  const [artists, setArtists] = useState([
    {
      id: 1,
      stage_name: "Sơn Tùng M-TP",
      avatar_url: "https://i.imgur.com/0ZfFQGh.jpeg",
      bio: "Ca sĩ, nhạc sĩ"
    },
    {
      id: 2,
      stage_name: "AMEE",
      avatar_url: "https://i.imgur.com/xJpUZKz.jpeg",
      bio: "Ca sĩ trẻ"
    },
    {
      id: 3,
      stage_name: "Đen Vâu",
      avatar_url: "https://i.imgur.com/CXQHGxB.jpeg",
      bio: "Rapper"
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editArtist, setEditArtist] = useState(null);

  // ============================
  //   DELETE (FE ONLY)
  // ============================
  const deleteArtist = (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá nghệ sĩ này?")) return;

    setArtists((prev) => prev.filter((a) => a.id !== id));
  };

  // ============================
  //   SAVE (ADD / EDIT)
  // ============================
  const saveArtist = () => {
    if (!editArtist.stage_name.trim()) {
      alert("Tên nghệ sĩ không được để trống!");
      return;
    }

    if (editArtist.id) {
      // EDIT
      setArtists((prev) =>
        prev.map((a) => (a.id === editArtist.id ? editArtist : a))
      );
    } else {
      // ADD NEW
      const newArtist = {
        ...editArtist,
        id: Date.now() // tạo id giả
      };

      setArtists((prev) => [...prev, newArtist]);
    }

    setShowModal(false);
    setEditArtist(null);
  };

  return (
    <div className="active-container">
      <div className="top-bar">
        <h2 className="active-title">Nghệ sĩ đang hoạt động</h2>
        <button
          className="btn-add"
          onClick={() => {
            setEditArtist({ stage_name: "", bio: "", avatar_url: "" });
            setShowModal(true);
          }}
        >
          + Thêm nghệ sĩ
        </button>
      </div>

      {/* EMPTY */}
      {artists.length === 0 ? (
        <div className="empty-active">Không có nghệ sĩ nào hoạt động</div>
      ) : (
        <div className="active-list">
          {artists.map((a) => (
            <div className="active-row" key={a.id}>
              <img className="row-avatar" src={a.avatar_url} alt={a.stage_name} />

              <div className="row-info">
                <h3>{a.stage_name}</h3>
              </div>

              <div className="row-actions">
                <button
                  className="btn-edit"
                  onClick={() => {
                    setEditArtist(a);
                    setShowModal(true);
                  }}
                >
                  Sửa
                </button>

                <button className="btn-delete" onClick={() => deleteArtist(a.id)}>
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{editArtist.id ? "Chỉnh sửa nghệ sĩ" : "Thêm nghệ sĩ mới"}</h3>

            <input
              type="text"
              placeholder="Tên nghệ sĩ"
              value={editArtist.stage_name}
              onChange={(e) =>
                setEditArtist({ ...editArtist, stage_name: e.target.value })
              }
            />

            <textarea
              placeholder="Mô tả / Tiểu sử"
              value={editArtist.bio}
              onChange={(e) =>
                setEditArtist({ ...editArtist, bio: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="URL avatar"
              value={editArtist.avatar_url}
              onChange={(e) =>
                setEditArtist({ ...editArtist, avatar_url: e.target.value })
              }
            />

            <div className="modal-actions">
              <button className="btn-save" onClick={saveArtist}>Lưu</button>
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistActiveList;
