// music-frontend/src/App.jsx (FULL CODE SỬA LỖI FINAL)
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Layouts
import MainAppLayout from './components/user/MainAppLayout'; 
import AdminRoute from './components/user/AdminRoute'; 
import ProtectedRoute from './components/user/ProtectedRoute'; // <-- (1) IMPORT GUARD
import ProfileLayout from './pages/user/ProfileUser/ProfileLayout'; // <-- (2) IMPORT LAYOUT MỚI
import AdminLayout from "./components/admin/AdminLayout";

// Import Trang
import Home from './pages/user/Home';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import VerifyOtp from './pages/user/VerifyOtp';
import ForgotPassword from './pages/user/ForgotPassword';
import ResetPassword from './pages/user/ResetPassword';
import AdminPage from './pages/user/AdminPage';
import SongDetail from './pages/user/SongDetail'; 
import ArtistDetail from './pages/user/ArtistDetail'; 
import LikedSongsPage from './pages/user/LikedSongsPage';
import GenreDetailPage from './pages/user/GenreDetailPage';
import AllSongsPage from './pages/user/AllSongsPage'; 
import AllArtistsPage from './pages/user/AllArtistsPage';
//Import Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import ManageUser from "./pages/admin/ManageUser";
import ManageArtist from "./pages/admin/ManageArtist";
import ManageAlbum from "./pages/admin/ManageAlbum";
import ManageSong from "./pages/admin/ManageSong";
import AdminCustomerPage from "./pages/admin/AdminCustomerPage";
import AdminAccountPage from "./pages/admin/AdminAccountPage";
import AdminArtistDetail from "./pages/admin/AdminArtistDetail";
import ProfileAdmin from "./pages/admin/ProfileAdmin";



// (3) IMPORT CÁC TRANG CON CỦA PROFILE
import ProfileInfo from './pages/user/ProfileUser/ProfileInfo';
import ProfilePlaylists from './pages/user/ProfileUser/ProfilePlaylists';
import ProfileFollowing from './pages/user/ProfileUser/ProfileFollowing'; // <-- (1) IMPORT MỚI
import PlaylistDetailPage from './pages/user/PlaylistDetailPage'; // <-- (2) IMPORT MỚI
import PublicProfileLayout from './pages/user/ProfileUser/PublicProfileLayout';
import PublicProfileFollowing from './pages/user/ProfileUser/PublicProfileFollowing';
import PublicProfileLikes from './pages/user/ProfileUser/PublicProfileLikes';
import PublicProfilePlaylists from './pages/user/ProfileUser/PublicProfilePlaylists';
import AlbumDetailPage from './pages/user/AlbumDetailPage'; // <-- (1) IMPORT ALBUM DETAIL MỚI
import AllAlbumsPage from './pages/user/AllAlbumsPage'; // <-- (2) LỖI ĐÃ SỬA: IMPORT ALL ALBUMS MỚI
import ArtistRegistrationPage from './pages/user/ArtistRegistrationPage'; // <-- (2) IMPORT MỚI
import ArtistDashboardLayout from './pages/ArtistDashboard/ArtistDashboardLayout'; // <-- (1) IMPORT MỚI
import ArtistInfo from './pages/ArtistDashboard/ArtistInfo'; // <-- (2) IMPORT MỚI
import ArtistAlbums from './pages/ArtistDashboard/ArtistAlbums'; // <-- (1) IMPORT MỚI
import ArtistSongs from './pages/ArtistDashboard/ArtistSongs'; // <-- (1) IMPORT MỚI
import AdminChat from './pages/admin/AdminChat';
import SearchResult from './pages/user/SearchResult';
import About from "./pages/user/About";
import Blog from "./pages/user/Blog";
import Contact from "./pages/user/Contact";

