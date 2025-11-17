import React from "react";

const Dashboard = () => {
  return (
    <div style={{ color: "white" }}>
      <h1>Dashboard</h1>
      <p>Chào mừng bạn đến trang quản trị.</p>

      <div style={{ marginTop: "20px" }}>
        <div style={{
          background: "#1f1f1f",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "12px",
        }}>
          <h3>👤 Tổng số người dùng</h3>
          <p>120</p>
        </div>

        <div style={{
          background: "#1f1f1f",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "12px",
        }}>
          <h3>🎤 Tổng số nghệ sĩ</h3>
          <p>35</p>
        </div>

        <div style={{
          background: "#1f1f1f",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "12px",
        }}>
          <h3>🎵 Tổng số bài hát</h3>
          <p>540</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
