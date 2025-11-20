import React, { useState } from "react";
import "./AdminManagerUser.css";
import { FiSearch } from "react-icons/fi";

const sampleArtists = [
  { id: 1, name: "Taylor Swift", email: "taylor@gmail.com", songs: 150, status: "approved" },
  { id: 2, name: "The Weeknd", email: "weeknd@gmail.com", songs: 90, status: "pending" },
  { id: 3, name: "Taylor Swift", email: "taylor@gmail.com", songs: 150, status: "approved" },
  { id: 4, name: "The Weeknd", email: "weeknd@gmail.com", songs: 90, status: "pending" },
  { id: 5, name: "Taylor Swift", email: "taylor@gmail.com", songs: 150, status: "approved" },
  { id: 6, name: "The Weeknd", email: "weeknd@gmail.com", songs: 90, status: "pending" },
  { id: 7, name: "Taylor Swift", email: "taylor@gmail.com", songs: 150, status: "approved" },
  { id: 8, name: "The Weeknd", email: "weeknd@gmail.com", songs: 90, status: "pending" },
  { id: 9, name: "Taylor Swift", email: "taylor@gmail.com", songs: 150, status: "approved" },
  { id: 10, name: "The Weeknd", email: "weeknd@gmail.com", songs: 90, status: "pending" },
  { id: 11, name: "Taylor Swift", email: "taylor@gmail.com", songs: 150, status: "approved" },
  { id: 12, name: "The Weeknd", email: "weeknd@gmail.com", songs: 90, status: "pending" },
  { id: 13, name: "Taylor Swift", email: "taylor@gmail.com", songs: 150, status: "approved" },
  { id: 14, name: "The Weeknd", email: "weeknd@gmail.com", songs: 90, status: "pending" },
];

const AdminArtistPage = () => {
  const [searchValue, setSearchValue] = useState("");

  // Lọc theo tên + email
  const filteredArtists = sampleArtists.filter((artist) =>
    (artist.name + artist.email)
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

                {/* STATUS BADGE */}
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
                    {a.status === "pending"
                      ? "Pending"
                      : a.status === "approved"
                      ? "Artist"
                      : "Rejected"}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td>
                  <div className="admin-actions">
                    <button className="admin-btn view">Xem</button>
                    <button className="admin-btn edit">Edit</button>

                    {/* ROLE BUTTON CHỈ HIỆN KHI PENDING */}
                    {a.status === "pending" && (
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
