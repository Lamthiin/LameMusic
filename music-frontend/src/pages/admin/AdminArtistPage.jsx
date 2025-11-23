import React, { useState } from "react";
import "./AdminManagerUser.css";
import { FiSearch } from "react-icons/fi";
import PopupAddArtist from "../../components/admin/PopupAddArtist";
import PopupSuccess from "../../components/admin/PopupSuccess";
import PopupDeleteConfirm from "../../components/admin/PopupDeleteConfirm";
import PopupApproveConfirm from "../../components/admin/PopupApproveConfirm";
import ArtistViewModal from "../../components/admin/ArtistViewModal";
import PopupEditArtist from "../../components/admin/PopupEditArtist";


const sampleArtists = [
  { id: 1, name: "Taylor Swift", email: "taylor@gmail.com", songs: 150, status: "approved" },
  { id: 2, name: "The Weeknd", email: "weeknd@gmail.com", songs: 90, status: "pending" },
];

const AdminArtistPage = () => {
  const [searchValue, setSearchValue] = useState("");

  // State quản lý
  const [artists, setArtists] = useState(sampleArtists);
  const [showAddArtist, setShowAddArtist] = useState(false);
  const [showDeleteArtist, setShowDeleteArtist] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showApprove, setShowApprove] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");


  // Lọc realtime theo tên + email
  const filteredArtists = artists.filter((artist) =>
    (artist.name + artist.email).toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="admin-user-container">

      {/* HEADER */}
      <div className="admin-user-header">

        <div className="google-search-bar">
          <FiSearch className="google-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm nghệ sĩ..."
            className="google-search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* 👉 NÚT MỞ POPUP */}
        <button
          className="admin-add-btn"
          onClick={() => setShowAddArtist(true)}
        >
          + Thêm nghệ sĩ
        </button>
      </div>

      {/* TABLE */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên nghệ sĩ</th>
            <th>Email</th>
            <th>Số bài hát</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filteredArtists.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: 20, color: "#888" }}>
                Không tìm thấy nghệ sĩ nào.
              </td>
            </tr>
          ) : (
            filteredArtists.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td>{a.songs}</td>

                <td>
                  <span
                    className={
                      "status-badge " +
                      (a.status === "pending"
                        ? "status-pending"
                        : a.status === "approved"
                        ? "status-approved"
                        : "status-rejected")
                    }
                  >
                    {a.status === "pending" ? "Pending" : "Artist"}
                  </span>
                </td>

                <td>
                  <div className="admin-actions">
                    <button
                      className="admin-btn view"
                      onClick={() => {
                        setSelectedArtist(a);
                        setShowView(true);
                      }}
                    >
                      Xem
                    </button>

                    <button
                      className="admin-btn edit"
                      onClick={() => {
                        setSelectedArtist(a);
                        setShowEdit(true);
                      }}
                    >
                      Edit
                    </button>


                    {a.status === "pending" && (
                      <button
                        className="admin-btn role"
                        onClick={() => {
                          setSelectedArtist(a);
                          setShowApprove(true);
                        }}
                      >
                        Duyệt
                      </button>
                    )}

                    <button
                      className="admin-btn delete"
                      onClick={() => {
                        setSelectedArtist(a);
                        setShowDeleteArtist(true);
                      }}
                    >
                      Xóa
                    </button>

                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* POPUP ADD ARTIST */}
      {showAddArtist && (
        <PopupAddArtist
          onClose={() => setShowAddArtist(false)}
          onSubmit={(data) => {
            console.log("Artist created:", data);
            setShowAddArtist(false);
            setSuccessMessage("Thêm nghệ sĩ thành công!");
            setShowSuccess(true);
          }}
        />
      )}

      {/* POPUP SUCCESS */}
      {showSuccess && (
        <PopupSuccess
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}


      {/* POPUP DELETE CONFIRM */}
      {showDeleteArtist && (
        <PopupDeleteConfirm
          title="Xoá Nghệ Sĩ"
          message={`Bạn có chắc muốn xoá nghệ sĩ "${selectedArtist?.name}"?`}
          onCancel={() => setShowDeleteArtist(false)}
          onConfirm={() => {
            console.log("Đã xoá nghệ sĩ:", selectedArtist);
            setArtists(prev => prev.filter(item => item.id !== selectedArtist.id));
            
            setShowDeleteArtist(false);
            setSuccessMessage("Xoá nghệ sĩ thành công!");
            setShowSuccess(true);
          }}
        />
      )}

      {/* POPUP APPROVE ARTIST */}
      {showApprove && (
        <PopupApproveConfirm
          title="Duyệt Nghệ Sĩ"
          message={`Xác nhận duyệt nghệ sĩ "${selectedArtist?.name}"?`}
          onCancel={() => setShowApprove(false)}
          onConfirm={() => {
            setArtists(prev =>
              prev.map(item =>
                item.id === selectedArtist.id
                  ? { ...item, status: "approved" }
                  : item
              )
            );

            setShowApprove(false);
            setSuccessMessage("Duyệt nghệ sĩ thành công!");
            setShowSuccess(true);
          }}
        />
      )}

      {/* POPUP VIEW ARTIST */}
      {showView && (
        <ArtistViewModal
          artist={selectedArtist}
          onClose={() => setShowView(false)}
        />
      )}

      {/* POPUP EDIT ARTIST */}
      {showEdit && (
        <PopupEditArtist
          artist={selectedArtist}
          onClose={() => setShowEdit(false)}
          onSubmit={(updated) => {
            setArtists(prev =>
              prev.map(item =>
                item.id === updated.id ? updated : item
              )
            );
            setShowEdit(false);
            setSuccessMessage("Cập nhật nghệ sĩ thành công!");
            setShowSuccess(true);
          }}
        />
      )}



    </div>
  );
};

export default AdminArtistPage;
