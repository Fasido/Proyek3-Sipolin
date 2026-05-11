/**
 * services/api.js — SIPOLIN API Service Layer
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Config ─────────────────────────────────────────────────────────────
const BASE_URL = "http://10.0.163.203:3000/api";
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
  (res) => {
    // Pastikan response selalu memiliki struktur success
    if (res.data && !res.data.hasOwnProperty('success')) {
      res.data.success = true;
    }
    return res;
  },
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    // Format error agar konsisten dengan success: false
    if (err.response?.data && !err.response.data.success) {
      err.response.data.success = false;
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
  createRide: (data) => api.post("/orders/pol_ride", data),  // ← pol_ride
  createSend: (data) => api.post("/orders/pol_send", data),  // ← pol_send
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
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ─── Chat API ────────────────────────────────────────────────────
export const chatAPI = {
  getRooms: () => api.get("/chat/rooms"),
  getRoomById: (roomId) => api.get(`/chat/rooms/${roomId}`),
  getMessages: (roomId, cursor = null) => api.get(`/chat/rooms/${roomId}/messages`, { params: { cursor, limit: 30 } }),
  getOrCreateRoom: (orderId, customerId, driverId) => api.post("/chat/rooms", { orderId, customerId, driverId }),
  markRead: (roomId) => api.post(`/chat/rooms/${roomId}/read`),
};

export default api;