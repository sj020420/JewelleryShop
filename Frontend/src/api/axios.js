import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin JWT automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sajAdminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Central 401 handling for the admin panel
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('sajAdminToken');
      localStorage.removeItem('sajAdmin');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
