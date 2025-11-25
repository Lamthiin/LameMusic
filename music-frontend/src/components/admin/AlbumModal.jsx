// music-frontend/src/pages/AdminPage/AlbumModal.jsx
import React, { useEffect, useState } from "react";
import ArtistDropdown from "./ArtistDropdown.jsx";

const AlbumModal = ({ album, artists, close, reload }) => {
  const [name, setName] = useState("");
  const [artist, setArtist] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (album) {
      setName(album.name);
      setArtist(album.artist);
      setPreview(album.coverUrl);
    } else {
      setName("");
      setArtist(null);
      setPreview(null);
    }
  }, [album]);

  const save = async () => {
    if (!name.trim()) return alert("Tên album không được trống");
    if (!artist) return alert("Bạn phải chọn nghệ sĩ");

    const data = new FormData();
    data.append("name", name);
    data.append("artistId", artist.id);
    if (coverFile) data.append("coverFile", coverFile);

    try {
      if (album) {
        await axios.put(`/albums/update/${album.id}`, data);
      } else {
        await axios.post(`/albums/create`, data);
      }

      reload();
      close();
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Lỗi lưu album");
    }
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        <h3>{album ? "Sửa Album" : "Thêm Album mới"}</h3>

        <input
          type="text"
          placeholder="Tên album"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <ArtistDropdown
          artists={artists}
          value={artist}
          onChange={(a) => setArtist(a)}
        />

        <div className="form-group">
          <label>Ảnh bìa:</label>
          <img className="avatar-preview" src={preview || "/images/default-album.png"} />
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => {
              setCoverFile(e.target.files[0]);
              setPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-save" onClick={save}>Lưu</button>
          <button className="btn-cancel" onClick={close}>Hủy</button>
        </div>

      </div>
    </div>
  );
};

export default AlbumModal;