function App() {
  return (
    <Routes>
      {/* 1. ROUTE PUBLIC (Không layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* 2. ROUTE CHÍNH (Layout Gốc) */}
      <Route path="/" element={<MainAppLayout />}> 
    <Route path="/about" element={<About />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/contact" element={<Contact />} />
        <Route index element={<Home />} /> 
        <Route path="song/:id" element={<SongDetail />} /> 
        <Route path="artist/:id" element={<ArtistDetail />} /> 
        <Route path="genre/:genreName" element={<GenreDetailPage />} /> 
        <Route path="songs" element={<AllSongsPage />} />
        <Route path="artists" element={<AllArtistsPage />} />
        <Route path="blog" element={<div>Trang Blog (Sắp ra mắt)</div>} />
        <Route path="albums" element={<AllAlbumsPage />} />
        <Route path="album/:id" element={<AlbumDetailPage />} /> 
        {/* === (3) ROUTE ĐĂNG KÝ NGHỆ SĨ MỚI === */}
        <Route path="artist-registration" element={<ArtistRegistrationPage />} />
        {/* ==================================== */}
        <Route path="/search" element={<SearchResult />} />

        {/* === (3) ROUTE PUBLIC PROFILE MỚI (LỒNG NHAU) === */}
        <Route path="profile/:username" element={<PublicProfileLayout />}>
            <Route index element={<PublicProfilePlaylists />} />
            <Route path="playlists" element={<PublicProfilePlaylists />} />
            <Route path="likes" element={<PublicProfileLikes />} />
            <Route path="following" element={<PublicProfileFollowing />} />
        </Route>
        {/* =================================================== */}

        {/* === (3) ROUTE ARTIST DASHBOARD MỚI (BẢO VỆ) === */}
            {/* (Chúng ta sẽ thêm ArtistRouteGuard sau, tạm thời dùng ProtectedRoute) */}
            <Route path="artist-dashboard" element={<ArtistDashboardLayout />}>
                <Route index element={<ArtistInfo />} />
                <Route path="info" element={<ArtistInfo />} />
                {/* (Tạm thời placeholder cho các tab khác) */}
                <Route path="songs" element={<ArtistSongs />} />
                <Route path="albums" element={<ArtistAlbums />} />
            </Route>
        
        {/* (4) ROUTE BẢO VỆ (CẦN LOGIN) */}
        <Route element={<ProtectedRoute />}>
            <Route path="liked-songs" element={<LikedSongsPage />} />
        {/* === (3) ROUTE MỚI === */}
        <Route path="playlist/:id" element={<PlaylistDetailPage />} />
            {/* (5) ROUTE PROFILE MỚI (LỒNG NHAU) */}
            <Route path="profile" element={<ProfileLayout />}>
                <Route index element={<ProfileInfo />} />
                <Route path="info" element={<ProfileInfo />} />
                <Route path="likes" element={<LikedSongsPage />} />
                <Route path="playlists" element={<ProfilePlaylists />} />
                <Route path="following" element={<ProfileFollowing />} /> {/* <-- (2) ROUTE MỚI */}
            </Route>
        </Route>
      </Route>
      
      {/* 3. ROUTE ADMIN (BẢO VỆ RIÊNG - ĐÃ ĐƯA RA NGOÀI) */}
      {/* ADMIN ROUTE (CÓ LAYOUT + SIDEBAR + HEADER) */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>

          {/* Dashboard mặc định */}
          <Route index element={<Dashboard />} />

          <Route path="profile" element={<ProfileAdmin />} />

          {/* Trang chọn 3 mục */}
          <Route path="users" element={<ManageUser />} />

          {/* 3 trang con
          <Route path="users/customers" element={<AdminCustomerPage />} />
          <Route path="users/artists" element={<AdminArtistPage />} />
          <Route path="users/admins" element={<AdminAccountPage />} /> */}

          <Route path="support" element={<AdminChat />} />

          {/* Các mục quản lý khác */}
          <Route path="artists" element={<ManageArtist />} />
          <Route path="albums" element={<ManageAlbum />} />
          <Route path="songs" element={<ManageSong />} />
          <Route path="artists/:id" element={<AdminArtistDetail />} />

        </Route>
      </Route>

      <Route path="*" element={<div>404: Không tìm thấy trang này.</div>} />
    </Routes>
  );
}

export default App;