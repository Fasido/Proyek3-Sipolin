/**
 * services/api.js — SIPOLIN API Service Layer
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Config ─────────────────────────────────────────────────────────────
const BASE_URL = "http://192.168.43.148:3000/api";
const TOKEN_KEY = "@sipolin_token";

// ─── Axios Instance ─────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor ────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ─── Response Interceptor ───────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(err);
  }
);

// ─── Token Manager ──────────────────────────────────────────────────────
export const tokenManager = {
  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  setToken: (token) => AsyncStorage.setItem(TOKEN_KEY, token),
  removeToken: () => AsyncStorage.removeItem(TOKEN_KEY),
};

// ─── Auth API ───────────────────────────────────────────────────────────
export const authAPI = {
  register: (email, password, name, nim, phone, role = "user", plateNumber = null, vehicleDetail = null) =>
    api.post("/auth/register", { email, password, name, nim, phone, role, plateNumber, vehicleDetail }),
  login: (email, password) => api.post("/auth/login", { email, password }),
  refresh: (token) => api.post("/auth/refresh", { token }),
};

// ─── Users API ──────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  updateProfilePicture: (imageData) => api.put("/users/profile-picture", { profilePicture: imageData }),
  removeProfilePicture: () => api.delete("/users/profile-picture"),
  updateLocation: ({ latitude, longitude }) => api.put("/users/location", { latitude, longitude }),
  getDriverLocation: (driverUserId) => api.get(`/users/${driverUserId}/location`),
  getStats: () => api.get("/users/stats"),
};

// ─── Orders API ─────────────────────────────────────────────────────────
export const ordersAPI = {
  getAll: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders", data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  createRide: (data) => api.post("/orders/pol_ride", data),
  createSend: (data) => api.post("/orders/pol_send", data),
  getAvailable: () => api.get("/orders/available"),
  acceptOrder: (id) => api.post(`/orders/${id}/accept`),
  completeOrder: (id) => api.post(`/orders/${id}/complete`),
  getHistory: (params) => api.get("/orders/history", { params }),
  getHistorySummary: () => api.get("/orders/history/summary"),
};

// ─── Notifications API ──────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  // Tambahin ini kalau mau hapus notif
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ─── Chat API (GABUNGAN DARI CLAUDE) ────────────────────────────────────
export const chatAPI = {
  /** Ambil daftar inbox user */
  getRooms: () => 
    api.get("/chat/rooms"),

  /** Ambil metadata satu room */
  getRoomById: (roomId) => 
    api.get(`/chat/rooms/${roomId}`),

  /** Ambil history chat di dalam room (paginated) */
  getMessages: (roomId, cursor = null) => 
    api.get(`/chat/rooms/${roomId}/messages`, { params: { cursor, limit: 30 } }),

  /** Bikin atau ambil room untuk order tertentu */
  getOrCreateRoom: (orderId, customerId, driverId) =>
    api.post("/chat/rooms", { orderId, customerId, driverId }),

  /** Tandai pesan dibaca */
  markRead: (roomId) => 
    api.post(`/chat/rooms/${roomId}/read`),
};

export default api;