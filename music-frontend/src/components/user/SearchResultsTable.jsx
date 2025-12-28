// src/components/SearchResultsTable.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./SearchResultsTable.css"; // CSS tuỳ chỉnh

const fixImageUrl = (url) => {
  if (!url) return "/images/default.png";
  if (url.startsWith("http")) return url;
  return `http://localhost:3000${url}`;
};

const SearchResultsTable = ({ songs }) => {
  const navigate = useNavigate();

  if (!songs || songs.length === 0) {
    return <div>Không tìm thấy bài hát nào 😢</div>;
  }

  return (
    <table className="search-table">
      <thead>
        <tr>
          <th>Ảnh</th>
          <th>Tên bài hát</th>
          <th>Nghệ sĩ</th>
          <th>Album</th>
          <th>Nguồn</th>
          <th>Similarity</th>
        </tr>
      </thead>
      <tbody>
        {songs.map((song) => {
          const artistNames = song.songArtists?.map(sa => sa.artist?.stage_name).join(", ") || song.nghe_si;
          return (
            <tr key={song.id || song.ten_bai_hat} onClick={() => navigate(`/song/${song.id}`)} className="song-row">
              <td>
                <img src={fixImageUrl(song.image_url || song.album?.cover_url)} alt={song.ten_bai_hat} className="song-img"/>
              </td>
              <td>{song.ten_bai_hat}</td>
              <td>{artistNames}</td>
              <td>{song.album?.title || song.album}</td>
              <td>{song.source}</td>
              <td>{song.similarity?.toFixed(2) || "-"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default SearchResultsTable;
