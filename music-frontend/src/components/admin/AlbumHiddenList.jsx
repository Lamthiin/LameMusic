import React from "react";
import "./AlbumList.css"; // dùng chung CSS bảng

export default function AlbumHiddenList({ albums = [], onView, onRestore }) {
  const sortedAlbums = [...albums].sort((a, b) =>
    a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
  );

  return (
    <div className="album-table-wrapper">
      {sortedAlbums.length === 0 ? (
        <div className="empty-active">Không có album nào</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Ảnh</th>
              <th>Tên Album</th>
              <th>Ngày phát hành</th>
              <th>Nghệ sĩ</th>
              <th>Số bài hát</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {sortedAlbums.map((album, index) => (
              <tr key={album.id}>
                <td>{index + 1}</td>

                <td>
                  <img
                    src={album.cover_url || "/default-album.png"}
                    alt={album.name}
                    className="album-cover-table"
                  />
                </td>

                <td>{album.name}</td>

                <td>
                  {album.release_date
                    ? new Date(album.release_date).toLocaleDateString("vi-VN")
                    : "—"}
                </td>

                <td>{album.artist?.name || "—"}</td>

                <td>{album.songs ?? 0}</td>

                <td>
                  <div className="admin-actions">
                    {/* XEM */}
                    <button className="alb-btn-view" onClick={() => onView(album)}>
                      Xem
                    </button>

                    {/* KHÔI PHỤC */}
                    <button className="btn-restore" onClick={() => onRestore(album.id)}>
                      Khôi phục
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
