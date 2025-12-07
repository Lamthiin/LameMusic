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

  // ⭐ PHÂN TRANG
  const [pageAll, setPageAll] = useState(1);
  const [pageHidden, setPageHidden] = useState(1);
  const itemsPerPage = 10;

  const totalPagesAll = Math.ceil(albumsAll.length / itemsPerPage) || 1;
  const totalPagesHidden = Math.ceil(albumsHidden.length / itemsPerPage) || 1;

  const showingAlbumsAll = albumsAll.slice(
    (pageAll - 1) * itemsPerPage,
    (pageAll - 1) * itemsPerPage + itemsPerPage
  );

  const showingAlbumsHidden = albumsHidden.slice(
    (pageHidden - 1) * itemsPerPage,
    (pageHidden - 1) * itemsPerPage + itemsPerPage
  );

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "—"; // tránh lỗi
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

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
  const openCreate = () => setShowCreate(true);
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
    if (!window.confirm("Bạn chắc chắn muốn xóa album này (chuyển vào thùng rác)?")) return;
    try {
      const res = await axios.patch(`http://localhost:3000/admin/albums/${id}/soft-delete`);
      alert(res.data.message);
      loadAlbums();
      loadHiddenAlbums();
    } catch (err) {
      console.error("SOFT DELETE ALBUM ERROR:", err.response?.data || err);
      alert(`Lỗi xóa Album: ${err.response?.data?.message || "Không rõ lỗi"}`);
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
          <>
            <AlbumList
              albums={showingAlbumsAll}
              onView={openView}
              onEdit={openEdit}
              onDelete={handleDelete}
            />

            <div className="mini-pagination">
              <button
                disabled={pageAll === 1}
                onClick={() => setPageAll((p) => p - 1)}
              >
                ←
              </button>

              <span>
                Trang {pageAll} / {totalPagesAll}
              </span>

              <button
                disabled={pageAll === totalPagesAll}
                onClick={() => setPageAll((p) => p + 1)}
              >
                →
              </button>
            </div>
          </>
        )}

        {tab === "hidden" && (
          <>
            <AlbumHiddenList
              albums={showingAlbumsHidden}
              onView={openView}
              onRestore={async (id) => {
                if (!window.confirm("Bạn chắc chắn muốn khôi phục album này?")) return;
                try {
                  const res = await axios.patch(`http://localhost:3000/admin/albums/${id}/restore`);
                  alert(res.data.message);
                  loadAlbums();
                  loadHiddenAlbums();
                } catch (err) {
                  console.error("RESTORE ALBUM ERROR:", err.response?.data || err);
                  alert(`Lỗi khôi phục Album: ${err.response?.data?.message || "Không rõ lỗi"}`);
                }
              }}
            />

            <div className="mini-pagination">
              <button
                disabled={pageHidden === 1}
                onClick={() => setPageHidden((p) => p - 1)}
              >
                ←
              </button>

              <span>
                Trang {pageHidden} / {totalPagesHidden}
              </span>

              <button
                disabled={pageHidden === totalPagesHidden}
                onClick={() => setPageHidden((p) => p + 1)}
              >
                →
              </button>
            </div>
          </>
        )}
      </div>

      {/* MODALS */}
      {showCreate && (
        <AlbumCreateModal
          show={showCreate}
          onClose={() => setShowCreate(false)}
          onSubmit={async (data) => {
            try {
              const formData = new FormData();
              formData.append("name", data.name);
              formData.append("release_date", data.release_date);
              formData.append("artist_id", data.artist_id);
              formData.append("info", data.info);
              if (data.cover) formData.append("cover", data.cover);

              const res = await axios.post(
                "http://localhost:3000/admin/albums",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );
              alert(res.data.message);
              setShowCreate(false);
              loadAlbums();
            } catch (err) {
              console.error("CREATE ALBUM ERROR:", err.response?.data || err);
              alert(`Lỗi tạo Album: ${err.response?.data?.message || "Không rõ lỗi"}`);
            }
          }}
        />
      )}

      {showEdit && (
        <AlbumEditModal
          show={showEdit}
          onClose={() => setShowEdit(false)}
          initialData={editingAlbum}
          onSubmit={async (data) => {
            try {
              const formData = new FormData();
              formData.append("name", data.name);
              formData.append("release_date", data.release_date);
              formData.append("artist_id", data.artist_id);
              formData.append("info", data.info);
              if (data.coverFile) formData.append("cover", data.coverFile);

              const res = await axios.patch(
                `http://localhost:3000/admin/albums/${editingAlbum.id}`,
                formData
              );
              alert(res.data.message);
              setShowEdit(false);
              loadAlbums();
            } catch (err) {
              console.error("EDIT ALBUM ERROR:", err.response?.data || err);
              alert(`Lỗi cập nhật Album: ${err.response?.data?.message || "Không rõ lỗi"}`);
            }
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
