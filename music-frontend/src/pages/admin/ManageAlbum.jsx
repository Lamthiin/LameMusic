import React, { useEffect, useState } from "react";
import axios from "axios";

import "./ManageAlbum.css";

import AlbumList from "../../components/admin/AlbumList";
import AlbumFormModal from "../../components/admin/AlbumFormModal";
import AlbumAddSongModal from "../../components/admin/AlbumAddSongModal";
import AlbumViewModal from "../../components/admin/AlbumViewModal";

export default function ManageAlbum() {
  const [tab, setTab] = useState("all");

  // Dữ liệu album từ BE
  const [albumsAll, setAlbumsAll] = useState([]);
  const [albumsHidden, setAlbumsHidden] = useState([]);

  // Modal
  const [showForm, setShowForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);

  const [showAddSong, setShowAddSong] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);

  const [showView, setShowView] = useState(false);
  const [viewAlbum, setViewAlbum] = useState(null);

  // ==========================================================
  // FETCH ALL ALBUM
  // ==========================================================
  const loadAlbums = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/albums");
      setAlbumsAll(res.data);
    } catch (err) {
      console.error("LOAD ALBUM ERROR:", err);
    }
  };

  // FETCH HIDDEN ALBUM
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

  // ==========================================================
  const openCreate = () => {
    setEditingAlbum(null);
    setShowForm(true);
  };

  const openEdit = (album) => {
    setEditingAlbum(album);
    setShowForm(true);
  };

  const openView = (album) => {
    setViewAlbum(album);
    setShowView(true);
  };

  const openAddSong = (albumId) => {
    setSelectedAlbumId(albumId);
    setShowAddSong(true);
  };

  // ==========================================================
  // DELETE ALBUM
  // ==========================================================
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
      <h2 className="am-title">Quản lý Album</h2>

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
          <h3>Bị ẩn</h3>
          <p>Album đã bị ẩn</p>
        </div>
      </div>

      <button className="am-btn-add" onClick={openCreate}>
        + Thêm Album
      </button>

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
          <AlbumList
            albums={albumsHidden}
            onView={openView}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {showForm && (
        <AlbumFormModal
          show={showForm}
          onClose={() => {
            setShowForm(false);
            loadAlbums();
            loadHiddenAlbums();
          }}
          initialData={editingAlbum}
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
        />
      )}
    </div>
  );
}
