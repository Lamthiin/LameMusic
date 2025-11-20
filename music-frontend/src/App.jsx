// music-frontend/src/App.jsx (FULL CODE SỬA LỖI FINAL)
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Layouts
import MainAppLayout from './components/MainAppLayout'; 
import AdminRoute from './components/AdminRoute'; 
import ProtectedRoute from './components/ProtectedRoute'; // <-- (1) IMPORT GUARD
import ProfileLayout from './pages/ProfileUser/ProfileLayout'; // <-- (2) IMPORT LAYOUT MỚI
import AdminLayout from "./components/admin/AdminLayout";

// Import Trang
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminPage from './pages/AdminPage';
import SongDetail from './pages/SongDetail'; 
import ArtistDetail from './pages/ArtistDetail'; 
import LikedSongsPage from './pages/LikedSongsPage';
import GenreDetailPage from './pages/GenreDetailPage';
import AllSongsPage from './pages/AllSongsPage'; 
import AllArtistsPage from './pages/AllArtistsPage';
//Import Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import ManageUser from "./pages/admin/ManageUser";
import ManageArtist from "./pages/admin/ManageArtist";
import ManageAlbum from "./pages/admin/ManageAlbum";
import ManageSong from "./pages/admin/ManageSong";
import AdminCustomerPage from "./pages/admin/AdminCustomerPage";
import AdminArtistPage from "./pages/admin/AdminArtistPage";
import AdminAccountPage from "./pages/admin/AdminAccountPage";


// (3) IMPORT CÁC TRANG CON CỦA PROFILE
import ProfileInfo from './pages/ProfileUser/ProfileInfo';
import ProfilePlaylists from './pages/ProfileUser/ProfilePlaylists';
import ProfileFollowing from './pages/ProfileUser/ProfileFollowing'; // <-- (1) IMPORT MỚI
import PlaylistDetailPage from './pages/PlaylistDetailPage'; // <-- (2) IMPORT MỚI
import PublicProfileLayout from './pages/ProfileUser/PublicProfileLayout';
import PublicProfileFollowing from './pages/ProfileUser/PublicProfileFollowing';
import PublicProfileLikes from './pages/ProfileUser/PublicProfileLikes';
import PublicProfilePlaylists from './pages/ProfileUser/PublicProfilePlaylists';
import AlbumDetailPage from './pages/AlbumDetailPage'; // <-- (1) IMPORT ALBUM DETAIL MỚI
import AllAlbumsPage from './pages/AllAlbumsPage'; // <-- (2) LỖI ĐÃ SỬA: IMPORT ALL ALBUMS MỚI
import ArtistRegistrationPage from './pages/ArtistRegistrationPage'; // <-- (2) IMPORT MỚI
import ArtistDashboardLayout from './pages/ArtistDashboard/ArtistDashboardLayout'; // <-- (1) IMPORT MỚI
import ArtistInfo from './pages/ArtistDashboard/ArtistInfo'; // <-- (2) IMPORT MỚI
import ArtistAlbums from './pages/ArtistDashboard/ArtistAlbums'; // <-- (1) IMPORT MỚI
import ArtistSongs from './pages/ArtistDashboard/ArtistSongs'; // <-- (1) IMPORT MỚI

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

          {/* Trang chọn 3 mục */}
          <Route path="users" element={<ManageUser />} />

          {/* 3 trang con
          <Route path="users/customers" element={<AdminCustomerPage />} />
          <Route path="users/artists" element={<AdminArtistPage />} />
          <Route path="users/admins" element={<AdminAccountPage />} /> */}

          {/* Các mục quản lý khác */}
          <Route path="artists" element={<ManageArtist />} />
          <Route path="albums" element={<ManageAlbum />} />
          <Route path="songs" element={<ManageSong />} />

        </Route>
      </Route>

      <Route path="*" element={<div>404: Không tìm thấy trang này.</div>} />
    </Routes>
  );
}

export default App;