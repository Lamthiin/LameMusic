import React, { useEffect, useState } from "react";
import AdminTopChart from "../../components/admin/AdminTopChart";
import AdminTopArtists from "../../components/admin/AdminTopArtists";
import AlbTop10 from "../../components/admin/AlbTop10";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiMic, FiMusic } from "react-icons/fi";
import { MdAlbum } from "react-icons/md";

const Dashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/admin/dashboard/overview");
        const data = await res.json();
        setOverview(data);
      } catch (err) {
        console.error("Lỗi tải dashboard:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="admin-title">Overview Dashboard</h1>
      <p className="admin-subtitle">Chào mừng bạn đến bảng điều khiển của Lame Music.</p>

      <div className="admin-dashboard-grid">

        {/* USERS */}
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-icon"><FiUsers /></div>
          <h2 className="admin-dashboard-title">Quản lý Người dùng</h2>

          <p><strong>Tổng số:</strong> {overview?.users.total ?? "..."} người dùng</p>

          <button onClick={() => navigate("/admin/users")}>Đi đến</button>
        </div>

        {/* ARTISTS */}
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-icon"><FiMic /></div>
          <h2 className="admin-dashboard-title">Quản lý Nghệ sĩ</h2>

          <p><strong>Tổng số:</strong> {overview?.artists.total ?? "..."} nghệ sĩ</p>

          <button onClick={() => navigate("/admin/artists")}>Đi đến</button>
        </div>

        {/* SONGS */}
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-icon"><FiMusic /></div>
          <h2 className="admin-dashboard-title">Quản lý Bài hát</h2>

          <p><strong>Tổng số:</strong> {overview?.songs.total ?? "..."} bài hát</p>

          <button onClick={() => navigate("/admin/songs")}>Đi đến</button>
        </div>

        {/* ALBUMS */}
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-icon"><MdAlbum /></div>
          <h2 className="admin-dashboard-title">Quản lý Album</h2>

          <p><strong>Tổng số:</strong> {overview?.albums.total ?? "..."} album</p>

          <button onClick={() => navigate("/admin/albums")}>Đi đến</button>
        </div>

      </div>

      <AdminTopArtists />
      <AdminTopChart />
      {/* <AlbTop10 /> */}
    </div>
  );
};

export default Dashboard;
