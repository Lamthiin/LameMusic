import React, { useEffect, useState } from "react";
import "./AdminTopArtists.css";

const AdminTopArtists = () => {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await fetch("http://localhost:3000/admin/dashboard/top-artists");
        const data = await res.json();
        setArtists(data);
      } catch (err) {
        console.error("Lỗi tải Top Artists:", err);
      }
    };

    fetchArtists();
  }, []);

  return (
    <div className="artist-section">
      <h3 className="artist-section-title">Nghệ sĩ được yêu thích nhất</h3>

      <div className="top-artist-grid">
        {artists.map((artist) => (
          <div key={artist.id} className="artist-card">
            <div className="artist-image-wrapper">
              <img
                src={artist.image}
                alt={artist.name}
                className="artist-avatar"
              />
            </div>

            <p className="artist-name">{artist.name}</p>
            <p className="artist-subtitle">Artist</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTopArtists;
