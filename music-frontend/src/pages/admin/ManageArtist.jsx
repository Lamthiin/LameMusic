import React, { useState, useEffect } from "react";
import axios from "axios";

import "./ManageArtist.css";

import ArtistPendingList from "../../components/admin/ArtistPendingList";
import ArtistActiveList from "../../components/admin/ArtistActiveList";
import ArtistRejectedList from "../../components/admin/ArtistRejectedList";

export default function ManageArtist() {
  const [tab, setTab] = useState("pending");

  const [artistsPending, setArtistsPending] = useState([]);
  const [artistsActive, setArtistsActive] = useState([]);
  const [artistsRejected, setArtistsRejected] = useState([]);

  useEffect(() => {
    loadPending();
    loadActive();
    loadRejected();
  }, []);

  const loadPending = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/artists/pending");
      setArtistsPending(Array.isArray(res.data) ? res.data : []);
    } catch {
      setArtistsPending([]);
    }
  };

  const loadActive = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/artists/active");
      setArtistsActive(Array.isArray(res.data) ? res.data : []);
    } catch {
      setArtistsActive([]);
    }
  };

  const loadRejected = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/artists/rejected");
      setArtistsRejected(Array.isArray(res.data) ? res.data : []);
    } catch {
      setArtistsRejected([]);
    }
  };

  const approve = async (id) => {
    await axios.patch(`http://localhost:3000/admin/artists/${id}/approve`);
    loadPending();
    loadActive();
    loadRejected();
  };

  const reject = async (id) => {
    if (!window.confirm("Bạn có chắc muốn từ chối nghệ sĩ này?")) return;
    await axios.patch(`http://localhost:3000/admin/artists/${id}/reject`);
    loadPending();
    loadActive();
    loadRejected();
  };

  return (
    <div className="artist-page">
      <h1 className="page-title">Quản lý nghệ sĩ</h1>

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

        <button
          className={`artist-tab ${tab === "rejected" ? "active" : ""}`}
          onClick={() => setTab("rejected")}
        >
          Bị từ chối
        </button>
      </div>

      {tab === "pending" && (
        <ArtistPendingList artists={artistsPending} approve={approve} reject={reject} />
      )}

      {tab === "active" && (
        <ArtistActiveList artists={artistsActive} refresh={loadActive} />
      )}

      {tab === "rejected" && (
        <ArtistRejectedList artists={artistsRejected} refresh={loadRejected} />
      )}
    </div>
  );
}
