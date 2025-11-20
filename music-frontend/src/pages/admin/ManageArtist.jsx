import React from "react";
import "./ManageArtist.css";

// Component con xử lý UI logic
import AdminManageArtist from "../../components/admin/AdminManageArtist";

export default function ManageArtist() {
  return (
    <div className="artist-page">
      <AdminManageArtist />
    </div>
  );
}
