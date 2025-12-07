// src/admin/ManageSong.jsx
import React, { useState, useEffect, useRef } from "react";
import "./ManageSong.css";
import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import ArtistDropdown from "../../components/admin/ArtistDropdown";
import AlbumDropdown from "../../components/admin/AlbumDropdown";
import GenreDropdown from "../../components/admin/GenreDropdown";
import ReportTab from "./ReportTab";
import PopupSuccess from "../../components/admin/PopupSuccess";

// Format thời lượng 420 -> 07:00
const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const ManageSong = () => {
  const [songs, setSongs] = useState([]);
  const fetchSongs = async (pageNumber = 1) => {
    try {
      const res = await fetch("http://localhost:3000/admin/manage-song");
      const data = await res.json();

      console.log("🔥 BACKEND RAW SONG DATA:", data);

      setSongs(
        data.map(s => {
          const primary = s.songArtists?.find(a => a.is_primary === 1);
          const allNames = s.songArtists
            ?.map(a => a.artist?.stage_name)
            .join(", ") ?? "";

          return {
            id: s.id,
            title: s.title,

            // LẤY NGHỆ SĨ ĐÚNG
            artistName: allNames,
            artistId: primary?.artist?.id ?? null,

            albumName: s.album?.title ?? "",
            duration: s.duration,
            playCount: s.play_count,
            genre: s.genre ?? "",
            genreId: genres.find(g => g.name === s.genre)?.id ?? null,
            coverUrl: s.image_url,
            audioUrl: s.file_url,
            status: s.status,
            active: s.active,
            lyrics: s.lyrics?.lyrics ?? "",
            lyricsLanguage: s.lyrics?.language || "vi",
          };
        })
      );

    } catch (err) {
      console.error("Fetch songs failed:", err);
    }
  };

  // Fetch once when component opened
  useEffect(() => {
    fetchSongs();
  }, []);


  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [showEditSuccessPopup, setShowEditSuccessPopup] = useState(false);

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
  const [newCategory, setNewCategory] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editAlbum, setEditAlbum] = useState("");
  const [editLyrics, setEditLyrics] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedEditArtist, setSelectedEditArtist] = useState(null);
  const [selectedEditAlbum, setSelectedEditAlbum] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [selectedEditCategory, setSelectedEditCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "pending"
  const [newLyrics, setNewLyrics] = useState("");
  const [newLyricsLanguage, setNewLyricsLanguage] = useState("vi");
  const [editLyricsLanguage, setEditLyricsLanguage] = useState("vi");
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [filteredAlbumsAdd, setFilteredAlbumsAdd] = useState([]);
  const [filteredAlbumsEdit, setFilteredAlbumsEdit] = useState([]);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const searchRef = useRef(null);
  const [featuredArtists, setFeaturedArtists] = useState([]);   // array các artist phụ
  const [editCollabArtists, setEditCollabArtists] = useState([]); // nghệ sĩ collab khi SỬA

  useEffect(() => {
    if (showEditPopup) {
      setEditCollabArtists(
        showEditPopup.songArtists
          ?.filter(sa => !sa.is_primary)
          ?.map(sa => sa.artist_id) || []
      );
    }
  }, [showEditPopup]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchValue("");   // reset search
        setPage(1);           // reset page
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  useEffect(() => {
    // Lấy nghệ sĩ đã được duyệt
    fetch("http://localhost:3000/admin/artists/list-all")
    .then(res => res.json())
    .then(setArtists);


    // Lấy album
    fetch("http://localhost:3000/admin/albums")
    .then(res => res.json())
    .then(data =>
      setAlbums(
        data.map(a => ({
          ...a,
          title: a.name // nếu FE muốn tiếp tục dùng title
        }))
      )
    );


    // Lấy thể loại
    fetch("http://localhost:3000/admin/genres")
      .then(res => res.json())
      .then(setGenres);
  }, []);



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
  // Lọc bài hát
  const filteredSongs = songs.filter(song => {
    const matchSearch =
      (song.title + song.artistName + song.albumName + song.genre)
        .toLowerCase()
        .includes(searchValue.toLowerCase());

    if (!matchSearch) return false;

    // Tab Active → Hiển thị bài hát còn tồn tại (active = true)
    if (activeTab === "active") {
      return song.active === true;  
    }

    // Tab Hidden → Hiển thị bài bị xoá mềm (active = false)
    if (activeTab === "hidden") {
      return song.active === false;
    }



    if (activeTab === "pending") {
      return song.status === "PENDING";
    }

    return true;
  });


  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:3000/admin/manage-song/${id}/approve`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error("Approve failed");

      await fetchSongs();   //  Load lại danh sách
      setOpenMenu(null);    //  FIX: đóng dropdown ngay lập tức
    } catch (err) {
      console.error(err);
      alert("Không thể duyệt bài hát!");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:3000/admin/manage-song/${id}/reject`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error("Reject failed");

      await fetchSongs();   // Load lại danh sách
      setOpenMenu(null);    // FIX: đóng dropdown ngay lập tức

    } catch (err) {
      console.error(err);
      alert("Không thể từ chối bài hát!");
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn XÓA bài hát này?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/admin/manage-song/${id}/soft-delete`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error("Soft delete failed");

      // load lại danh sách
      await fetchSongs();   //  Load lại danh sách
      setOpenMenu(null);    //  FIX: đóng dropdown ngay lập tức

      // THÔNG BÁO XÓA THÀNH CÔNG
      setShowDeleteSuccess(true);

    } catch (err) {
      console.error(err);
      alert("Xoá bài hát không thành công!");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:3000/admin/manage-song/${id}/toggle-active`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error("Toggle failed");

      // load lại danh sách từ backend để chắc chắn đồng bộ
      await fetchSongs();   //  Load lại danh sách
      setOpenMenu(null);    //  FIX: đóng dropdown ngay lập tức

    } catch (err) {
      console.error(err);
      alert("Không thể thay đổi trạng thái bài hát!");
    }
  };

  const handleUpdateSong = async () => {
    const id = showEditPopup.id;

    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("artist", editArtist);
    formData.append("album", editAlbum ?? "");
    formData.append("category", editCategory);
    formData.append("lyrics", editLyrics);
    formData.append("lyricsLanguage", editLyricsLanguage);




    if (editCoverFile) {
      formData.append("imageFile", editCoverFile);
    }

    if (editAudioFile) {
      formData.append("audioFile", editAudioFile);
    }

    try {
      const res = await fetch(`http://localhost:3000/admin/manage-song/${id}`, {
        method: "PATCH",
        body: formData
      });

      if (!res.ok) throw new Error("Update failed");

      await fetchSongs(); // load lại danh sách

      // Thay alert thành popup success
      setShowEditSuccessPopup(true);

      resetEditPopup();
      setShowEditPopup(null);

    } catch (err) {
      console.error(err);
      setErrorMessage("Sửa bài hát thất bại, vui lòng kiểm tra backend.");
      setShowErrorPopup(true);
    }
  };




  // const handleDelete = async (id) => {
  //   if (!window.confirm("Bạn có chắc muốn xóa bài hát này?")) return;

  //   try {
  //     const res = await fetch(`http://localhost:3000/admin/manage-song/${id}`, {
  //       method: "DELETE",
  //     });

  //     if (!res.ok) {
  //       alert("Xóa thất bại! Backend trả lỗi.");
  //       return;
  //     }

  //     // Xóa khỏi UI
  //     setSongs(prev => prev.filter(s => s.id !== id));
  //     alert("Đã xóa bài hát!");

  //   } catch (err) {
  //     console.error("Delete failed:", err);
  //     alert("Không thể kết nối backend, kiểm tra server.");
  //   }
  // };

  const handleSaveSong = async () => {
    let error = "";

    // ⚠️ KIỂM TRA NẾU CHƯA NHẬP GÌ
    const allEmpty =
      !newTitle.trim() &&
      !newArtist &&
      !newAlbum &&
      !newCategory &&
      !coverFile &&
      !audioFile;


    if (allEmpty) {
      error = "Bạn chưa nhập thông tin bài hát!";
    }

    // VALIDATION CHI TIẾT
    else if (!newTitle.trim()) error = "Tiêu đề bài hát không được để trống.";
    else if (!newArtist) error = "Bạn chưa chọn nghệ sĩ.";
    else if (!newCategory) error = "Bạn chưa chọn thể loại.";
    else if (!coverFile) error = "Bạn chưa chọn ảnh bìa.";
    else if (!audioFile) error = "Bạn chưa chọn file nhạc.";

    // Nếu có lỗi → hiện popup lỗi
    if (error) {
      setErrorMessage(error);
      setShowErrorPopup(true);
      return;
    }

    // 🔥 TẠO FORM DATA GỬI BACKEND
    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("artist", newArtist);    // ID nghệ sĩ (number)
    formData.append("category", newCategory); // ID thể loại
    formData.append("lyrics", newLyrics);
    formData.append("lyricsLanguage", newLyricsLanguage);



    // Album có thể không chọn
    if (newAlbum) {
      formData.append("album", newAlbum);    // ID album
    } else {
      formData.append("album", "");
    }

    formData.append("imageFile", coverFile); // ảnh
    formData.append("audioFile", audioFile); // nhạc

    try {
      const res = await fetch("http://localhost:3000/admin/manage-song/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      console.log("Upload thành công:", data);

      // 🟩 HIỆN POPUP THÀNH CÔNG
      setShowSuccessPopup(true);
      await fetchSongs();

    } catch (err) {
      console.error(err);
      setErrorMessage("Upload thất bại! Kiểm tra backend hoặc file.");
      setShowErrorPopup(true);
    }
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
    setNewCategory("");
    setNewLyrics("");
  };

  const resetEditPopup = () => {
    setEditCoverFile(null);
    setEditCoverPreview(null);

    setEditAudioFile(null);
    setEditAudioName("");

    setEditTitle("");
    setEditArtist("");
    setEditAlbum("");
    setEditCategory("");   // ✔ đúng state
    setEditLyrics("");
  };

  // ============================
  // PHÂN TRANG FRONTEND
  // ============================
  const ITEMS_PER_PAGE = 15;

  const startIndex = (page - 1) * ITEMS_PER_PAGE;

  const paginatedSongs = filteredSongs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setTotalPages(Math.ceil(filteredSongs.length / ITEMS_PER_PAGE));
  }, [filteredSongs]);


  return (
    
    <div className="admin-user-container">
      {/* HEADER */}
      <div className="admin-user-header"></div>
        <h2 className="um-title">Quản lý bài hát</h2>
        <div className="um-grid">
          {/* ACTIVE SONGS */}
          <div
            className={`um-card ${activeTab === "active" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("active");
              setOpenMenu(null);      //  FIX
            }}

          >
            <h3>Active</h3>
            <p>Bài hát đang hiển thị</p>
          </div>

          {/* PENDING SONGS */}
          <div
            className={`um-card ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("pending");
              setOpenMenu(null);      //  FIX
            }}
          >
            <h3>Pending</h3>
            <p>Bài hát đang chờ duyệt</p>
          </div>

          {/* REPORT SONGS */}
          <div
            className={`um-card ${activeTab === "report" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("report");
              setOpenMenu(null);      //  FIX
            }}

          >
            <h3>Report</h3>
            <p>Báo cáo từ người dùng</p>
          </div>
        </div>

        <div className="admin-user-header">
          <div className="google-search-bar">
            <FiSearch className="google-search-icon" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
              className="google-search-input"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setPage(1);   // ⭐ RESET VỀ TRANG 1 KHI SEARCH
              }}
            />
          </div>

          {activeTab !== "report" && (
            <button className="admin-add-btn" onClick={() => setShowAddPopup(true)}>
              + Thêm bài hát
            </button>
          )}

        </div>
      <div className="um-table-area">
        {activeTab === "report" ? (
          <ReportTab />
        ) : (
          <>
          
          {/* TABLE */}
          <table className="admin-table">
            <thead>
              <tr>
                <th>STT</th>
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
              {paginatedSongs.map((song, index) => (
                <tr key={song.id}>
                  <td>{startIndex + index + 1}</td>
                  {/* Cover */}
                  <td>
                    <img src={song.coverUrl} alt="" className="ms-cover-thumb" />
                  </td>

                  <td
                    className="song-title-clickable"
                    onClick={() => setShowViewPopup(song)}
                    style={{ cursor: "pointer", color: "#ffffff" }}
                  >
                    {song.title}
                  </td>

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
                          : song.status === "HIDDEN"
                          ? "hidden"
                          : "public")
                      }
                    >
                      {song.status === "PENDING"
                        ? "Pending"
                        : song.status === "HIDDEN"
                        ? "Hidden"
                        : "Public"}
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

                            setEditTitle(song.title);
                            setEditLyrics(song.lyrics || "");  
                            setEditLyricsLanguage(song.lyricsLanguage ?? "vi");

                            // Nghệ sĩ object
                            const artistObj = artists.find(a => a.id === song.artistId);
                            setSelectedEditArtist(artistObj || null);
                            setEditArtist(artistObj?.id || "");

                            if (artistObj) {
                              fetch(`http://localhost:3000/admin/manage-song/albums/by-artist/${artistObj.id}`)
                                .then(res => res.json())
                                .then(albumData => {
                                  setFilteredAlbumsEdit(albumData);

                                  const match = albumData.find(a => a.title === song.albumName);
                                  setSelectedEditAlbum(match || null);
                                  setEditAlbum(match?.id || "");
                                });
                            }



                            // Album object
                            const albumObj = albums.find(a => a.title === song.albumName);
                            setSelectedEditAlbum(albumObj || null);
                            setEditAlbum(albumObj?.id || "");

                            // Thể loại object
                            // Thể loại object - MATCH BẰNG TÊN
                            const categoryObj = genres.find(g => g.name === song.genre);
                            setSelectedEditCategory(categoryObj || null);
                            setEditCategory(categoryObj?.id || "");


                            // Ảnh + nhạc
                            setEditCoverPreview(song.coverUrl);
                            setEditCoverFile(null);

                            setEditAudioFile(null);
                            setEditAudioName("");
                        }}>
                            Sửa
                        </button>

                        {/* Chỉ hiển thị nút Hiện/Ẩn khi bài đã APPROVED/HIDDEN */}
                        {(song.status === "APPROVED" || song.status === "HIDDEN") && (
                          <button onClick={() => handleToggleActive(song.id)}>
                            {song.status === "APPROVED" ? "Ẩn" : "Hiện"}
                          </button>
                        )}


                        {song.status === "PENDING" && (
                          <button onClick={() => handleApprove(song.id)}>Duyệt</button>
                        )}

                        {/* Hiện nút TỪ CHỐI chỉ khi Pending */}
                        {song.status === "PENDING" && (
                          <button
                            className="Reject"
                            onClick={() => handleReject(song.id)}
                          >
                            Từ chối
                          </button>
                        )}


                        <button
                          className="danger"
                          onClick={() => handleSoftDelete(song.id)}
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
        
          {/* PAGINATION */}
          <div className="song-pagination-clean">
            <button
              className="song-page-arrow"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ←
            </button>

            <span className="song-page-text">
              Trang {page} / {totalPages}
            </span>

            <button
              className="song-page-arrow"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              →
            </button>
          </div>

        </>
      )}

      </div>

      {/* POPUP THÊM BÀI HÁT */}
      {showAddPopup && (
        <div
          className="popup-overlay"
          onClick={(e) => {
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
                  <ArtistDropdown
                    artists={artists}
                    value={artists.find(a => a.id === Number(newArtist))}
                    onChange={async (artist) => {
                      setNewArtist(artist.id);

                      // Gọi API backend để lấy album theo artist
                      const res = await fetch(
                        `http://localhost:3000/admin/manage-song/albums/by-artist/${artist.id}`
                      );
                      const data = await res.json();

                      setFilteredAlbumsAdd(data);
                      setNewAlbum("");          // reset album
                    }}
                  />

                </div>
                
                {/* NGHỆ SĨ PHỤ */}
                <div id="add-song-popup" className="popup-group">
                  <label>Nghệ sĩ collab</label>

                  <div className="multi-select">
                    {artists.map((a) => {
                      const isChecked = featuredArtists.includes(a.id);

                      return (
                        <label
                          key={a.id}
                          className={`multi-select-item ${isChecked ? "checked" : ""}`}
                        >
                          <input
                            type="checkbox"
                            value={a.id}
                            checked={isChecked}
                            onChange={(e) => {
                              const id = Number(e.target.value);
                              if (e.target.checked) {
                                setFeaturedArtists([...featuredArtists, id]);
                              } else {
                                setFeaturedArtists(featuredArtists.filter((v) => v !== id));
                              }
                            }}
                          />
                          {a.stage_name}
                        </label>
                      );
                    })}
                  </div>

                </div>


                <div className="popup-group">
                  <label>Ảnh bìa</label>

                  {previewCover ? (
                    <div
                      className="spotify-preview-wrapper"
                      onClick={(e) => e.stopPropagation()}   // ✅ Sửa từ onMouseDown → onClick
                    >
                      <img src={previewCover} className="spotify-upload-preview" />

                      <button
                        className="spotify-remove-btn"
                        onClick={(e) => {                     
                          e.stopPropagation();
                          setCoverFile(null);
                          setPreviewCover(null);
                          const input = document.getElementById("addcoverUpload");
                          if (input) input.value = "";
                        }}
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  ) : (
                    <div
                      className="spotify-upload-area"
                      onClick={() => {                         
                        const input = document.getElementById("addcoverUpload");
                        if (input) {
                          input.value = "";
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
                        id="addcoverUpload"
                        type="file"
                        accept="image/*"
                        className="spotify-upload-input"
                        onClick={(e) => e.stopPropagation()}       
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setCoverFile(file);
                            setPreviewCover(URL.createObjectURL(file));
                          }
                          e.target.value = "";
                        }}
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* =====================
                  CỘT PHẢI
              ====================== */}
              <div className="popup-col">
                <div className="popup-group">
                  <label>Album</label>
                  <AlbumDropdown
                    albums={filteredAlbumsAdd}
                    value={filteredAlbumsAdd.find(a => a.id === Number(newAlbum))}
                    onChange={(album) => setNewAlbum(album.id)}
                  />
                </div>

                {/* THỂ LOẠI */}
                <div className="popup-group">
                  <label>Thể loại</label>
                  <GenreDropdown
                    genres={genres}
                    value={genres.find(g => g.id === Number(newCategory))}
                    onChange={(genre) => setNewCategory(genre.id)}
                  />

                </div>

                {/* FILE NHẠC */}
                <div className="popup-group">
                  <div className="audio-upload-group">
                    <label>File nhạc</label>

                    <div
                      className="audio-upload-area"
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


                {/* LYRICS */}
                <div className="popup-group">
                  <label>Lyrics (không bắt buộc)</label>

                  {/* dropdown chọn ngôn ngữ */}
                  <select
                    className="lyrics-language-select"
                    value={newLyricsLanguage}
                    onChange={(e) => setNewLyricsLanguage(e.target.value)}
                  >
                    <option value="vi">Tiếng Việt (vi)</option>
                    <option value="en">English (en)</option>
                  </select>

                  <textarea
                    placeholder="Nhập lyric bài hát..."
                    value={newLyrics}
                    onChange={(e) => setNewLyrics(e.target.value)}
                    className="lyrics-textarea"
                    rows={8}
                  ></textarea>
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
                  fetchSongs();
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

      {/* POPUP LỖI */}
      {showErrorPopup && (
        <div className="success-overlay">
          <div className="success-card">
            <h3 style={{ color: "#ff4d4d" }}>⚠️ Không thể lưu bài hát</h3>
            <p>{errorMessage}</p>

            <div className="success-actions">
              <button
                className="success-btn cancel"
                onClick={() => setShowErrorPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}


      {showDeleteSuccess && (
        <PopupSuccess
          message="Xóa bài hát thành công!"
          onClose={() => setShowDeleteSuccess(false)}
        />
      )}


    
      {/* POPUP THÀNH CÔNG */}
      {showSuccessPopup && (
      <div className="success-overlay">
        <div className="success-card">
          <h3>🎵 Thêm bài hát thành công!</h3>

          <div className="success-actions">
            <button
              className="success-btn cancel"
              onClick={() => {
                setShowSuccessPopup(false);
                setShowAddPopup(false); // đóng popup thêm bài hát
                resetAddPopup();        // reset form
              }}
            >
              OK
            </button>

            <button
              className="success-btn add-more"
              onClick={() => {
                setShowSuccessPopup(false);
                resetAddPopup();        // reset form để thêm bài khác
              }}
            >
              Thêm bài hát khác
            </button>
          </div>
        </div>
      </div>
    )}

    {showEditSuccessPopup && (
      <div className="success-overlay">
        <div className="success-card">
          <h3>✅ Cập nhật bài hát thành công!</h3>

          <div className="success-actions">
            <button
              className="success-btn cancel"
              onClick={() => setShowEditSuccessPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )}



    {/* POPUP XEM BÀI HÁT */}
    {showViewPopup && (
    <div className="popup-overlay" id="view-song-popup" onClick={() => setShowViewPopup(null)}>
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

            {/* NGHỆ SĨ COLLAB */}
            <div className="popup-group">
              <label>Nghệ sĩ collab</label>

              {showViewPopup.songArtists?.filter(sa => !sa.is_primary).length > 0 ? (
                <div className="view-collab-box">
                  {showViewPopup.songArtists
                    .filter(sa => !sa.is_primary)
                    .map(sa => (
                      <span key={sa.artist_id} className="view-collab-tag">
                        {sa.artist?.stage_name}
                      </span>
                    ))}
                </div>
              ) : (
                <input type="text" value="Không có" readOnly />
              )}
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

            {/* NEW: AUDIO PLAYER */}
            <div className="popup-group">
              <label>Nghe thử bài hát</label>
              <audio controls style={{ width: "100%" }}>
                <source src={showViewPopup.audioUrl} type="audio/mpeg" />
              </audio>
            </div>

            {/* LYRICS */}
            {showViewPopup.lyrics && (
              <div className="popup-group">
                <label>Lyrics</label>
                <div className="lyrics-view-box">
                  {showViewPopup.lyrics.split("\n").map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            )}


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
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          resetEditPopup();
          setShowEditPopup(null);
        }
      }}
    >
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>

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
                <ArtistDropdown
                  artists={artists}
                  value={selectedEditArtist}
                  onChange={async (artist) => {
                    setSelectedEditArtist(artist);
                    setEditArtist(artist.id);

                    const res = await fetch(
                      `http://localhost:3000/admin/manage-song/albums/by-artist/${artist.id}`
                    );
                    const data = await res.json();

                    setFilteredAlbumsEdit(data);
                    setEditAlbum("");
                    setSelectedEditAlbum(null);
                  }}
                />

            </div>

            {/* NGHỆ SĨ COLLAB (EDIT) */}
            <div id="edit-song-popup" className="popup-group">
              <label>Nghệ sĩ collab</label>

              <div className="multi-select">
                {artists.map((a) => {
                  const isChecked = editCollabArtists.includes(a.id);

                  return (
                    <label
                      key={a.id}
                      className={`multi-select-item ${isChecked ? "checked" : ""}`}
                    >
                      <input
                        type="checkbox"
                        value={a.id}
                        checked={isChecked}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          if (e.target.checked) {
                            setEditCollabArtists((prev) => [...prev, id]);
                          } else {
                            setEditCollabArtists((prev) => prev.filter(v => v !== id));
                          }
                        }}
                      />
                      {a.stage_name}
                    </label>
                  );
                })}
              </div>
            </div>



            {/* ẢNH BÌA */}
            <div className="popup-group">
              <label>Ảnh bìa</label>

              {editCoverPreview ? (
                // ==== TRƯỜNG HỢP ĐÃ CÓ ẢNH ====
                <div
                  className="spotify-preview-wrapper"
                  onClick={(e) => e.stopPropagation()}   // chặn click lên overlay
                >
                  <img src={editCoverPreview} className="spotify-upload-preview" />

                  <button
                    className="spotify-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditCoverPreview(null);
                      setEditCoverFile(null);
                      document.getElementById("editCoverInput").value = "";
                    }}
                  >
                    Xóa ảnh
                  </button>
                </div>
              ) : (
                // ==== TRƯỜNG HỢP CHƯA CÓ ẢNH ====
                <div
                  className="spotify-upload-area"
                  onClick={(e) => {
                    e.stopPropagation();                // chặn bubble
                    const input = document.getElementById("editCoverInput");
                    input.value = "";
                    input.click();                      // MỞ CHỌN FILE 1 LẦN
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setEditCoverFile(file);
                      setEditCoverPreview(URL.createObjectURL(file));
                    }
                  }}
                >
                  <p className="spotify-upload-text">Kéo thả hoặc nhấn để chọn ảnh</p>

                  <input
                    id="editCoverInput"
                    type="file"
                    accept="image/*"
                    className="spotify-upload-input"
                    style={{ display: "none" }}           // ẨN INPUT
                    onClick={(e) => e.stopPropagation()}  // chặn click xuyên
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


          </div>

          {/* CỘT PHẢI */}
          <div className="popup-col">

            <div className="popup-group">
              <label>Album</label>
              <AlbumDropdown
                albums={filteredAlbumsEdit}
                value={filteredAlbumsEdit.find(a => a.id === Number(editAlbum))}
                onChange={(album) => {
                  setSelectedEditAlbum(album);
                  setEditAlbum(album.id);
                }}
              />

            </div>

            <div className="popup-group">
              <label>Thể loại</label>
              <GenreDropdown
                genres={genres}
                value={selectedEditCategory}
                onChange={(genre) => {
                    setSelectedEditCategory(genre);
                    setEditCategory(genre.id);
                }}
              />

            </div>

            <div className="popup-group">
              <label>File nhạc</label>

              {editAudioName ? (
                // ==== ĐÃ CÓ FILE (hiện tên + nút xóa) ====
                <div
                  className="spotify-preview-wrapper"
                  onClick={(e) => e.stopPropagation()}  // chặn click nổi bọt
                >
                  <p className="audio-file-name">{editAudioName}</p>

                  <button
                    className="spotify-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();              // chặn click ra overlay
                      setEditAudioFile(null);
                      setEditAudioName("");
                      document.getElementById("editAudioUpload").value = "";
                    }}
                  >
                    Xóa File
                  </button>
                </div>
              ) : (
                // ==== CHƯA CÓ FILE (upload mới) ====
                <div
                  className="audio-upload-area"
                  onClick={(e) => {
                    e.stopPropagation();               // chặn click lên overlay
                    const input = document.getElementById("editAudioUpload");
                    input.value = "";
                    input.click();                     // MỞ 1 LẦN DUY NHẤT
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setEditAudioFile(file);
                      setEditAudioName(file.name);
                    }
                  }}
                >
                  <p className="audio-upload-text">Kéo thả hoặc nhấn để chọn file nhạc</p>

                  <input
                    id="editAudioUpload"
                    type="file"
                    accept="audio/*"
                    className="audio-upload-input"
                    style={{ display: "none" }}          // ẨN INPUT
                    onClick={(e) => e.stopPropagation()} // NGĂN CLICK XUYÊN
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditAudioFile(file);
                        setEditAudioName(file.name);
                      }
                      e.target.value = "";               // cho phép chọn lại cùng file
                    }}
                  />
                </div>
              )}
            </div>

            <div className="popup-group">
              <label>Lyrics (không bắt buộc)</label>

              {/* chọn ngôn ngữ */}
              <select
                className="lyrics-language-select"
                value={editLyricsLanguage}
                onChange={(e) => setEditLyricsLanguage(e.target.value)}
              >
                <option value="vi">Tiếng Việt (vi)</option>
                <option value="en">English (en)</option>
              </select>

              <textarea
                placeholder="Nhập lyric bài hát..."
                value={editLyrics}
                onChange={(e) => setEditLyrics(e.target.value)}
                className="lyrics-textarea"
                rows={8}
              ></textarea>
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

          <button className="popup-save" onClick={handleUpdateSong}>
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
