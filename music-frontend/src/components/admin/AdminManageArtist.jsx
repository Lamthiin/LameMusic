import React, { useState, useEffect } from "react";
import axios from "axios";

import "./AdminManageArtist.css";

import ArtistPendingList from "./ArtistPendingList.jsx";
import ArtistActiveList from "./ArtistActiveList.jsx";

const AdminManageArtist = () => {
  const [tab, setTab] = useState("pending");
  const [artistsPending, setArtistsPending] = useState([]);
  const [artistsActive, setArtistsActive] = useState([]);

  useEffect(() => {
    loadPending();
    loadActive();
  }, []);

  // ===========================
  // LOAD PENDING (ADMIN)
  // ===========================
  const loadPending = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/artists/pending");

      console.log("PENDING RES:", res.data);

      if (Array.isArray(res.data)) {
        setArtistsPending(res.data);
      } else {
        console.warn("API pending không trả về mảng:", res.data);
        setArtistsPending([]);
      }
    } catch (err) {
      console.error("LOAD PENDING ERROR:", err);
      setArtistsPending([]);
    }
  };

  // ===========================
  // LOAD ACTIVE (ADMIN)
  // ===========================
  const loadActive = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/artists/active");

      console.log("ACTIVE RES:", res.data);

      if (Array.isArray(res.data)) {
        setArtistsActive(res.data);
      } else {
        console.warn("API active không trả về mảng:", res.data);
        setArtistsActive([]);
      }
    } catch (err) {
      console.error("LOAD ACTIVE ERROR:", err);
      setArtistsActive([]);
    }
  };

  // ===========================
  // APPROVE
  // ===========================
  const approve = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/admin/artists/${id}/approve`);
      loadPending();
      loadActive();
    } catch (err) {
      console.error("APPROVE ERROR:", err);
    }
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
        <ArtistPendingList artists={artistsPending} approve={approve} />
      )}

      {/* TAB ACTIVE */}
      {tab === "active" && (
        <ArtistActiveList artists={artistsActive} refresh={loadActive} />
      )}
    </div>
  );
};

export default AdminManageArtist;
