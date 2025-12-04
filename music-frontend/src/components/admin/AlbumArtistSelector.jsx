import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AlbumArtistSelector({ onSelect }) {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/admin/artists/active")
      .then(res => setArtists(res.data))
      .catch(err => console.error("LOAD ARTISTS ERROR:", err));
  }, []);

  return (
    <div>
      {artists.map(a => (
        <div key={a.id} onClick={() => onSelect(a)}>
          {a.stage_name}
        </div>
      ))}
    </div>
  );
}
