import React, { useRef } from "react";
import "./AlbTop10.css"; // Đổi tên file CSS cho đồng bộ, tránh nhầm lẫn

const albums = [
  { id: 1, name: "Evermore", artist: "Taylor Swift", image: "/images/Taylor.jpg" },
  { id: 2, name: "Bloom", artist: "Troye Sivan", image: "/images/TheWeeknd.avif" },
  { id: 3, name: "SOUR", artist: "Olivia Rodrigo", image: "/images/CharlieP.webp" },
  { id: 4, name: "After Hours", artist: "The Weeknd", image: "/images/Troyea.jpg" },
  { id: 5, name: "Nine Track Mind", artist: "Charlie Puth", image: "/images/Taylor.jpg" },
  { id: 6, name: "1989", artist: "Taylor Swift", image: "/images/CharlieP.webp" },
  { id: 7, name: "Blue Neighbourhood", artist: "Troye Sivan", image: "/images/CharlieP.webp" },
  { id: 8, name: "GUTS", artist: "Olivia Rodrigo", image: "/images/TheWeeknd.avif" },
  { id: 9, name: "Starboy", artist: "The Weeknd", image: "/images/Taylor.jpg" },
  { id: 10, name: "Voicenotes", artist: "Charlie Puth", image: "/images/TheWeeknd.avif" },
];

const AlbTop10 = () => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="AlbTop10">

      <div className="AlbTop10-header">
        <h3 className="AlbTop10-title">Album được yêu thích nhất</h3>
      </div>

      {/* WRAPPER để chứa slider + nút prev/next */}
      <div className="AlbTop10-wrapper">

        {/* NÚT PREV */}
        <button onClick={scrollLeft} className="AlbTop10-btn AlbTop10-prev">❮</button>

        {/* SLIDER */}
        <div className="AlbTop10-row" ref={scrollRef}>
          {albums.map((album) => (
            <div key={album.id} className="AlbTop10-card">
              <img src={album.image} alt={album.name} className="AlbTop10-cover" />

              <p className="AlbTop10-name">{album.name}</p>
              <p className="AlbTop10-artist">{album.artist}</p>
            </div>
          ))}
        </div>

        {/* NÚT NEXT */}
        <button onClick={scrollRight} className="AlbTop10-btn AlbTop10-next">❯</button>

      </div>
    </div>

  );
};

export default AlbTop10;
