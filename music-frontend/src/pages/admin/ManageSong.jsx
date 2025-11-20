// src/admin/ManageSong.jsx
import React, { useState, useEffect, useRef } from "react";
import "./ManageSong.css";
import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";



const initialSongs = [
  {
    id: 1,
    title: "Call Out My Name",
    artistName: "The Weeknd",
    albumName: "My Dear Melancholy",
    duration: 420,
    playCount: 80023,
    genre: "R&B",
    coverUrl: "/images/TheWeeknd.avif",
    status: "APPROVED",
    active: 1,
  },
  {
    id: 2,
    title: "Hè",
    artistName: "Brian",
    albumName: "Summer Chill",
    duration: 280,
    playCount: 120022,
    genre: "Pop",
    coverUrl: "/images/covers/summer.jpg",
    status: "APPROVED",
    active: 1,
  },
  {
    id: 3,
    title: "Hi",
    artistName: "New Artist",
    albumName: "Demo Tracks",
    duration: 268,
    playCount: 0,
    genre: "Pop",
    coverUrl: "/images/covers/demo.jpg",
    status: "PENDING",
    active: 1,
  },
  {
    id: 4,
    title: "Hidden Track",
    artistName: "Secret Artist",
    albumName: "Unreleased",
    duration: 210,
    playCount: 10,
    genre: "Indie",
    coverUrl: "/images/covers/hidden.jpg",
    status: "APPROVED",
    active: 0,
  },
  {
    id: 5,
    title: "Call Out My Name",
    artistName: "The Weeknd",
    albumName: "My Dear Melancholy",
    duration: 420,
    playCount: 80023,
    genre: "R&B",
    coverUrl: "/images/TheWeeknd.avif",
    status: "APPROVED",
    active: 1,
  },
  {
    id: 6,
    title: "Hè",
    artistName: "Brian",
    albumName: "Summer Chill",
    duration: 280,
    playCount: 120022,
    genre: "Pop",
    coverUrl: "/images/covers/summer.jpg",
    status: "APPROVED",
    active: 1,
  },
  {
    id: 7,
    title: "Hi",
    artistName: "New Artist",
    albumName: "Demo Tracks",
    duration: 268,
    playCount: 0,
    genre: "Pop",
    coverUrl: "/images/covers/demo.jpg",
    status: "PENDING",
    active: 1,
  },
  {
    id: 8,
    title: "Hidden Track",
    artistName: "Secret Artist",
    albumName: "Unreleased",
    duration: 210,
    playCount: 10,
    genre: "Indie",
    coverUrl: "/images/covers/hidden.jpg",
    status: "APPROVED",
    active: 0,
  },
];

