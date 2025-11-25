// music-frontend/src/pages/AdminPage/AdminManageAlbum.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

import "./AdminManageAlbum.css";

import AlbumList from "../../components/admin/AlbumList.jsx";
import AlbumModal from "../../components/admin/AlbumModal.jsx";

// ===========================
// MOCK DATA CHO FE
// ===========================
const MOCK_ARTISTS = [
  {
    id: 1,
    stage_name: "Sơn Tùng M-TP",
    avatar_url: "https://i.imgur.com/0ZfFQGh.jpeg",
  },
  {
    id: 2,
    stage_name: "AMEE",
    avatar_url: "https://i.imgur.com/xJpUZKz.jpeg",
  },
  {
    id: 3,
    stage_name: "Đen Vâu",
    avatar_url: "https://i.imgur.com/CXQHGxB.jpeg",
  },
];

const MOCK_ALBUMS = [
  {
    id: 101,
    name: "Sky Tour",
    coverUrl: "https://i.imgur.com/Qn0M1Ue.jpeg",
    artist: MOCK_ARTISTS[0],
  },
  {
    id: 102,
    name: "dreAMEE",
    coverUrl: "https://i.imgur.com/HhF6bC5.jpeg",
    artist: MOCK_ARTISTS[1],
  },
  {
    id: 103,
    name: "Lộn Xộn 3",
    coverUrl: "https://i.imgur.com/Mg5y8qK.jpeg",
    artist: MOCK_ARTISTS[2],
  },
];

export default function AdminManageAlbum() {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);

  // ===========================
  // LOAD MOCKData
  // ===========================
  useEffect(() => {
    setArtists(MOCK_ARTISTS);
    setAlbums(MOCK_ALBUMS);
  }, []);

  // ===========================
  // CRUD
  // ===========================
  const openAdd = () => {
    setEditingAlbum(null);
    setShowModal(true);
  };

  const openEdit = (album) => {
    setEditingAlbum(album);
    setShowModal(true);
  };

  const deleteAlbum = (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa album này?")) return;
    setAlbums((prev) => prev.filter((a) => a.id !== id));
  };

  const openAddSong = (album) => {
    alert(`TODO: mở modal thêm bài hát cho album: ${album.name}`);
  };

  return (
    <div className="admin-album-container">
      <h1 className="page-title">Quản lý Album</h1>

    <div className="top-bar">
    <h2 className="topbar-title">Danh sách nghệ sĩ chờ duyệt</h2>

    <button className="btn-add" onClick={openAdd}>
        + Thêm Album
    </button>
    </div>


      {albums.length === 0 ? (
        <div className="empty-album">Chưa có album nào</div>
      ) : (
        <AlbumList
          albums={albums}
          openEdit={openEdit}
          deleteAlbum={deleteAlbum}
          openAddSong={openAddSong}
        />
      )}

      {showModal && (
        <AlbumModal
          album={editingAlbum}
          artists={artists}
          close={() => setShowModal(false)}
          reload={() => {}} // FE only
        />
      )}
    </div>
  );
}
