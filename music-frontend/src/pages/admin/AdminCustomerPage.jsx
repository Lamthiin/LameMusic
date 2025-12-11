import React, { useState, useEffect } from "react";
import "./AdminManagerUser.css";
import { FiSearch } from "react-icons/fi";

import PopupAddUser from "../../components/admin/PopupAddUser";
import PopupEditUser from "../../components/admin/PopupEditUser";
import PopupViewUser from "../../components/admin/PopupViewUser";
import PopupRoleUser from "../../components/admin/PopupRoleUser";
import PopupSuccess from "../../components/admin/PopupSuccess";
import PopupDeleteConfirm from "../../components/admin/PopupDeleteConfirm";


const AdminCustomerPage = () => {
  const [users, setUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:3000/admin/users/customers");
      const data = await res.json();
      
      console.log("DATA FROM API:", data);


      const mapped = data.map((u) => ({
        id: u.id,
        name: u.username ?? "",
        email: u.email ?? "",
        birthYear: u.birth_year,
        gender: u.gender,
        createdAt: u.created_at?.split("T")[0],
        role:
          u.role_id === 3
            ? "artist"
            : u.role_id === 2
            ? "listener"
            : "admin",
      }));

      setAllUsers(mapped);
      setUsers(mapped);

      setTotalPages(Math.ceil(mapped.length / itemsPerPage)); // ← thêm dòng này
      setCurrentPage(1);

    } catch (err) {
      console.error("Fetch users failed:", err);
    }
  };


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [totalPages, setTotalPages] = useState(1);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const filteredUsers = users.filter((u) => {
    const name = u.name.toLowerCase();
    const email = u.email.toLowerCase();
    const keyword = searchValue.toLowerCase();

    return (u.role === "artist" || u.role === "listener") 
      && (name + email).includes(keyword);
  });

  const handleSearch = (value) => {
    setSearchValue(value);

    const keyword = value.toLowerCase();

    const filtered = allUsers.filter((u) => {
      const name = u.name.toLowerCase();
      const email = u.email.toLowerCase();
      return (name + email).includes(keyword);
    });

    setUsers(filtered);

    // cập nhật phân trang
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);

  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
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
            autoComplete="off"
            name="search-user"     // <--- thêm dòng này
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
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
          {paginatedUsers.map((u, index) => (
            <tr key={u.id}>
              <td>{(currentPage - 1) * itemsPerPage + (index + 1)}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.birthYear}</td>
              <td>{u.gender}</td>
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
                    onClick={async () => {
                      try {
                        const res = await fetch(`http://localhost:3000/admin/users/${u.id}`);
                        const detail = await res.json();

                        setSelectedUser(detail);   // <-- popup Xem sẽ nhận đủ dữ liệu backend trả về
                        setShowView(true);
                      } catch (err) {
                        console.error("Fetch user detail failed:", err);
                      }
                    }}
                  >
                    Xem
                  </button>

                  <button
                    className="admin-btn edit"
                    onClick={async () => {
                      try {
                        const res = await fetch(`http://localhost:3000/admin/users/${u.id}`);
                        const detail = await res.json();

                        // Map dữ liệu trả về để truyền vào PopupEditUser
                        setSelectedUser({
                          id: detail.id,
                          name: detail.username,
                          email: detail.email,
                          birthYear: detail.birth_year,
                          gender: detail.gender,
                          createdAt: detail.created_at?.split("T")[0],
                          role: detail.role?.name ?? "",
                        });

                        setShowEdit(true);
                      } catch (err) {
                        console.error("Error loading user detail:", err);
                      }
                    }}
                  >
                    Sửa
                  </button>


                  {u.role === "listener" && (
                    <button className="admin-btn role" onClick={() => { setSelectedUser(u); setShowRole(true); }}>Role</button>
                  )}
                  <button className="admin-btn delete" onClick={() => { setSelectedUser(u); setShowDelete(true); }}>Khoá</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

      <div className="user-mini-pagination">
        <button
          className="user-mini-page-btn"
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
        >
          ←
        </button>

        <span className="user-mini-page-text">
          Trang {currentPage} / {totalPages}
        </span>

        <button
          className="user-mini-page-btn"
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage === totalPages}
        >
          →
        </button>

      </div>


      {/* POPUPS */}
      {showAdd && (
      <PopupAddUser
        onClose={() => {
          setShowAdd(false);
          setSearchValue("");         
          setUsers(allUsers);         
        }}

        onSubmit={async () => {
          await fetchCustomers(); // load lại toàn bộ danh sách từ backend

          setShowAdd(false);
          setSuccessMessage("Thêm người dùng thành công!");
          setShowSuccess(true);
        }}


      />
    )}

      {showView && (
        <PopupViewUser
          user={selectedUser}
          onClose={() => setShowView(false)}
        />
      )}

      {showEdit && (
        <PopupEditUser
          user={selectedUser}
          onClose={() => setShowEdit(false)}
          onSubmit={async (updated) => {
          try {
            const payload = {
              username: updated.name,
              email: updated.email,
              birth_year: Number(updated.birthYear),
              gender: updated.gender,
              password: updated.password || undefined
            };

            const res = await fetch(
              `http://localhost:3000/admin/users/${selectedUser.id}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );

            const result = await res.json();

            if (!res.ok) {
              alert(result.message || "Lỗi cập nhật!");
              return;
            }

            await fetchCustomers();   

            setShowEdit(false);
            setSuccessMessage("Cập nhật thành công!");
            setShowSuccess(true);

          } catch (err) {
            console.error(err);
            alert("Không thể cập nhật!");
          }
        }}
        />
      )}

      {showRole && (
      <PopupRoleUser
        user={selectedUser}
        onClose={() => setShowRole(false)}
        onSubmit={async () => {
          try {
            const res = await fetch(
              `http://localhost:3000/admin/users/${selectedUser.id}/promote`,
              { method: "PATCH" }
            );

            const result = await res.json();

            // Nếu backend báo lỗi
            if (!res.ok) {
              alert(result.message || "Lỗi nâng quyền!");
              return;
            }

            // Update FE
            setUsers(
              users.map((u) =>
                u.id === selectedUser.id ? { ...u, role: "admin" } : u
              )
            );

            setShowRole(false);
            setSuccessMessage("Nâng quyền thành công!");
            setShowSuccess(true);

          } catch (err) {
            console.error("Promote failed:", err);
            alert("Không thể nâng quyền người dùng!");
          }
        }}
      />
    )}


      {showDelete && (
      <PopupDeleteConfirm
        title="Khoá Người Dùng"
        message={`Bạn có chắc muốn khoá người dùng "${selectedUser.name}"?`}
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {

          try {
            const res = await fetch(
              `http://localhost:3000/admin/users/${selectedUser.id}/soft-delete`,
              { method: "PATCH" }
            );

            const result = await res.json();

            if (!res.ok) {
              alert(result.message || "Không thể khoá người dùng!");
              return;
            }

            // Khoá khỏi FE state
            setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
            setAllUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));

            setShowDelete(false);
            setSuccessMessage("khoá người dùng thành công!");
            setShowSuccess(true);

          } catch (err) {
            console.error("Block failed:", err);
            alert("Lỗi khi khoá người dùng!");
          }

        }}
      />
    )}


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
