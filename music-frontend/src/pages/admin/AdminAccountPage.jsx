import React, { useState } from "react";
import "./AdminManagerUser.css";
import { FiSearch } from "react-icons/fi";

import PopupAddAdmin from "../../components/admin/PopupAddAdmin";
import PopupSuccess from "../../components/admin/PopupSuccess";
import PopupDeleteConfirm from "../../components/admin/PopupDeleteConfirm";
import PopupViewAdmin from "../../components/admin/PopupViewAdmin";
import PopupEditAdmin from "../../components/admin/PopupEditAdmin";

const AdminAccountPage = () => {

  const [admins, setAdmins] = useState([
    { id: 1, name: "Brian", email: "brian@admin.com", role: "Super Admin" },
    { id: 2, name: "Nam", email: "nam@admin.com", role: "Moderator" },
  ]);

  const [searchValue, setSearchValue] = useState("");

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const filteredAdmins = admins.filter((ad) =>
    (ad.name + ad.email + ad.role).toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="admin-user-container">

      <div className="admin-user-header">
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

        <button
          className="admin-add-btn"
          onClick={() => setShowAddAdmin(true)}
        >
          + Thêm Admin
        </button>
      </div>

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
          {filteredAdmins.map((ad) => (
            <tr key={ad.id}>
              <td>{ad.id}</td>
              <td>{ad.name}</td>
              <td>{ad.email}</td>
              <td>{ad.role}</td>
              <td>
                <div className="admin-actions">

                  <button
                    className="admin-btn view"
                    onClick={() => {
                      setSelectedAdmin(ad);
                      setShowView(true);
                    }}
                  >
                    Xem
                  </button>

                  <button
                    className="admin-btn edit"
                    onClick={() => {
                      setSelectedAdmin(ad);
                      setShowEdit(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="admin-btn delete"
                    onClick={() => {
                      setSelectedAdmin(ad);
                      setShowDelete(true);
                    }}
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
      {showAddAdmin && (
        <PopupAddAdmin
          onClose={() => setShowAddAdmin(false)}
          onSubmit={(data) => {
            setAdmins(prev => [...prev, { id: prev.length + 1, ...data }]);
            setShowAddAdmin(false);
            setSuccessMessage("Thêm Admin thành công!");
            setShowSuccess(true);
          }}
        />
      )}

      {/* VIEW */}
      {showView && (
        <PopupViewAdmin
          admin={selectedAdmin}
          onClose={() => setShowView(false)}
        />
      )}

      {/* EDIT */}
      {showEdit && (
        <PopupEditAdmin
          admin={selectedAdmin}
          onClose={() => setShowEdit(false)}
          onSubmit={(updated) => {
            setAdmins(prev =>
              prev.map(item =>
                item.id === updated.id ? updated : item
              )
            );
            setSuccessMessage("Cập nhật Admin thành công!");
            setShowSuccess(true);
          }}
        />
      )}

      {/* DELETE */}
      {showDelete && (
        <PopupDeleteConfirm
          title="Xoá Admin"
          message={`Bạn có chắc muốn xoá admin "${selectedAdmin.name}"?`}
          onCancel={() => setShowDelete(false)}
          onConfirm={() => {
            setAdmins(prev => prev.filter(item => item.id !== selectedAdmin.id));
            setShowDelete(false);
            setSuccessMessage("Xoá Admin thành công!");
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

export default AdminAccountPage;
