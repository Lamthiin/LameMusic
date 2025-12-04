import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

import "./ManageArtist.css";
import ArtistPendingList from "../../components/admin/ArtistPendingList";
import ArtistActiveList from "../../components/admin/ArtistActiveList";
import ArtistRejectedList from "../../components/admin/ArtistRejectedList";
import ArtistBot from "../../components/admin/ArtistBot";


export default function ManageArtist() {
  const location = useLocation();  
  const startTab = location.state?.tab || "pending";
  const [tab, setTab] = useState(startTab);

  useEffect(() => {                 // ⭐ THÊM BLOCK NÀY
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
  }, [location.state])

  const [artistsPending, setArtistsPending] = useState([]);
  const [artistsActive, setArtistsActive] = useState([]);
  const [artistsRejected, setArtistsRejected] = useState([]);

  /* LOAD DATA */
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
    <div className="album-management">{/* DÙNG LẠI CLASS CỦA ALBUM */}
      <h2 className="am-title">Quản lý Nghệ sĩ</h2>

      {/* 🔥 TAB – GIỐNG Y HỆT ALBUM */}
      <div className="am-grid">

        <div
          className={`am-card ${tab === "pending" ? "active" : ""}`}
          onClick={() => setTab("pending")}
        >
          <h3>Chờ duyệt</h3>
          <p>Nghệ sĩ mới đăng ký</p>
        </div>

        <div
          className={`am-card ${tab === "active" ? "active" : ""}`}
          onClick={() => setTab("active")}
        >
          <h3>Hoạt động</h3>
          <p>Đang hiển thị công khai</p>
        </div>

        <div
          className={`am-card ${tab === "internal" ? "active" : ""}`}
          onClick={() => setTab("internal")}
        >
          <h3>Nghệ sĩ trực thuộc Lame Music</h3>
          <p>Không thông qua tài khoản User</p>
        </div>

        <div
          className={`am-card ${tab === "rejected" ? "active" : ""}`}
          onClick={() => setTab("rejected")}
        >
          <h3>Bị từ chối</h3>
          <p>Hồ sơ không hợp lệ</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="am-table-area">
        {tab === "pending" && (
          <ArtistPendingList
            artists={artistsPending}
            approve={approve}
            reject={reject}
          />
        )}

        {tab === "active" && (
          <ArtistActiveList
            artists={artistsActive}
            refresh={loadActive}
          />
        )}

        {tab === "internal" && (
          <ArtistBot />
        )}

        {tab === "rejected" && (
          <ArtistRejectedList
            artists={artistsRejected}
            refresh={loadRejected}
          />
        )}




      </div>
    </div>
  );
}
