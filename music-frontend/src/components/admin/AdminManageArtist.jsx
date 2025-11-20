import React, { useState, useEffect } from "react";
import axios from "axios";

import "./AdminManageArtist.css";

import ArtistPendingList from "./ArtistPendingList.jsx";
import ArtistActiveList from "./ArtistActiveList.jsx";



const AdminManageArtist = () => {
  const [tab, setTab] = useState("pending");
  const [artistsPending, setArtistsPending] = useState([]);
  const [artistsActive, setArtistsActive] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);

  useEffect(() => {
    loadPending();
    loadActive();
  }, []);

  // ===========================
  // LOAD PENDING
  // ===========================
  const loadPending = async () => {
    try {
      const res = await axios.get("/artists/pending");
      setArtistsPending(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("LOAD PENDING ERROR:", err);
    }
  };

  // ===========================
  // LOAD ACTIVE
  // ===========================
  const loadActive = async () => {
    try {
      const res = await axios.get("/artists/all");
      const approved = (res.data || []).filter(
        (a) => a.registrationStatus === "APPROVED"
      );
      setArtistsActive(approved);
    } catch (err) {
      console.error("LOAD ACTIVE ERROR:", err);
    }
  };

  // ===========================
  // APPROVE
  // ===========================
  const approve = async (id) => {
    try {
      await axios.post(`/artists/approve/${id}`);
      await loadPending();
      await loadActive();
    } catch (err) {
      console.error("APPROVE ERROR:", err);
    }
  };

  // Modal mở thêm / sửa
  const openAdd = () => {
    setEditingArtist(null);
    setShowModal(true);
  };

  const openEdit = (artist) => {
    setEditingArtist(artist);
    setShowModal(true);
  };

  return (
    <div className="admin-artist-container">
      <h1 className="page-title">Quản lý nghệ sĩ</h1>

      {/* Tabs */}
      <div className="artist-tabs">
        <button
          className={`artist-tab ${tab === "pending" ? "active" : ""}`}
          onClick={() => setTab("pending")}
        >
          Chờ duyệt
        </button>

        <button
          className={`artist-tab ${tab === "active" ? "active" : ""}`}
          onClick={() => setTab("active")}
        >
          Hoạt động
        </button>
      </div>

      {/* TAB PENDING */}
      {tab === "pending" && (
        <ArtistPendingList
          artists={artistsPending}
          approve={approve}
        />
      )}

      {/* TAB ACTIVE (component riêng) */}
      {tab === "active" && (
        <ArtistActiveList
          artists={artistsActive}
          refresh={loadActive}
          openAdd={openAdd}
          openEdit={openEdit}
        />
      )}

      {/* Modal thêm / sửa */}
      {showModal && (
        <ArtistModal
          artist={editingArtist}
          close={() => setShowModal(false)}
          reload={loadActive}
        />
      )}
    </div>
  );
};

export default AdminManageArtist;
