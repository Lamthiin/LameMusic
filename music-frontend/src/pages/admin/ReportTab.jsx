import React, { useEffect, useState } from "react";
import "./ReportTab.css";

const STATUS_LIST = ["PENDING", "RESOLVED", "REJECTED"];

export default function ReportTab() {
  const [reports, setReports] = useState([]);
  const [activeFilter, setActiveFilter] = useState("PENDING");
  const [selectedReport, setSelectedReport] = useState(null);

  // ===============================
  // 🚀 FETCH REPORTS
  // ===============================
  const fetchReports = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/admin/report?status=${activeFilter}`
      );

      const data = await res.json();

      if (!Array.isArray(data)) return;

      setReports(
        data.map((r) => ({
          id: r.id,
          user_name: r.user?.username ?? "Unknown",
          song_title: r.song?.title ?? "—",
          title: r.title,
          description: r.description,
          status: r.status,
        }))
      );
    } catch (err) {
      console.error("❌ Fetch reports error:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeFilter]);

  // ===============================
  // 🚀 CALL API RESOLVE / REJECT
  // ===============================
  const handleResolve = async (id) => {
    await fetch(`http://localhost:3000/admin/report/${id}/resolve`, {
      method: "PATCH",
    });

    setSelectedReport(null);
    fetchReports();
  };

  const handleReject = async (id) => {
    await fetch(`http://localhost:3000/admin/report/${id}/reject`, {
      method: "PATCH",
    });

    setSelectedReport(null);
    fetchReports();
  };

  const handleRestore = async (id) => {
    await fetch(`http://localhost:3000/admin/report/${id}/restore`, {
      method: "PATCH",
    });

    fetchReports();
  };


  return (
    <div className="report-wrapper">

      {/* FILTER TABS */}
      <div className="report-tabs">
        {STATUS_LIST.map((st) => (
          <button
            key={st}
            className={`report-tab ${activeFilter === st ? "active" : ""}`}
            onClick={() => setActiveFilter(st)}
          >
            {st}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>User</th>
            <th>Bài hát</th>
            <th>Tiêu đề</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: 15 }}>
                Không có báo cáo nào.
              </td>
            </tr>
          ) : (
            reports.map((r, index) => (
              <tr key={r.id}>
                <td>{index + 1}</td>
                <td>{r.user_name}</td>
                <td>{r.song_title}</td>
                <td>{r.title}</td>
                <td>{r.description}</td>
                <td>
                  <span className={`status-badge ${r.status.toLowerCase()}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  {activeFilter === "PENDING" && (
                    <button
                      className="report-view-btn"
                      onClick={() => setSelectedReport(r)}
                    >
                      Xem
                    </button>
                  )}

                  {activeFilter === "RESOLVED" && (
                    <button
                      className="report-restore-btn"
                      onClick={() => handleRestore(r.id)}
                    >
                      Khôi phục
                    </button>
                  )}

                  {activeFilter !== "PENDING" && activeFilter !== "RESOLVED" && "—"}
                </td>
              </tr>
            ))

          )}
        </tbody>
      </table>

      {/* POPUP */}
      {selectedReport && (
        <div
          className="report-popup-overlay"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="report-popup-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="report-popup-title">Thông tin Report</h3>

            <div className="report-popup-group">
              <label>User báo cáo</label>
              <input type="text" value={selectedReport.user_name} readOnly />
            </div>

            <div className="report-popup-group">
              <label>Bài hát</label>
              <input type="text" value={selectedReport.song_title} readOnly />
            </div>

            <div className="report-popup-group">
              <label>Tiêu đề report</label>
              <input type="text" value={selectedReport.title} readOnly />
            </div>

            <div className="report-popup-group">
              <label>Mô tả</label>
              <textarea rows={4} value={selectedReport.description} readOnly />
            </div>

            {/* BUTTON ROW */}
            <div className="report-popup-actions">
              <div className="left-buttons">
                <button
                  className="report-resolve-btn"
                  onClick={() => handleResolve(selectedReport.id)}
                >
                  Resolve
                </button>

                <button
                  className="report-reject-btn"
                  onClick={() => handleReject(selectedReport.id)}
                >
                  Reject
                </button>
              </div>

              <button
                className="report-close-btn"
                onClick={() => setSelectedReport(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}