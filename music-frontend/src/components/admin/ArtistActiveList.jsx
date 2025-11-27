import React, { useState } from "react";
import axios from "axios";
import "./ArtistActiveList.css";
import ArtistFormModal from "../admin/ArtistFormModal.jsx";

const ArtistActiveList = ({ artists = [], refresh }) => {

  const [showModal, setShowModal] = useState(false);   // ⭐ FIX DUY NHẤT NÊN CẦN
  const [editArtist, setEditArtist] = useState(null);

  const sortedArtists = [...artists].sort((a, b) =>
    a.stage_name.localeCompare(b.stage_name, "vi", { sensitivity: "base" })
  );

  const deleteArtist = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá nghệ sĩ này?")) return;

    try {
      await axios.delete(`http://localhost:3000/admin/artists/${id}`);

      alert("Đã xoá nghệ sĩ!");
      refresh(); // load lại danh sách
    } catch (err) {
      console.error("DELETE ARTIST ERROR:", err);
      alert("Lỗi xoá nghệ sĩ!");
    }
  };


  const saveArtist = async (formData) => {
    try {
      if (editArtist && editArtist.id) {
        await axios.patch(
          `http://localhost:3000/admin/artists/${editArtist.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("Đã cập nhật nghệ sĩ!");
      } else {
        await axios.post(
          "http://localhost:3000/admin/artists",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("Đã thêm nghệ sĩ mới!");
      }

      setShowModal(false);
      setEditArtist(null);
      refresh();

    } catch (err) {
      console.error("SAVE ARTIST ERROR:", err);
      alert("Lỗi lưu nghệ sĩ!");
    }
  };

  return (
    <div className="active-container">

      <div className="top-bar">
        <h2 className="active-title">Nghệ sĩ đang hoạt động</h2>

        <button
          className="btn-add"
          onClick={() => {
            setEditArtist(null);
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
