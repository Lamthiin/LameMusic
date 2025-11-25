import React from "react";
import "./ManageArtist.css"; // nếu cần CSS chung cho trang

// Component cha xử lý toàn bộ logic quản lý Album
import AdminManageAlbum from "../../components/admin/AdminManageAlbum";

export default function ManageAlbum() {
  return (
    <div className="album-page">
      <AdminManageAlbum />
    </div>
  );
}
