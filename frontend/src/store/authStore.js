import { create } from 'zustand';
import { authAPI, userAPI } from '../services/api';

const TOKEN_KEY = 'rbac_token';
const USER_KEY = 'rbac_user';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem(TOKEN_KEY) || null,
  isLoading: false,
  isInitialized: false,

  // ─── Login ──────────────────────────────────────────────────────────────────
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.login(credentials);
      const { token, user } = data.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({ token, user, isLoading: false });
      return { success: true, user };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  },

  // ─── Register ───────────────────────────────────────────────────────────────
  register: async (userData) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.register(userData);
      set({ isLoading: false });
      return { success: true, message: data.message };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  },

  // ─── Logout ─────────────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, isInitialized: false });
  },

  // ─── Refresh user from server ────────────────────────────────────────────────
  refreshUser: async () => {
    const { token } = get();
    if (!token) {
      set({ isInitialized: true });
      return;
    }
    try {
      const { data } = await userAPI.getMe();
      const user = data.data.user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, isInitialized: true });
    } catch {
      // Token invalid — clear state
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ user: null, token: null, isInitialized: true });
    }
  },

  // ─── Update local user state ─────────────────────────────────────────────────
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  setInitialized: () => set({ isInitialized: true }),
}));
