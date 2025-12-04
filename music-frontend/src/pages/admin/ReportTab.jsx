import React, { useEffect, useState } from "react";
import "./ReportTab.css";

const STATUS_LIST = ["PENDING", "IN_REVIEW", "RESOLVED", "REJECTED"];

export default function ReportTab() {
  const [reports, setReports] = useState([]);
  const [activeFilter, setActiveFilter] = useState("PENDING");
  const [selectedReport, setSelectedReport] = useState(null);

  // Mock data test giao diện
  useEffect(() => {
    const mock = [
      {
        id: 1,
        user_id: 12,
        user_name: "User #12",
        song_id: 5,
        song_title: "Bài hát ABC",
        title: "Nội dung không phù hợp",
        description: "Chứa lời lẽ nhạy cảm",
        status: "PENDING",
      },
    ];
    setReports(mock);
  }, []);

  // Cập nhật trạng thái
  const updateStatus = (id, newStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    // cập nhật popup
    setSelectedReport((prev) =>
      prev ? { ...prev, status: newStatus } : prev
    );
  };

  // Khi admin nhấn XEM
  const handleView = (report) => {
    let updated = report;

    // PENDING => auto chuyển sang IN_REVIEW
    if (report.status === "PENDING") {
      updated = { ...report, status: "IN_REVIEW" };
      updateStatus(report.id, "IN_REVIEW");
    }

    setSelectedReport(updated);
  };

  // Lọc theo tab
  const filteredReports = reports.filter(
    (r) => r.status === activeFilter
  );

  return (
    <div className="report-wrapper">
      {/* TAB LỚN */}
      <div className="report-tabs">
        {STATUS_LIST.map((st) => (
          <button
            key={st}
            className={
              "report-tab" + (activeFilter === st ? " active" : "")
            }
            onClick={() => setActiveFilter(st)}
          >
            {st}
          </button>
        ))}
      </div>

      {/* BẢNG */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Bài hát</th>
            <th>Tiêu đề</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {filteredReports.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: 15 }}>
                Không có báo cáo nào.
              </td>
            </tr>
          ) : (
            filteredReports.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
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
                  <button className="view-btn" onClick={() => handleView(r)}>
                    Xem
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* POPUP */}
      {selectedReport && (
        <div
          className="popup-overlay"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="popup-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="popup-title">Thông tin Report</h3>

            <div className="popup-group">
              <label>User báo cáo</label>
              <input type="text" value={selectedReport.user_name} readOnly />
            </div>

            <div className="popup-group">
              <label>Bài hát</label>
              <input type="text" value={selectedReport.song_title} readOnly />
            </div>

            <div className="popup-group">
              <label>Tiêu đề report</label>
              <input type="text" value={selectedReport.title} readOnly />
            </div>

            <div className="popup-group">
              <label>Mô tả</label>
              <textarea
                rows={4}
                value={selectedReport.description}
                readOnly
              ></textarea>
            </div>

            {/* HÀNH ĐỘNG CHỈ HIỆN Ở IN_REVIEW */}
            {selectedReport.status === "IN_REVIEW" && (
              <div
                className="popup-footer"
                style={{ justifyContent: "flex-start", gap: "10px" }}
              >
                <button
                  className="resolve-btn"
                  onClick={() => {
                    updateStatus(selectedReport.id, "RESOLVED");
                    setSelectedReport(null);
                  }}
                >
                  Resolve
                </button>

                <button
                  className="reject-btn"
                  onClick={() => {
                    updateStatus(selectedReport.id, "REJECTED");
                    setSelectedReport(null);
                  }}
                >
                  Reject
                </button>
              </div>
            )}

            <div className="popup-footer">
              <button
                className="popup-cancel"
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
