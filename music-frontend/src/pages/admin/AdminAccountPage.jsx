import React, { useState } from "react";
import "./AdminManagerUser.css";
import { FiSearch } from "react-icons/fi";

const sampleAdmins = [
  { id: 1, name: "Brian", email: "brian@admin.com", role: "Super Admin" },
  { id: 2, name: "Nam", email: "nam@admin.com", role: "Moderator" },
];

const AdminAccountPage = () => {
  const [searchValue, setSearchValue] = useState("");

  // Lọc realtime theo name + email + role
  const filteredAdmins = sampleAdmins.filter((admin) =>
    (admin.name + admin.email + admin.role)
      .toLowerCase()
      .includes(searchValue.toLowerCase())
  );

  return (
    <div className="admin-user-container">

      {/* HEADER */}
      <div className="admin-user-header">

        {/* TÌM KIẾM */}
        <div className="google-search-bar">
          <FiSearch className="google-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm Admin..."
            className="google-search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <button className="admin-add-btn">+ Thêm Admin</button>
      </div>

      {/* BẢNG ADMIN */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên Admin</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filteredAdmins.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: 20, color: "#888" }}>
                Không tìm thấy Admin nào.
              </td>
            </tr>
          ) : (
            filteredAdmins.map((ad) => (
              <tr key={ad.id}>
                <td>{ad.id}</td>
                <td>{ad.name}</td>
                <td>{ad.email}</td>
                <td>{ad.role}</td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-btn view">Xem</button>
                    <button className="admin-btn delete">Xóa</button>
                    <button className="admin-btn edit">Edit</button>
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

export default AdminAccountPage;
