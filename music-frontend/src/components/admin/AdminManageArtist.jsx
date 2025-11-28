// import React, { useState, useEffect } from "react";
// import axios from "axios";

// import "./AdminManageArtist.css";

// import ArtistPendingList from "./ArtistPendingList.jsx";
// import ArtistActiveList from "./ArtistActiveList.jsx";
// import ArtistRejectedList from "./ArtistRejectedList.jsx";

// const AdminManageArtist = () => {
//   const [tab, setTab] = useState("pending");

//   const [artistsPending, setArtistsPending] = useState([]);
//   const [artistsActive, setArtistsActive] = useState([]);
//   const [artistsRejected, setArtistsRejected] = useState([]);

//   useEffect(() => {
//     loadPending();
//     loadActive();
//     loadRejected();
//   }, []);

//   // ===========================
//   // LOAD PENDING
//   // ===========================
//   const loadPending = async () => {
//     try {
//       const res = await axios.get("http://localhost:3000/admin/artists/pending");
//       Array.isArray(res.data) ? setArtistsPending(res.data) : setArtistsPending([]);
//     } catch (err) {
//       console.error("LOAD PENDING ERROR:", err);
//       setArtistsPending([]);
//     }
//   };

//   // ===========================
//   // LOAD ACTIVE
//   // ===========================
//   const loadActive = async () => {
//     try {
//       const res = await axios.get("http://localhost:3000/admin/artists/active");
//       Array.isArray(res.data) ? setArtistsActive(res.data) : setArtistsActive([]);
//     } catch (err) {
//       console.error("LOAD ACTIVE ERROR:", err);
//       setArtistsActive([]);
//     }
//   };

//   // ===========================
//   // LOAD REJECTED
//   // ===========================
//   const loadRejected = async () => {
//     try {
//       const res = await axios.get("http://localhost:3000/admin/artists/rejected");
//       Array.isArray(res.data) ? setArtistsRejected(res.data) : setArtistsRejected([]);
//     } catch (err) {
//       console.error("LOAD REJECTED ERROR:", err);
//       setArtistsRejected([]);
//     }
//   };

//   // ===========================
//   // APPROVE
//   // ===========================
//   const approve = async (id) => {
//     try {
//       await axios.patch(`http://localhost:3000/admin/artists/${id}/approve`);
//       loadPending();
//       loadActive();
//       loadRejected();
//     } catch (err) {
//       console.error("APPROVE ERROR:", err);
//     }
//   };

//   // ===========================
//   // REJECT — ⭐ BỔ SUNG
//   // ===========================
//   const reject = async (id) => {
//     if (!window.confirm("Bạn có chắc muốn từ chối hồ sơ nghệ sĩ này?")) return;

//     try {
//       await axios.patch(`http://localhost:3000/admin/artists/${id}/reject`);
//       loadPending();
//       loadRejected();
//       loadActive();
//     } catch (err) {
//       console.error("REJECT ERROR:", err);
//     }
//   };

//   return (
//     <div className="admin-artist-container">
//       <h1 className="page-title">Quản lý nghệ sĩ</h1>

//       {/* Tabs */}
//       <div className="artist-tabs">
//         <button
//           className={`artist-tab ${tab === "pending" ? "active" : ""}`}
//           onClick={() => setTab("pending")}
//         >
//           Chờ duyệt
//         </button>

//         <button
//           className={`artist-tab ${tab === "active" ? "active" : ""}`}
//           onClick={() => setTab("active")}
//         >
//           Hoạt động
//         </button>

//         <button
//           className={`artist-tab ${tab === "rejected" ? "active" : ""}`}
//           onClick={() => setTab("rejected")}
//         >
//           Bị từ chối
//         </button>
//       </div>

//       {/* TAB PENDING */}
//       {tab === "pending" && (
//         <ArtistPendingList 
//           artists={artistsPending} 
//           approve={approve} 
//           reject={reject}      // ⭐ TRUYỀN XUỐNG LIST
//         />
//       )}

//       {/* TAB ACTIVE */}
//       {tab === "active" && (
//         <ArtistActiveList artists={artistsActive} refresh={loadActive} />
//       )}

//       {/* TAB REJECTED */}
//       {tab === "rejected" && (
//         <ArtistRejectedList artists={artistsRejected} refresh={loadRejected} />
//       )}
//     </div>
//   );
// };

// export default AdminManageArtist;
