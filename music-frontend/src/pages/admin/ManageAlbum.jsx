import React, { useEffect, useState } from "react";
import axios from "axios";

import "./ManageAlbum.css";

import AlbumList from "../../components/admin/AlbumList";
import AlbumAddSongModal from "../../components/admin/AlbumAddSongModal";
import AlbumViewModal from "../../components/admin/AlbumViewModal";

import AlbumCreateModal from "../../components/admin/AlbumCreateModal";
import AlbumEditModal from "../../components/admin/AlbumEditModal";
import AlbumHiddenList from "../../components/admin/AlbumHiddenList";

export default function ManageAlbum() {
  const [tab, setTab] = useState("all");

  // ====================== STATE ======================
  const [albumsAll, setAlbumsAll] = useState([]);
  const [albumsHidden, setAlbumsHidden] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);

  const [showAddSong, setShowAddSong] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [selectedAlbumName, setSelectedAlbumName] = useState("");

  const [showView, setShowView] = useState(false);
  const [viewAlbum, setViewAlbum] = useState(null);

  // ====================== FETCH DATA ======================
  const loadAlbums = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/albums");
      setAlbumsAll(res.data);
    } catch (err) {
      console.error("LOAD ALBUM ERROR:", err);
    }
  };

  const loadHiddenAlbums = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/albums/hidden");
      setAlbumsHidden(res.data);
    } catch (err) {
      console.error("LOAD HIDDEN ALBUM ERROR:", err);
    }
  };

  useEffect(() => {
    loadAlbums();
    loadHiddenAlbums();
  }, []);

  // ====================== MODAL HANDLERS ======================
  const openCreate = () => {
    setShowCreate(true);
  };

  const openEdit = async (album) => {
    try {
      const res = await axios.get(`http://localhost:3000/admin/albums/${album.id}`);
      setEditingAlbum(res.data);
      setShowEdit(true);
    } catch (err) {
      console.error("LOAD ALBUM DETAIL ERROR:", err);
    }
  };

  const openView = async (album) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/admin/albums/${album.id}/full`
      );
      setViewAlbum(res.data);
      setShowView(true);
    } catch (err) {
      console.error("LOAD FULL ALBUM ERROR:", err);
    }
  };

  const openAddSong = (albumId, albumName) => {
    setSelectedAlbumId(albumId);
    setSelectedAlbumName(albumName);
    setShowAddSong(true);
  };

  // ====================== DELETE ======================
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa album này?")) return;

    try {
      await axios.delete(`http://localhost:3000/admin/albums/${id}`);
      loadAlbums();
      loadHiddenAlbums();
    } catch (err) {
      console.error("DELETE ALBUM ERROR:", err);
    }
  };

  return (
  <div className="album-management">
    
    {/* HEADER */}
    <h2 className="am-title">Quản lý Album</h2>

    {/* TABS */}
    <div className="am-grid">
      <div
        className={`am-card ${tab === "all" ? "active" : ""}`}
        onClick={() => setTab("all")}
      >
        <h3>Tất cả Album</h3>
        <p>Danh sách toàn bộ album</p>
      </div>

      <div
        className={`am-card ${tab === "hidden" ? "active" : ""}`}
        onClick={() => setTab("hidden")}
      >
        <h3>Bị Xóa</h3>
        <p>Album đã bị xóa</p>
      </div>
    </div>

    {/* BUTTON ADD */}
    <button className="am-btn-add" onClick={openCreate}>
      + Thêm Album
    </button>

    {/* MAIN TABLE */}
    <div className="am-table-area">
      {tab === "all" && (
        <AlbumList
          albums={albumsAll}
          onView={openView}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {tab === "hidden" && (
        <AlbumHiddenList
          albums={albumsHidden}
          onView={openView}
          onRestore={async (id) => {
            if (!window.confirm("Bạn chắc chắn muốn khôi phục album này?")) return;
            try {
              await axios.patch(`http://localhost:3000/admin/albums/${id}/restore`);
              loadAlbums();
              loadHiddenAlbums();
            } catch (err) {
              console.error("RESTORE ALBUM ERROR:", err);
            }
          }}
        />
      )}
    </div>

    {/* ⬇⬇⬇ TẤT CẢ MODAL PHẢI ĐỂ DƯỚI CÙNG — ngoài UI chính */}
    {showCreate && (
      <AlbumCreateModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (data) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("release_date", data.release_date);
  formData.append("artist_id", data.artist_id);
  formData.append("info", data.info);

  if (data.cover) {               // ⭐ cần cái này
    formData.append("cover", data.cover);
  }

  await axios.patch(
    `http://localhost:3000/admin/albums/${editingAlbum.id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" }
    }
  );

  setShowEdit(false);
  loadAlbums();
}}

      />
    )}

    {showEdit && (
      <AlbumEditModal
  show={showEdit}
  onClose={() => setShowEdit(false)}
  initialData={editingAlbum}
  onSubmit={async (data) => {

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("release_date", data.release_date);
    formData.append("artist_id", data.artist_id);
    formData.append("info", data.info);

    // Nếu có file ảnh mới → thêm vào formData
    if (data.coverFile) {
      formData.append("cover", data.coverFile);
    }

    await axios.patch(
      `http://localhost:3000/admin/albums/${editingAlbum.id}`,
      formData
    );

    setShowEdit(false);
    loadAlbums();
  }}
/>

    )}


    {showView && (
      <AlbumViewModal
        album={viewAlbum}
        isOpen={showView}
        onClose={() => setShowView(false)}
        onAddSong={openAddSong}
      />
    )}

    {showAddSong && (
      <AlbumAddSongModal
        show={showAddSong}
        onClose={() => setShowAddSong(false)}
        albumId={selectedAlbumId}
        albumName={selectedAlbumName}
      />
    )}
  </div>
);
}