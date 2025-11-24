import React, { useState } from "react";
import "./ArtistActiveList.css";
import ArtistFormModal from "../admin/ArtistFormModal.jsx";

const ArtistActiveList = ({ artists = [], refresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editArtist, setEditArtist] = useState(null);

  // SẮP XẾP A → Z
  const sortedArtists = [...artists].sort((a, b) =>
    a.stage_name.localeCompare(b.stage_name, "vi", { sensitivity: "base" })
  );

  const deleteArtist = (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá nghệ sĩ này?")) return;
    alert("Chức năng xoá BE sẽ làm sau. FE xoá tạm thôi.");
    refresh();
  };

  // Khi submit form từ ArtistFormModal
  const saveArtist = async (formData) => {
    alert("Chức năng lưu/sửa BE sẽ làm sau. FE đang mô phỏng");
    setShowModal(false);
    setEditArtist(null);
    refresh();
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

      {sortedArtists.length === 0 ? (
        <div className="empty-active">Không có nghệ sĩ nào hoạt động</div>
      ) : (
        <div className="active-list">
          {sortedArtists.map((a) => (
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

      {/* ⭐ DÙNG ARTIST FORM MODAL — KHÔNG DÙNG MODAL CŨ NỮA */}
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
