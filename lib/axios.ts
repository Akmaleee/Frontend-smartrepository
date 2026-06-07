import axios from 'axios';
import Cookies from 'js-cookie';

// Murni mengambil Base URL dari environment variable (.env)
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Otomatis tambahkan Bearer Token jika ada
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Tangani 401 Unauthorized (Token Expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus semua data sesi di client
      Cookies.remove('access_token');
      Cookies.remove('user_name');
      Cookies.remove('user_role');
      
      // Paksa redirect ke login
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);