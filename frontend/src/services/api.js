import axios from 'axios';

const API_BASE_URL = 'https://rbac-ivxz.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
// ─── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rbac_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 globally ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rbac_token');
      localStorage.removeItem('rbac_user');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ─── User API ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/users/me'),
  getAll: (params) => api.get('/users', { params }),
  getPending: () => api.get('/users/pending'),
  getStats: () => api.get('/users/stats'),
  approve: (id) => api.patch(`/users/${id}/approve`),
  reject: (id, reason) => api.patch(`/users/${id}/reject`, { reason }),
};

export const taskAPI = {
  create: (data) => api.post('/tasks', data),
  getMine: () => api.get('/tasks/my'),
  getAll: () => api.get('/tasks'),
};

export default api;
