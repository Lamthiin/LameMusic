import React, { useState, useEffect } from "react";
import "./AdminManagerUser.css";
import { FiSearch } from "react-icons/fi";

import PopupAddAdmin from "../../components/admin/PopupAddAdmin";
import PopupSuccess from "../../components/admin/PopupSuccess";
import PopupDeleteConfirm from "../../components/admin/PopupDeleteConfirm";
import PopupViewAdmin from "../../components/admin/PopupViewAdmin";
import PopupEditAdmin from "../../components/admin/PopupEditAdmin";

const AdminAccountPage = () => {
  const [admins, setAdmins] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // FETCH ADMIN FROM BACKEND
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("http://localhost:3000/admin/users/admins");
      const data = await res.json();

      const mapped = data.map((u) => ({
        id: u.id,
        name: u.username,
        email: u.email,
        role: u.role,          // LUÔN LÀ ADMIN
        createdAt: u.created_at?.split("T")[0],
      }));

      setAdmins(mapped);
    } catch (err) {
      console.error("Fetch admins failed:", err);
    }
  };

  const filteredAdmins = admins.filter((ad) =>
    (ad.name + ad.email + ad.role)
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
            placeholder="Tìm kiếm Admin..."
            autoComplete="off"     // <--- thêm dòng này
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

      {/* TABLE */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Admin</th>
            <th>Email</th>
            <th>Role</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filteredAdmins.map((ad, index) => (
            <tr key={ad.id}>
              <td>{index + 1}</td>
              <td>{ad.name}</td>
              <td>{ad.email}</td>
              <td>{ad.role}</td>
              <td>
                <div className="admin-actions">
                  <button
                    className="admin-btn view"
                    onClick={async () => {
                      try {
                        const res = await fetch(`http://localhost:3000/admin/users/${ad.id}`);
                        const detail = await res.json();

                        setSelectedAdmin(detail);
                        setShowView(true);
                      } catch (err) {
                        console.error("Fetch admin detail failed:", err);
                      }
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
                    Khoá
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
          const user = data.user; // backend trả về user

          const mapped = {
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role,   // admin
            createdAt: new Date().toISOString().split("T")[0],
          };

          setAdmins((prev) => [...prev, mapped]);

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
        onSubmit={async (updated) => {
          try {
            const payload = {
              username: updated.name,
              email: updated.email,
              password: updated.password || undefined, // chỉ gửi nếu có
            };

            const res = await fetch(
              `http://localhost:3000/admin/users/admins/${updated.id}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );

            const result = await res.json();

            if (!res.ok) {
              alert(result.message || "Lỗi cập nhật admin!");
              return;
            }

            // update FE
            setAdmins((prev) =>
              prev.map((item) =>
                item.id === updated.id ? { ...item, ...updated } : item
              )
            );

            setShowEdit(false);
            setSuccessMessage("Cập nhật Admin thành công!");
            setShowSuccess(true);

          } catch (err) {
            console.error("Update admin failed:", err);
            alert("Không thể cập nhật admin!");
          }
        }}
      />
    )}


      {/* DELETE */}
      {showDelete && (
        <PopupDeleteConfirm
          title="Khoá Admin"
          message={`Bạn có chắc muốn khoá admin "${selectedAdmin.name}"?`}
          onCancel={() => setShowDelete(false)}
          onConfirm={async () => {
            try {
              const res = await fetch(
                `http://localhost:3000/admin/users/admins/${selectedAdmin.id}/soft-delete`,
                { method: "PATCH" }
              );

              const data = await res.json();

              if (!res.ok) {
                alert(data.message || "Khoá admin thất bại!");
                return;
              }

              // Khoá trên FE
              setAdmins((prev) =>
                prev.filter((item) => item.id !== selectedAdmin.id)
              );

              setShowDelete(false);
              setSuccessMessage("Khoá Admin thành công!");
              setShowSuccess(true);

            } catch (error) {
              console.error("Block admin failed:", error);
              alert("Không thể khoá admin!");
            }
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
