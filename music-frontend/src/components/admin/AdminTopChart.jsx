import React from "react";
import "./Admin.css"; // dùng chung file CSS admin

const topSongs = [
  {
    id: 1,
    title: "Midnight Vibes",
    artist: "Lame Artist",
    plays: 1254300,
    likes: 23000,
    genre: "Ballad",
    cover: "/images/TheWeeknd.avif",
  },
  {
    id: 2,
    title: "Summer Rain",
    artist: "Cloudy",
    plays: 954200,
    likes: 18700,
    genre: "Pop",
    cover: "/images/Taylor.jpg",
  },
  {
    id: 3,
    title: "Lost in Sound",
    artist: "Echo",
    plays: 812300,
    likes: 15000,
    genre: "Pop",
    cover: "/images/TheWeeknd.avif",
  },
  {
    id: 4,
    title: "City Lights",
    artist: "Neon",
    plays: 702100,
    likes: 12000,
    genre: "EDM",
    cover: "/images/TheWeeknd.avif",
  },
  {
    id: 5,
    title: "Moonlight Drive",
    artist: "Lame Band",
    plays: 659000,
    likes: 9800,
    genre: "EDM",
    cover: "/images/Taylor.jpg",
  },
  {
    id: 6,
    title: "Night Runner",
    artist: "Nova",
    plays: 602300,
    likes: 9100,
    genre: "EDM",
    cover: "/images/TheWeeknd.avif",
  },
  {
    id: 7,
    title: "Slow Motion",
    artist: "Mizu",
    plays: 580200,
    likes: 8600,
    genre: "EDM",
    cover: "/images/Taylor.jpg",
  },
  {
    id: 8,
    title: "Falling",
    artist: "Aki",
    plays: 552000,
    likes: 8200,
    genre: "EDM",
    cover: "/images/TheWeeknd.avif",
  },
  {
    id: 9,
    title: "Afterglow",
    artist: "Stellar",
    plays: 521400,
    likes: 7800,
    genre: "EDM",
    cover: "/images/Taylor.jpg",
  },
  {
    id: 10,
    title: "Last Train Home",
    artist: "Night Owl",
    plays: 498000,
    likes: 7300,
    genre: "EDM",
    cover: "/images/TheWeeknd.avif",
  },
];

const formatNumber = (n) =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const AdminTopChart = () => {
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
            <th>Lượt thích</th>
            <th>Thể loại</th>
          </tr>
        </thead>
        <tbody>
          {topSongs.map((song, index) => (
            <tr key={song.id}>
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
                    src={song.cover}
                    alt={song.title}
                    className="topchart-cover"
                  />
                  <span className="topchart-song-title">{song.title}</span>
                </div>
              </td>
              <td className="topchart-artist">{song.artist}</td>
              <td>{formatNumber(song.plays)}</td>
              <td>{formatNumber(song.likes)}</td>
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
