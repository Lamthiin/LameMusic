import React, { useState } from "react";
import "./AdminManagerUser.css";
import { FiSearch } from "react-icons/fi";

const sampleCustomers = [
  { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com", createdAt: "2024-01-03" },
  { id: 2, name: "Trần Thị B", email: "b@gmail.com", createdAt: "2024-01-20" },
  { id: 3, name: "Brian", email: "brian@admin.com", createdAt: "2024-02-15" },
];

const AdminCustomerPage = () => {
  const [searchValue, setSearchValue] = useState("");

  // 🔍 Lọc realtime theo tên + email
  const filteredUsers = sampleCustomers.filter((u) =>
    (u.name + u.email).toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="admin-user-container">

      {/* 🔍 THANH TÌM KIẾM + NÚT THÊM */}
      <div className="admin-user-header">

        <div className="google-search-bar">
            <FiSearch className="google-search-icon" />
            <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="google-search-input"
            />
        </div>


        <button className="admin-add-btn">+ Thêm người dùng</button>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên người dùng</th>
            <th>Email</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#aaa" }}>
                Không tìm thấy người dùng nào.
              </td>
            </tr>
          ) : (
            filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.createdAt}</td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-btn view">Xem</button>
                    <button className="admin-btn delete">Xóa</button>
                    <button className="admin-btn edit">Edit</button>
                    <button className="admin-btn role">Role</button>
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

export default AdminCustomerPage;
