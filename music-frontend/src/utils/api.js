// music-frontend/src/utils/api.js (BẢN FINAL ĐẦY ĐỦ NHẤT)
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; 

// 1. TẠO INSTANCE AXIOS (Dùng cho mọi request CẦN TOKEN)
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. INTERCEPTOR (Tự động gửi Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// =====================================
// === CÁC HÀM GET DỮ LIỆU ===

export const fetchSongs = async () => {
  try {
    const response = await api.get('/song'); 
    return response.data;
  } catch (error) {
    console.error('Lỗi khi fetch songs:', error);
    throw error; 
  }
};

export const fetchFeaturedArtists = async () => {
  try {
    const response = await api.get('/artists/featured');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tải nghệ sĩ:', error);
    throw error; 
  }
};

export const fetchCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải Thể loại:', error);
        return [];
    }
};

export const fetchSongsByGenre = async (genreName) => {
    try {
        const response = await api.get(`/song/genre/${genreName}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải nhạc theo thể loại:', error);
        return []; 
    }
};

export const fetchAllSongs = async (genre, artistId) => {
    try {
        const params = new URLSearchParams();
        if (genre) params.append('genre', genre);
        if (artistId) params.append('artistId', artistId);

        const response = await api.get(`/song/all?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải tất cả bài hát:', error);
        return []; 
    }
};

export const fetchAllArtists = async () => {
    try {
        const response = await api.get('/artists/all');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải tất cả nghệ sĩ:', error);
        return []; 
    }
};


// === CÁC HÀM AUTH ===

export const loginApi = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken); 
  }
  return response.data; 
};

export const registerApi = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const verifyOtpApi = (data) => api.post('/auth/verify-otp', data);
export const resendOtpApi = (data) => api.post('/auth/resend-otp', data);
export const forgotPasswordApi = (data) => api.post('/auth/forgot-password', data);
export const resetPasswordOtpApi = (data) => api.post('/auth/reset-password-otp', data);

