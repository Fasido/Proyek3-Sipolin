/**
 * services/api.js — SIPOLIN API Service Layer
 * ─────────────────────────────────────────────
 * Centralised Axios instance with:
 * • Auto token attachment
 * • 401 cleanup
 * • All domain API namespaces
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL   = 'http://10.0.166.127:3000/api';
const TOKEN_KEY  = '@sipolin_token';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: attach Bearer token ─────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ─── Response Interceptor: clear token on 401 ────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) await AsyncStorage.removeItem(TOKEN_KEY);
    return Promise.reject(err);
  }
);

// ─── Token Manager ────────────────────────────────────────────────────────────
export const tokenManager = {
  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  setToken: (token) => AsyncStorage.setItem(TOKEN_KEY, token),
  removeToken: () => AsyncStorage.removeItem(TOKEN_KEY),
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (email, password, name, nim, phone, role = 'user', plateNumber = null, vehicleDetail = null) =>
    api.post('/auth/register', { email, password, name, nim, phone, role, plateNumber, vehicleDetail }),
  login:   (email, password) => api.post('/auth/login', { email, password }),
  refresh: (token)          => api.post('/auth/refresh', { token }),
};

// ─── Users API ────────────────────────────────────────────────────────────────
export const usersAPI = {
  /** Fetch the authenticated user's own profile */
  getProfile: () =>
    api.get('/users/profile'),

  /** Update name, phone, nim */
  updateProfile: (data) =>
    api.put('/users/profile', data),

  /** Upload profile picture (base64 data URI or HTTPS URL) */
  updateProfilePicture: (imageData) =>
    api.put('/users/profile-picture', { profilePicture: imageData }),

  /** Remove profile picture */
  removeProfilePicture: () =>
    api.delete('/users/profile-picture'),

  /**
   * ★ Driver → push current GPS coordinates to the server.
   * Called every ~5 seconds from useDriverLocation hook.
   *
   * @param {{ latitude: number, longitude: number }} coords
   * @returns {Promise<{ success: boolean, latitude: number, longitude: number, updatedAt: string }>}
   */
  updateLocation: ({ latitude, longitude }) =>
    api.put('/users/location', { latitude, longitude }),

  /**
   * ★ Customer → poll a driver's latest coordinates.
   * Called every POLL_INTERVAL ms from the tracking screen.
   *
   * @param {string} driverUserId — the driver's user ID (from Order.driverId)
   * @returns {Promise<DriverLocationResponse>} see typedef below
   */
  getDriverLocation: (driverUserId) =>
    api.get(`/users/${driverUserId}/location`),

  /** Aggregated stats (orders, notifications) */
  getStats: () =>
    api.get('/users/stats'),
};

// ─── Orders API ───────────────────────────────────────────────────────────────
export const ordersAPI = {
  getAll:  (params)   => api.get('/orders', { params }),
  getById: (id)       => api.get(`/orders/${id}`),
  create:  (data)     => api.post('/orders', data),
  update:  (id, data) => api.put(`/orders/${id}`, data),
  delete:  (id)       => api.delete(`/orders/${id}`),
  
  // 👉 TAMBAHAN UNTUK FITUR HISTORI (INI YANG BIKIN ERROR HILANG):
  getHistory: (params) => api.get('/orders/history', { params }),
  getHistorySummary: () => api.get('/orders/history/summary'),
};

// ─── Notifications API ────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll:      ()   => api.get('/notifications'),
  markRead:    (id) => api.put(`/notifications/${id}/read`),
  markAllRead: ()   => api.put('/notifications/read-all'),
};

export default api;