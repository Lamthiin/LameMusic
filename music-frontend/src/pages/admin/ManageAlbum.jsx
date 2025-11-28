import React, { useState } from "react";

import "./ManageAlbum.css";

import AlbumList from "../../components/admin/AlbumList";
import AlbumFormModal from "../../components/admin/AlbumFormModal";
import AlbumAddSongModal from "../../components/admin/AlbumAddSongModal";
import AlbumViewModal from "../../components/admin/AlbumViewModal";

export default function ManageAlbum() {
  const [tab, setTab] = useState("all");

  const [albumsAll, setAlbumsAll] = useState([
    {
      id: 1,
      name: "Sky Tour",
      cover_url: "https://i.imgur.com/0ZfFQGh.jpeg",
      artist: { id: 10, name: "Sơn Tùng M-TP" },
      songs: 12,
      release_date: "2022-11-20",
      songs_list: [
        { id: 1, title: "Intro" },
        { id: 2, title: "Lạc trôi Live" }
      ]
    },
    {
      id: 2,
      name: "DreAmee",
      cover_url: "https://i.imgur.com/xJpUZKz.jpeg",
      artist: { id: 11, name: "AMEE" },
      songs: 8,
      release_date: "2020-05-10",
      songs_list: []
    }
  ]);

  const [albumsHidden] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);

  const [showAddSong, setShowAddSong] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);

  const [showView, setShowView] = useState(false);
  const [viewAlbum, setViewAlbum] = useState(null);

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

  const handleDelete = (id) => {
    if (!window.confirm("Xóa album này?")) return;
    setAlbumsAll(albumsAll.filter((a) => a.id !== id));
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
          onClose={() => setShowForm(false)}
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
