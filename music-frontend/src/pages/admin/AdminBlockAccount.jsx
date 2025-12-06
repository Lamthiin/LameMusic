import React, { useState, useEffect } from "react";
import "./AdminManagerUser.css";
import { FiSearch } from "react-icons/fi";

import PopupViewUser from "../../components/admin/PopupViewUser";
import PopupSuccess from "../../components/admin/PopupSuccess";
import PopupDeleteConfirm from "../../components/admin/PopupDeleteConfirm";

const AdminBlockAccount = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const [showView, setShowView] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ---------------------------------------------
  // LOAD BLOCKED USERS
  // ---------------------------------------------
  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/admin/users/blocked");
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("API returned error:", data);
        return;
      }

      const mapped = data.map((u) => ({
        id: u.id,
        name: u.username,
        email: u.email,
        gender: u.gender,
        birthYear: u.birth_year,
        createdAt: u.created_at?.split("T")[0],
        role: u.role_name || "unknown",
      }));

      setBlockedUsers(mapped);
    } catch (err) {
      console.error("Fetch blocked users failed:", err);
    }
  };

  // ---------------------------------------------
  // FILTER SEARCH
  // ---------------------------------------------
  const filtered = blockedUsers.filter((u) =>
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
            placeholder="Tìm kiếm tài khoản bị khóa..."
            autoComplete="off"
            className="google-search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên người dùng</th>
            <th>Email</th>
            <th>Năm sinh</th>
            <th>Giới tính</th>
            <th>Role</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((u, index) => (
            <tr key={u.id}>
              <td>{index + 1}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.birthYear}</td>
              <td>{u.gender}</td>
              <td>
                <span className={`role-badge role-${u.role}`}>
                    {u.role}
                </span>
             </td>

              <td>{u.createdAt}</td>

              <td>
                <div className="admin-actions">

                  {/* XEM */}
                  <button
                    className="admin-btn view"
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `http://localhost:3000/admin/users/${u.id}`
                        );
                        const detail = await res.json();

                        setSelectedUser({
                            id: detail.id,
                            username: detail.username,
                            email: detail.email,
                            gender: detail.gender,
                            birth_year: detail.birth_year,
                            created_at: detail.created_at,
                            role: detail.role,
                        });


                        setShowView(true);
                      } catch (err) {
                        console.error("Failed to load user detail:", err);
                      }
                    }}
                  >
                    Xem
                  </button>

                  {/* MỞ KHÓA */}
                  <button
                    className="admin-btn restore"
                    onClick={() => {
                      setSelectedUser(u);
                      setShowUnlock(true);
                    }}
                  >
                    Mở khóa
                  </button>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* POPUP VIEW */}
      {showView && selectedUser && (
        <PopupViewUser
          user={selectedUser}
          onClose={() => setShowView(false)}
        />
      )}

      {/* POPUP RESTORE */}
      {showUnlock && selectedUser && (
        <PopupDeleteConfirm
            title="Mở khóa tài khoản"
            message={`Bạn có chắc muốn khôi phục tài khoản "${selectedUser.name}"?`}
            confirmText="Mở khóa"    // <-- THÊM DÒNG NÀY
            onCancel={() => setShowUnlock(false)}
            onConfirm={async () => {
            try {
                const res = await fetch(
                `http://localhost:3000/admin/users/${selectedUser.id}/unlock`,
                { method: "PATCH" }
                );

                if (!res.ok) throw new Error("Unlock failed");

                setBlockedUsers((prev) =>
                prev.filter((u) => u.id !== selectedUser.id)
                );

                setShowUnlock(false);
                setSuccessMessage("Khôi phục tài khoản thành công!");
                setShowSuccess(true);
            } catch (err) {
                console.error(err);
                alert("Lỗi khi mở khóa tài khoản!");
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

export default AdminBlockAccount;
