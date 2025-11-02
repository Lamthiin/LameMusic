// music-frontend/src/utils/api.js (FULL CODE)
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor (tự động gửi Token)
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


// Hàm lấy Bài hát
export const fetchSongs = async () => {
  try {
    const response = await api.get('/song'); 
    return response.data;
  } catch (error) {
    console.error('Lỗi khi fetch songs:', error);
    return []; 
  }
};

// === HÀM LẤY NGHỆ SĨ NỔI BẬT (MỚI) ===
export const fetchFeaturedArtists = async () => {
  try {
    const response = await api.get('/artists/featured');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tải nghệ sĩ:', error);
    return [];
  }
};
// ======================================


// Hàm Login
export const loginApi = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken); 
  }
  return response.data;
};

// Hàm Register
export const registerApi = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// Cần export tất cả các hàm cần thiết (dù dùng export default hay named)
// export { fetchSongs, loginApi, registerApi, fetchFeaturedArtists };