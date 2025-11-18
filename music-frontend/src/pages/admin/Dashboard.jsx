import React from "react";
import AdminTopChart from "../../components/admin/AdminTopChart";
import AdminTopArtists from "../../components/admin/AdminTopArtists";
import AlbTop10 from "../../components/admin/AlbTop10";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiMic, FiMusic, FiDisc } from "react-icons/fi";
import { MdAlbum } from "react-icons/md";





const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div>

      <h1 className="admin-title">Overview Dashboard</h1>
      <p className="admin-subtitle">Chào mừng bạn đến bảng điều khiển của Lame Music.</p>

      <div className="admin-dashboard-grid">
        
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-icon">
            <FiUsers />
          </div>

          <h2 className="admin-dashboard-title">Quản lý Người dùng</h2>

          <p><strong>Tổng số:</strong> 120 người dùng</p>
          <p><strong>Quản trị viên:</strong> 3</p>
          <p><strong>Hôm nay:</strong> 5 người dùng mới</p>

          <button onClick={() => navigate("/admin/users")}>Đi đến</button>
        </div>


        <div className="admin-dashboard-card">
          <div className="admin-dashboard-icon">
            <FiMic />
          </div>

          <h2 className="admin-dashboard-title">Quản lý Nghệ sĩ</h2>

          <p><strong>Tổng số:</strong> 35 nghệ sĩ</p>
          <p><strong>Hôm nay:</strong> 5 nghệ sĩ mới</p>
          <p><strong>Pending:</strong> 2 nghệ sĩ</p>

          <button onClick={() => navigate("/admin/artists")}>Đi đến</button>
        </div>


        <div className="admin-dashboard-card">
          <div className="admin-dashboard-icon">
            <FiMusic />
          </div>

          <h2 className="admin-dashboard-title">Quản lý Bài hát</h2>

          <p><strong>Tổng số:</strong> 540 bài hát</p>
          <p><strong>Hôm nay:</strong> 12 bài hát mới</p>
          <p><strong>Pending:</strong> 5 bài hát</p>

          <button onClick={() => navigate("/admin/songs")}>Đi đến</button>
        </div>


        <div className="admin-dashboard-card">
          <div className="admin-dashboard-icon">
            <MdAlbum />
          </div>

          <h2 className="admin-dashboard-title">Quản lý Album</h2>

          <p><strong>Tổng số:</strong> 80 album</p>
          <p><strong>Hôm nay:</strong> 1 album mới</p>
          <p><strong>Pending:</strong> 2 album</p>
          <button onClick={() => navigate("/admin/albums")}>Đi đến</button>
        </div>

      </div>

      <AdminTopArtists />
      <AdminTopChart />
      <AlbTop10 />

    </div>
  );
};

export default Dashboard;
