import React, { useEffect, useState } from "react";
import "./Admin.css";

const formatNumber = (n) =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const AdminTopChart = () => {
  const [topSongs, setTopSongs] = useState([]);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await fetch("http://localhost:3000/admin/dashboard/top-charts");
        const data = await res.json();
        setTopSongs(data);
      } catch (err) {
        console.error("Lỗi tải Top Chart:", err);
      }
    };

    fetchTop();
  }, []);

  return (
    <div className="topchart-card">
      <div className="topchart-header">
        <div>
          <h3 className="topchart-title">Bảng xếp hạng Top 10</h3>
          <p className="topchart-subtitle">Theo lượt stream trong tuần</p>
        </div>
        <span className="topchart-tag">Real-time</span>
      </div>

      <table className="topchart-table">
        <thead>
          <tr>
            <th>Top</th>
            <th>Bài hát</th>
            <th>Nghệ sĩ</th>
            <th>Lượt nghe</th>
            <th>Thể loại</th>
          </tr>
        </thead>

        <tbody>
          {topSongs.map((song, index) => (
            <tr key={song.id + '-' + index}>
              <td>
                <span
                  className={
                    "rank-badge " + (index < 3 ? "rank-badge-hot" : "")
                  }
                >
                  {index + 1}
                </span>
              </td>

              <td>
                <div className="topchart-song">
                  <img
                    src={song.image || "/images/default-album.png"}
                    alt={song.title}
                    className="topchart-cover"
                  />
                  <span className="topchart-song-title">{song.title}</span>
                </div>
              </td>

              <td className="topchart-artist">
                {Array.isArray(song.artists) ? song.artists.join(", ") : ""}
              </td>

              <td>{formatNumber(song.plays)}</td>

              <td>
                <span className="genre-tag">{song.genre}</span>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTopChart;
