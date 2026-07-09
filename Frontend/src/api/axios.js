import axios from 'axios';

// Falls back to the Render backend if VITE_API_URL isn't set.
// IMPORTANT: in Vercel's project settings, VITE_API_URL must be either
// unset, or set to exactly https://jewelleryshop-1-0ofj.onrender.com
// (no trailing slash, no "/api" in it — "/api" is appended below).
const API_ROOT =
  (import.meta.env.VITE_API_URL || 'https://jewelleryshop-1-0ofj.onrender.com').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach admin JWT automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sajAdminToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Central 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname.startsWith('/admin')
    ) {
      localStorage.removeItem('sajAdminToken');
      localStorage.removeItem('sajAdmin');

      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ROOT}${path}`;
}

export default api;
