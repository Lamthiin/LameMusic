import React, { useState, useEffect } from "react";
import "./AdminManagerUser.css";
import { FiSearch } from "react-icons/fi";
import axios from "axios";

const AdminArtistPage = () => {
  const [artists, setArtists] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  // ===============================
  // LOAD ARTISTS TỪ BACKEND
  // ===============================
  const loadArtists = async () => {
    try {
      const res = await axios.get("/admin/artists/active"); // ⭐ KHÔNG /api !!!
      console.log("ACTIVE FROM BE:", res.data);

      if (Array.isArray(res.data)) {
        setArtists(res.data);
      } else {
        console.warn("❗ API không trả về array:", res.data);
        setArtists([]);
      }
    } catch (err) {
      console.error("LOAD ACTIVE ARTISTS ERROR:", err);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  // FILTER SEARCH
  const filteredArtists = artists.filter((artist) =>
    (artist.stage_name + artist.user?.email)
      .toLowerCase()
      .includes(searchValue.toLowerCase())
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

        <button className="admin-add-btn">+ Thêm nghệ sĩ</button>
      </div>

      {/* TABLE */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nghệ danh</th>
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
                <td>{a.stage_name}</td>
                <td>{a.user?.email}</td>
                <td>{a.songs?.length || 0}</td>

                {/* STATUS BADGE */}
                <td>
                  <span
                    className={
                      "status-badge " +
                      (a.registrationStatus === "PENDING"
                        ? "status-pending"
                        : a.registrationStatus === "APPROVED"
                        ? "status-approved"
                        : "status-rejected")
                    }
                  >
                    {a.registrationStatus === "PENDING"
                      ? "Pending"
                      : a.registrationStatus === "APPROVED"
                      ? "Artist"
                      : "Rejected"}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td>
                  <div className="admin-actions">
                    <button className="admin-btn view">Xem</button>
                    <button className="admin-btn edit">Edit</button>

                    {a.registrationStatus === "PENDING" && (
                      <button className="admin-btn role">
                        Duyệt
                      </button>
                    )}

                    <button className="admin-btn delete">Xóa</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminArtistPage;
