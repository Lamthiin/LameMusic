import React, { useState } from "react";
import "./AdminManagerUser.css";
import { FiSearch } from "react-icons/fi";

import PopupAddUser from "../../components/admin/PopupAddUser";
import PopupEditUser from "../../components/admin/PopupEditUser";
import PopupViewUser from "../../components/admin/PopupViewUser";
import PopupRoleUser from "../../components/admin/PopupRoleUser";
import PopupSuccess from "../../components/admin/PopupSuccess";
import PopupDeleteConfirm from "../../components/admin/PopupDeleteConfirm";


const initialUsers = [
  { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com", birthYear: 2000, gender: "male", createdAt: "2024-01-03", role: "artist" },
  { id: 2, name: "Trần Thị B", email: "b@gmail.com", birthYear: 1999, gender: "female", createdAt: "2024-01-20", role: "listener" },
  { id: 3, name: "Brian", email: "brian@admin.com", birthYear: 2003, gender: "male", createdAt: "2024-02-15", role: "listener" },
];

const AdminCustomerPage = () => {
  const [users, setUsers] = useState(initialUsers);

  const [searchValue, setSearchValue] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter((u) =>
    u.role !== "admin" &&
    (u.name + u.email).toLowerCase().includes(searchValue.toLowerCase())
  );


  return (
    <div className="admin-user-container">

      {/* HEADER */}
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

        <button className="admin-add-btn" onClick={() => setShowAdd(true)}>
          + Thêm người dùng
        </button>
      </div>

      {/* TABLE */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên người dùng</th>
            <th>Email</th>
            <th>Năm sinh</th>
            <th>Giới tính</th>
            <th>Role</th>       {/* THÊM CỘT ROLE */}
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.birthYear}</td>
              <td>{u.gender}</td>

              {/* ROLE BADGE */}
              <td>
                <span
                  className={`status-badge ${
                    u.role === "admin"
                      ? "status-approved"
                      : u.role === "artist"
                      ? "status-pending"
                      : "status-rejected"
                  }`}
                >
                  {u.role}
                </span>
              </td>

              <td>{u.createdAt}</td>

              <td>
                <div className="admin-actions">

                  <button
                    className="admin-btn view"
                    onClick={() => { setSelectedUser(u); setShowView(true); }}
                  >
                    Xem
                  </button>

                  <button
                    className="admin-btn edit"
                    onClick={() => { setSelectedUser(u); setShowEdit(true); }}
                  >
                    Edit
                  </button>

                  {/* ROLE chỉ hiện nếu là listener */}
                  {u.role === "listener" && (
                    <button
                      className="admin-btn role"
                      onClick={() => { setSelectedUser(u); setShowRole(true); }}
                    >
                      Role
                    </button>
                  )}



                  <button
                    className="admin-btn delete"
                    onClick={() => { setSelectedUser(u); setShowDelete(true); }}
                  >
                    Xóa
                  </button>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>



      {/* ADD */}
      {showAdd && (
        <PopupAddUser
          onClose={() => setShowAdd(false)}
          onSubmit={(data) => {
            setUsers([...users, { id: users.length + 1, ...data }]);
            setShowAdd(false);
            setSuccessMessage("Thêm người dùng thành công!");
            setShowSuccess(true);
          }}
        />
      )}

      {/* VIEW */}
      {showView && (
        <PopupViewUser
          user={selectedUser}
          onClose={() => setShowView(false)}
        />
      )}

      {/* EDIT */}
      {showEdit && (
        <PopupEditUser
          user={selectedUser}
          onClose={() => setShowEdit(false)}
          onSubmit={(updated) => {
            setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
            setShowEdit(false);
            setSuccessMessage("Cập nhật thành công!");
            setShowSuccess(true);
          }}
        />
      )}

      {/* CHANGE ROLE */}
      {showRole && (
        <PopupRoleUser
          user={selectedUser}
          onClose={() => setShowRole(false)}
          onSubmit={(newRole) => {
            setUsers(users.map((u) =>
              u.id === selectedUser.id ? { ...u, role: newRole } : u
            ));
            setSuccessMessage("Nâng quyền thành công!");
            setShowSuccess(true);
            setShowRole(false);
          }}
        />
      )}



      {/* DELETE USER */}
      {showDelete && (
        <PopupDeleteConfirm
          title="Xoá Người Dùng"
          message={`Bạn có chắc muốn xoá người dùng "${selectedUser.name}"?`}
          onCancel={() => setShowDelete(false)}
          onConfirm={() => {
            setUsers(users.filter((u) => u.id !== selectedUser.id));
            setShowDelete(false);
            setSuccessMessage("Xoá người dùng thành công!");
            setShowSuccess(true);
          }}
        />
      )}

      {/* SUCCESS */}
      {showSuccess && (
        <PopupSuccess
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default AdminCustomerPage;
