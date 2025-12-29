import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

import "./ManageArtist.css";
import ArtistPendingList from "../../components/admin/ArtistPendingList";
import ArtistActiveList from "../../components/admin/ArtistActiveList";
import ArtistRejectedList from "../../components/admin/ArtistRejectedList";
import ArtistBot from "../../components/admin/ArtistBot";
import ArtistRemovedList from "../../components/admin/ArtistRemoved";

export default function ManageArtist() {
  const location = useLocation();
  const startTab = location.state?.tab || "pending";
  const [tab, setTab] = useState(startTab);

  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
  }, [location.state]);

  const [artistsPending, setArtistsPending] = useState([]);
  const [artistsActive, setArtistsActive] = useState([]);
  const [artistsRejected, setArtistsRejected] = useState([]);
  const [artistsRemoved, setArtistsRemoved] = useState([]);

  // ⭐ SEARCH
  const [search, setSearch] = useState("");

  /* LOAD DATA */
  useEffect(() => {
    loadPending();
    loadActive();
    loadRejected();
    loadRemoved();
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

  const loadRemoved = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/artists/removed");
      setArtistsRemoved(Array.isArray(res.data) ? res.data : []);
    } catch {
      setArtistsRemoved([]);
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

  // ⭐ PAGINATION FOR ACTIVE TAB
  const [pageActive, setPageActive] = useState(1);
  const itemsPerPage = 10;

  // ⭐ FILTER THEO SEARCH
  const filteredPending = artistsPending.filter((a) =>
    (a?.stage_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredActive = artistsActive.filter((a) =>
    (a?.stage_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredRejected = artistsRejected.filter((a) =>
    (a?.stage_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredRemoved = artistsRemoved.filter((a) =>
    (a?.stage_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // ⭐ CHỈ ACTIVE MỚI PHÂN TRANG
  const totalPagesActive =
    Math.ceil(filteredActive.length / itemsPerPage) || 1;
  const startIdxActive = (pageActive - 1) * itemsPerPage;
  const showingActive = filteredActive.slice(
    startIdxActive,
    startIdxActive + itemsPerPage
  );

  return (
    <div className="album-management">
      <h2 className="am-title">Quản lý Nghệ sĩ</h2>

      {/* 🔥 TAB */}
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

        <div
          className={`am-card ${tab === "removed" ? "active" : ""}`}
          onClick={() => setTab("removed")}
        >
          <h3>Đã xoá</h3>
          <p>Nghệ sĩ đã bị xoá</p>
        </div>
      </div>

      {/* 🔍 SEARCH BAR */}
      <div className="am-search-row">
        <div className="am-search-box">
          <span className="am-search-icon">🔍</span>
          <input
            className="am-search-input"
            placeholder="Tìm nghệ sĩ theo tên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageActive(1);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="am-table-area">
        {tab === "pending" && (
          <>
            <ArtistPendingList
              artists={filteredPending}
              approve={approve}
              reject={reject}
            />
            {/* Bạn đang dùng chung mini-pagination cho pending, 
                mình giữ nguyên, dù về logic chỉ active mới phân trang */}
            <div className="mini-pagination">
              <button
                disabled={pageActive === 1}
                onClick={() => setPageActive(pageActive - 1)}
              >
                ←
              </button>

              <span>
                Trang {pageActive} / {totalPagesActive || 1}
              </span>

              <button
                disabled={
                  pageActive === totalPagesActive || totalPagesActive === 0
                }
                onClick={() => setPageActive(pageActive + 1)}
              >
                →
              </button>
            </div>
          </>
        )}

        {tab === "active" && (
          <>
            <ArtistActiveList artists={showingActive} refresh={loadActive} />

            <div className="mini-pagination">
              <button
                disabled={pageActive === 1}
                onClick={() => setPageActive(pageActive - 1)}
              >
                ←
              </button>

              <span>
                Trang {pageActive} / {totalPagesActive || 1}
              </span>

              <button
                disabled={
                  pageActive === totalPagesActive || totalPagesActive === 0
                }
                onClick={() => setPageActive(pageActive + 1)}
              >
                →
              </button>
            </div>
          </>
        )}

        {tab === "internal" && (
  <>
    <ArtistBot search={search} />

            <div className="mini-pagination">
              <button
                disabled={pageActive === 1}
                onClick={() => setPageActive(pageActive - 1)}
              >
                ←
              </button>

              <span>
                Trang {pageActive} / {totalPagesActive || 1}
              </span>

              <button
                disabled={
                  pageActive === totalPagesActive || totalPagesActive === 0
                }
                onClick={() => setPageActive(pageActive + 1)}
              >
                →
              </button>
            </div>
          </>
        )}

        {tab === "rejected" && (
          <>
            <ArtistRejectedList
              artists={filteredRejected}
              refresh={loadRejected}
            />
            <div className="mini-pagination">
              <button
                disabled={pageActive === 1}
                onClick={() => setPageActive(pageActive - 1)}
              >
                ←
              </button>

              <span>
                Trang {pageActive} / {totalPagesActive || 1}
              </span>

              <button
                disabled={
                  pageActive === totalPagesActive || totalPagesActive === 0
                }
                onClick={() => setPageActive(pageActive + 1)}
              >
                →
              </button>
            </div>
          </>
        )}

        {tab === "removed" && (
          <>
            <ArtistRemovedList
              artists={filteredRemoved}
              refresh={loadRemoved}
            />
            <div className="mini-pagination">
              <button
                disabled={pageActive === 1}
                onClick={() => setPageActive(pageActive - 1)}
              >
                ←
              </button>

              <span>
                Trang {pageActive} / {totalPagesActive || 1}
              </span>

              <button
                disabled={
                  pageActive === totalPagesActive || totalPagesActive === 0
                }
                onClick={() => setPageActive(pageActive + 1)}
              >
                →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