// Format thời lượng 420 -> 07:00
const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const ManageSong = () => {
  const [songs, setSongs] = useState(initialSongs);
  const [searchValue, setSearchValue] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const dropdownRef = useRef(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(null); // lưu bài hát đang xem
  const [showEditPopup, setShowEditPopup] = useState(null); // lưu bài hát đang sửa
  const [coverFile, setCoverFile] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioName, setAudioName] = useState("");
  const [editCoverPreview, setEditCoverPreview] = useState(null);
  const [editCoverFile, setEditCoverFile] = useState(null);

  const [editAudioFile, setEditAudioFile] = useState(null);
  const [editAudioName, setEditAudioName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newArtist, setNewArtist] = useState("");
  const [newAlbum, setNewAlbum] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editAlbum, setEditAlbum] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editDuration, setEditDuration] = useState("");


  // Click ra ngoài thì đóng menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lọc bài hát
  const filteredSongs = songs.filter((song) =>
    (song.title + song.artistName + song.albumName + song.genre)
      .toLowerCase()
      .includes(searchValue.toLowerCase())
  );

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const handleApprove = (id) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "APPROVED" } : s))
    );
  };

  const handleToggleActive = (id) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: s.active ? 0 : 1 } : s))
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn muốn xóa bài hát này?")) {
      setSongs((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSaveSong = () => {
    console.log("Tiêu đề:", newTitle);
    console.log("Nghệ sĩ:", newArtist);
    console.log("Album:", newAlbum);
    console.log("Thể loại:", newGenre);
    console.log("Thời lượng:", newDuration);

    console.log("File ảnh:", coverFile);
    console.log("File nhạc:", audioFile);

    alert("Đã nhận dữ liệu :)");
  };

  const resetAddPopup = () => {
    setCoverFile(null);
    setPreviewCover(null);

    setAudioFile(null);
    setAudioName("");

    // reset all text inputs
    setNewTitle("");
    setNewArtist("");
    setNewAlbum("");
    setNewGenre("");
    setNewDuration("");
  };

  const resetEditPopup = () => {
    setEditCoverFile(null);
    setEditCoverPreview(null);

    setEditAudioFile(null);
    setEditAudioName("");

    setEditTitle("");
    setEditArtist("");
    setEditAlbum("");
    setEditGenre("");
    setEditDuration("");
  };




  return (
    <div className="admin-user-container">
      {/* HEADER */}
      <h2 className="um-title">Quản lý bài hát</h2>
      <div className="admin-user-header">
        <div className="google-search-bar">
          <FiSearch className="google-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
            className="google-search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <button className="admin-add-btn" onClick={() => setShowAddPopup(true)}>+ Thêm bài hát </button>

      </div>

      {/* TABLE */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cover</th>
            <th>Bài hát</th>
            <th>Nghệ sĩ</th>
            <th>Album</th>
            <th>Thời lượng</th>
            <th>Thể loại</th>
            <th>Lượt nghe</th>
            <th>Trạng thái</th>
            <th>More</th>
          </tr>
        </thead>

        <tbody>
          {filteredSongs.map((song) => (
            <tr key={song.id}>
              <td>{song.id}</td>

              {/* Cover */}
              <td>
                <img src={song.coverUrl} alt="" className="song-cover" />
              </td>

              <td>{song.title}</td>
              <td>{song.artistName}</td>
              <td>{song.albumName}</td>
              <td>{formatDuration(song.duration)}</td>
              <td>{song.genre}</td>
              <td>{song.playCount.toLocaleString("vi-VN")}</td>

              {/* GỘP TRẠNG THÁI + HIỂN THỊ */}
              <td>
                <span
                  className={
                    "status-merged " +
                    (song.status === "PENDING"
                      ? "pending"
                      : song.active
                      ? "public"
                      : "hidden")
                  }
                >
                  {song.status === "PENDING"
                    ? "Pending"
                    : song.active
                    ? "Public"
                    : "Hidden"}
                </span>
              </td>

              {/* ACTION MENU */}
              <td className="action-menu-cell">
                <button
                  className="action-btn"
                  onClick={() => toggleMenu(song.id)}
                >
                  <BsThreeDotsVertical />
                </button>

                {openMenu === song.id && (
                  <div className="action-dropdown" ref={dropdownRef}>
                    <button onClick={() => setShowViewPopup(song)}>Xem</button>
                    <button onClick={() => {
                        setShowEditPopup(song);

                        // Gán dữ liệu vào state để hiển thị trong input
                        setEditTitle(song.title);
                        setEditArtist(song.artistName);
                        setEditAlbum(song.albumName);
                        setEditGenre(song.genre);
                        setEditDuration(song.duration);

                        // Ảnh cũ
                        setEditCoverPreview(song.coverUrl);
                        setEditCoverFile(null);

                        // Nhạc
                        setEditAudioFile(null);
                        setEditAudioName("");
                    }}>
                      Sửa
                    </button>



                    <button onClick={() => handleToggleActive(song.id)}>
                      {song.active ? "Ẩn" : "Hiện"}
                    </button>

                    {song.status === "PENDING" && (
                      <button onClick={() => handleApprove(song.id)}>Duyệt</button>
                    )}

                    <button
                      className="danger"
                      onClick={() => handleDelete(song.id)}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* POPUP THÊM BÀI HÁT */}
      {showAddPopup && (
        <div
          className="popup-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              resetAddPopup();
              setShowAddPopup(false);
            }
          }}
        >
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="popup-title">Thêm bài hát mới</h3>

            <div className="popup-grid">

              {/* =====================
                  CỘT TRÁI
              ====================== */}
              <div className="popup-col">

                {/* TIÊU ĐỀ */}
                <div className="popup-group">
                  <label>Tiêu đề bài hát</label>
                  <input
                    type="text"
                    placeholder="Nhập tên bài hát..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                {/* NGHỆ SĨ */}
                <div className="popup-group">
                  <label>Nghệ sĩ</label>
                  <input
                    type="text"
                    placeholder="Nhập tên nghệ sĩ..."
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                  />
                </div>

               <div className="popup-group">
                  <label>Ảnh bìa</label>

                  {/* Nếu đã có ảnh → chỉ hiện preview, không click để upload */}
                  {previewCover ? (
                    <div
                      className="spotify-preview-wrapper"
                      onMouseDown={(e) => e.stopPropagation()} // CHẶN CLICK & MOUSEDOWN
                    >
                      <img src={previewCover} className="spotify-upload-preview" />

                      <button
                        className="spotify-remove-btn"
                        onMouseDown={(e) => {
                          e.stopPropagation(); // NGĂN MỞ UPLOAD
                          e.preventDefault();
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // NGĂN CLICK NỔI LÊN VÙNG UPLOAD
                          setCoverFile(null);
                          setPreviewCover(null);

                          // reset input để chọn lại cùng file
                          const input = document.getElementById("coverUpload");
                          if (input) input.value = "";
                        }}
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  ) : (
                    /* Khi chưa có ảnh → vùng upload hoạt động */
                    <div
                      className="spotify-upload-area"
                      onMouseDown={(e) => e.stopPropagation()} // CHẶN BUBBLE SỚM
                      onClick={() => {
                        const input = document.getElementById("coverUpload");
                        if (input) {
                          input.value = ""; // reset value để upload cùng file
                          input.click();
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) {
                          setCoverFile(file);
                          setPreviewCover(URL.createObjectURL(file));
                        }
                      }}
                    >
                      <p className="spotify-upload-text">
                        Kéo thả ảnh vào đây hoặc nhấn để chọn
                      </p>

                      <input
                        id="coverUpload"
                        type="file"
                        accept="image/*"
                        className="spotify-upload-input"
                        onMouseDown={(e) => e.stopPropagation()}  // NGĂN CLICK BUBBLE
                        onClick={(e) => e.stopPropagation()}       // GIỮ input không click xuyên
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setCoverFile(file);
                            setPreviewCover(URL.createObjectURL(file));
                          }
                          e.target.value = ""; // reset input
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* THỜI LƯỢNG */}
                <div className="popup-group">
                  <label>Thời lượng (giây)</label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 210"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                  />
                </div>

              </div>

              {/* =====================
                  CỘT PHẢI
              ====================== */}
              <div className="popup-col">

                {/* ALBUM */}
                <div className="popup-group">
                  <label>Album</label>
                  <input
                    type="text"
                    placeholder="Nhập tên album..."
                    value={newAlbum}
                    onChange={(e) => setNewAlbum(e.target.value)}
                  />
                </div>

                {/* THỂ LOẠI */}
                <div className="popup-group">
                  <label>Thể loại</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Pop, R&B..."
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                  />
                </div>

                {/* FILE NHẠC */}
                <div className="popup-group">
                  <label>File nhạc</label>

                  <div
                    className="audio-upload-area"
                    onClick={() => document.getElementById("audioUpload").click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        setAudioFile(file);
                        setAudioName(file.name);
                      }
                    }}
                  >
                    {audioName ? (
                      <p className="audio-file-name">{audioName}</p>
                    ) : (
                      <p className="audio-upload-text">Kéo thả hoặc nhấn để chọn file nhạc</p>
                    )}

                    <input
                      id="audioUpload"
                      type="file"
                      accept="audio/*"
                      className="audio-upload-input"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAudioFile(file);
                          setAudioName(file.name);
                        }
                      }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="popup-footer">
              <button
                className="popup-cancel"
                onClick={() => {
                  resetAddPopup();
                  setShowAddPopup(false);
                }}
              >
                Hủy
              </button>

              <button className="popup-save" onClick={handleSaveSong}>
                Lưu bài hát
              </button>
            </div>

          </div>
        </div>
      )}

    {/* POPUP XEM BÀI HÁT */}
    {showViewPopup && (
      <div className="popup-overlay" onClick={() => setShowViewPopup(null)}>
        <div className="popup-card" onClick={(e) => e.stopPropagation()}>
          <h3 className="popup-title">Thông tin bài hát</h3>

          <div className="popup-grid">
            
            <div className="popup-col">

              <div className="popup-group">
                <label>Tiêu đề</label>
                <input type="text" value={showViewPopup.title} readOnly />
              </div>

              <div className="popup-group">
                <label>Nghệ sĩ</label>
                <input type="text" value={showViewPopup.artistName} readOnly />
              </div>

              <div className="popup-group">
                <label>Ảnh bìa</label>

                <img
                  src={showViewPopup.coverUrl}
                  alt="Cover"
                  className="popup-cover-view"
                />
              </div>

              <div className="popup-group">
                <label>Thời lượng</label>
                <input type="text" value={formatDuration(showViewPopup.duration)} readOnly />
              </div>

            </div>

            <div className="popup-col">

              <div className="popup-group">
                <label>Album</label>
                <input type="text" value={showViewPopup.albumName} readOnly />
              </div>

              <div className="popup-group">
                <label>Thể loại</label>
                <input type="text" value={showViewPopup.genre} readOnly />
              </div>

              <div className="popup-group">
                <label>Trạng thái</label>
                <input type="text" value={showViewPopup.active ? "Public" : "Hidden"} readOnly />
              </div>

            </div>

          </div>

          <div className="popup-footer">
            <button className="popup-cancel" onClick={() => setShowViewPopup(null)}>Đóng</button>
          </div>
        </div>
      </div>
    )}

    {/* POPUP SỬA BÀI HÁT */}
    {showEditPopup && (
    <div
      className="popup-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          resetEditPopup();
          setShowEditPopup(null);
        }
      }}
    >
      <div className="popup-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="popup-title">Chỉnh sửa bài hát</h3>

        <div className="popup-grid">

          {/* CỘT TRÁI */}
          <div className="popup-col">

            <div className="popup-group">
              <label>Tiêu đề</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div className="popup-group">
              <label>Nghệ sĩ</label>
              <input
                type="text"
                value={editArtist}
                onChange={(e) => setEditArtist(e.target.value)}
              />
            </div>

            {/* ẢNH BÌA */}
            <div className="popup-group">
              <label>Ảnh bìa</label>

              {editCoverPreview ? (
                <div className="spotify-preview-wrapper" onMouseDown={(e) => e.stopPropagation()}>
                  <img src={editCoverPreview} className="spotify-upload-preview" />

                  <button
                    className="spotify-remove-btn"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      setEditCoverPreview(null);
                      setEditCoverFile(null);
                      document.getElementById("editCoverInput").value = "";
                    }}
                  >
                    Xóa ảnh
                  </button>
                </div>
              ) : (
                <div
                  className="spotify-upload-area"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    const input = document.getElementById("editCoverInput");
                    input.value = "";
                    input.click();
                  }}
                >
                  <p className="spotify-upload-text">Kéo thả hoặc nhấn để chọn ảnh</p>

                  <input
                    id="editCoverInput"
                    type="file"
                    accept="image/*"
                    className="spotify-upload-input"
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditCoverFile(file);
                        setEditCoverPreview(URL.createObjectURL(file));
                      }
                      e.target.value = "";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="popup-group">
              <label>Thời lượng (giây)</label>
              <input
                type="number"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
              />
            </div>

          </div>

          {/* CỘT PHẢI */}
          <div className="popup-col">

            <div className="popup-group">
              <label>Album</label>
              <input
                type="text"
                value={editAlbum}
                onChange={(e) => setEditAlbum(e.target.value)}
              />
            </div>

            <div className="popup-group">
              <label>Thể loại</label>
              <input
                type="text"
                value={editGenre}
                onChange={(e) => setEditGenre(e.target.value)}
              />
            </div>

            {/* FILE NHẠC */}
            <div className="popup-group">
              <label>File nhạc</label>

              {editAudioName ? (
                <div className="spotify-preview-wrapper" onMouseDown={(e) => e.stopPropagation()}>
                  <p className="audio-file-name">{editAudioName}</p>

                  <button
                    className="spotify-remove-btn"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      setEditAudioFile(null);
                      setEditAudioName("");
                      document.getElementById("editAudioUpload").value = "";
                    }}
                  >
                    Xóa File
                  </button>
                </div>
              ) : (
                <div
                  className="audio-upload-area"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    const input = document.getElementById("editAudioUpload");
                    input.value = "";
                    input.click();
                  }}
                >
                  <p className="audio-upload-text">
                    Kéo thả hoặc nhấn để chọn file nhạc
                  </p>

                  <input
                    id="editAudioUpload"
                    type="file"
                    accept="audio/*"
                    className="audio-upload-input"
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditAudioFile(file);
                        setEditAudioName(file.name);
                      }
                      e.target.value = "";
                    }}
                  />
                </div>
              )}
            </div>

          </div>

        </div>

        <div className="popup-footer">
          <button
            className="popup-cancel"
            onClick={() => {
              resetEditPopup();
              setShowEditPopup(null);
            }}
          >
            Hủy
          </button>

          <button
            className="popup-save"
            onClick={() => {
              setSongs(prev =>
                prev.map(s => 
                  s.id === showEditPopup.id
                    ? {
                        ...s,
                        title: editTitle,
                        artistName: editArtist,
                        albumName: editAlbum,
                        genre: editGenre,
                        duration: editDuration,
                        coverUrl: editCoverPreview || s.coverUrl
                      }
                    : s
                )
              );

              resetEditPopup();
              setShowEditPopup(null);
            }}
          >
            Lưu chỉnh sửa
          </button>
        </div>

      </div>
    </div>
  )}


    

    </div>
  );
};

export default ManageSong;