// === HÀM BỊ THIẾU (ĐỔI MẬT KHẨU) ===
export const changePasswordApi = async (data) => {
    try {
        const response = await api.post('/auth/change-password', data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        throw error;
    }
};

// === CÁC HÀM LIKE ===
export const fetchLikedSongs = async () => {
    try {
        const response = await api.get('/like/my-songs');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải bài hát đã thích:', error);
        return [];
    }
};

// === CÁC HÀM PLAYLIST ===
export const fetchMyPlaylists = async () => {
    try {
        const response = await api.get('/playlists/my-playlists');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải playlists:', error);
        return [];
    }
};

export const addSongToPlaylistApi = async (playlistId, songId) => {
    try {
        const response = await api.post(`/playlists/${playlistId}/add-song`, { songId: songId });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi thêm bài hát vào playlist:', error);
        throw error; 
    }
};

export const createPlaylistApi = async (playlistData) => {
    try {
        const response = await api.post('/playlists', playlistData); 
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tạo playlist:', error);
        throw error; 
    }
};

// === CÁC HÀM PROFILE (BỊ THIẾU) ===
export const getMyProfileApi = async () => {
    try {
        const response = await api.get('/users/me');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải profile:', error);
        throw error;
    }
};

export const updateMyProfileApi = async (data) => {
    try {
        const response = await api.patch('/users/me', data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật profile:', error);
        throw error;
    }
};

/* === API MỚI: TÌM KIẾM (SEARCH) === */
export const searchApi = async (query) => {
    if (!query) return { songs: [], artists: [], albums: [] }; // Không gọi API nếu query rỗng
    try {
        // Dùng 'api' (có interceptor) vì API /search là Optional
        const response = await api.get(`/search?q=${query}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        return { songs: [], artists: [], albums: [] };
    }
};


export const requestPasswordResetOtpApi = async () => {
    try {
        // endpoint mới của AuthController
        const response = await api.post('/auth/request-reset-otp'); 
        return response.data;
    } catch (error) {
        console.error('Lỗi khi yêu cầu OTP (đã đăng nhập):', error);
        throw error;
    }
};

/* === API MỚI: FOLLOW (CẦN TOKEN) === */
export const checkFollowStatusApi = async (artistId) => {
    try {
        // Dùng 'api' (đã có interceptor)
        const response = await api.get(`/follow/status/${artistId}`);
        return response.data; // Trả về { isFollowing: true/false }
    } catch (error) {
        console.error('Lỗi khi kiểm tra follow:', error);
        return { isFollowing: false }; // Mặc định là false nếu lỗi
    }
};

export const toggleFollowApi = async (artistId) => {
    try {
        const response = await api.post(`/follow/${artistId}`);
        return response.data; // Trả về { isFollowing: true/false }
    } catch (error) {
        console.error('Lỗi khi follow/unfollow:', error);
        throw error; // Ném lỗi để component bắt
    }
};

/* === API MỚI: LẤY DANH SÁCH ĐANG THEO DÕI (CẦN TOKEN) === */
export const fetchMyFollowingApi = async () => {
    try {
        const response = await api.get('/follow/my-following');
        return response.data; // Trả về mảng [Follow]
    } catch (error) {
        console.error('Lỗi khi tải danh sách đang theo dõi:', error);
        return [];
    }
};

/* === API MỚI: LẤY PROFILE CÔNG KHAI === */
export const getPublicProfileApi = async (username) => {
    try {
        const response = await api.get(`/users/public/${username}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải profile công khai:', error);
        throw error;
    }
};

/* === API MỚI: LẤY CHI TIẾT PLAYLIST CÔNG KHAI === */
export const getPublicPlaylistApi = async (playlistId) => {
    try {
        const response = await api.get(`/playlists/${playlistId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải chi tiết playlist:', error);
        throw error;
    }
};

/* === API MỚI: LẤY CHI TIẾT ALBUM === */
export const fetchAlbumDetailApi = async (albumId) => {
    try {
        const response = await api.get(`/albums/${albumId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải chi tiết album:', error);
        throw error;
    }
};

/* === API MỚI: LẤY TẤT CẢ ALBUM === */
export const fetchAllAlbumsApi = async () => {
    try {
        const response = await api.get('/albums/all');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải tất cả album:', error);
        return [];
    }
};


export const registerArtistApi = async (stageName) => {
    try {
        // Dùng 'api' (đã có interceptor)
        const response = await api.post('/artists/register', { stageName: stageName });
        return response.data;
    } catch (error){
        console.error('Lỗi khi đăng ký nghệ sĩ:', error);
        throw error; // Ném lỗi để component (Form) bắt
    }
};

/* === API MỚI: QUẢN LÝ NGHỆ SĨ (CẦN TOKEN) === */
export const getMyArtistProfileApi = async () => {
    try {
        const response = await api.get('/artists/me');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải hồ sơ nghệ sĩ:', error);
        throw error;
    }
};

// Cần dùng FormData vì có file
export const updateMyArtistProfileApi = async (formData) => {
    try {
        const response = await api.patch('/artists/me', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Quan trọng
            },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật hồ sơ nghệ sĩ:', error);
        throw error;
    }
};

/* === API MỚI: QUẢN LÝ ALBUM CỦA NGHỆ SĨ (CẦN TOKEN) === */

// (1) Lấy danh sách album
export const getMyAlbumsApi = async () => {
    try {
        const response = await api.get('/albums/my-albums');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải album của tôi:', error);
        throw error;
    }
};

// (2) Tạo album mới (dùng FormData)
export const createAlbumApi = async (formData) => {
    try {
        const response = await api.post('/albums', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tạo album:', error);
        throw error; 
    }
};

// (3) Sửa album (dùng FormData)
export const updateAlbumApi = async (albumId, formData) => {
    try {
        // API PATCH /albums/my/:id (Backend đã tạo)
        const response = await api.patch(`/albums/my/${albumId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật album:', error);
        throw error; 
    }
};

// (4) Xóa album
export const deleteMyAlbumApi = async (id) => {
    try {
        const response = await api.delete(`/albums/my/${id}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi xóa album:', error);
        throw error;
    }
};