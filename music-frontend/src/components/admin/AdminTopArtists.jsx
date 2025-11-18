import React from "react";
import "./AdminTopArtists.css";

const artists = [
  {
    id: 1,
    name: "Taylor Swift",
    subtitle: "Artist",
    image: "/images/Taylor.jpg",
  },
  {
    id: 2,
    name: "Troye Sivan",
    subtitle: "Artist",
    image: "/images/Troyea.jpg",
  },
  {
    id: 3,
    name: "Olivia Rodrigo",
    subtitle: "Artist",
    image: "/images/OliviaRodrigo.jpg",
  },
  {
    id: 4,
    name: "The Weeknd",
    subtitle: "Artist",
    image: "/images/TheWeeknd.avif",
  },
  {
    id: 5,
    name: "Charlie Puth",
    subtitle: "Artist",
    image: "/images/CharlieP.webp",
  },
];

const AdminTopArtists = () => {
  return (
    <div className="artist-section">
      <h3 className="artist-section-title">Nghệ sĩ được yêu thích nhất</h3>

      <div className="artist-grid">
        {artists.map((artist) => (
          <div key={artist.id} className="artist-card">
            <div className="artist-image-wrapper">
              <img src={artist.image} alt={artist.name} className="artist-avatar" />
            </div>
            <p className="artist-name">{artist.name}</p>
            <p className="artist-subtitle">{artist.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTopArtists;
