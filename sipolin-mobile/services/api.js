import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Base URL ─────────────────────────────────────────────────────────────────
const BASE_URL = "http://10.0.171.88:3000/api";

const TOKEN_KEY = "@sipolin_token";

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: attach token ───────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

// ─── Token Manager ────────────────────────────────────────────────────────────
export const tokenManager = {
  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  setToken: (token) => AsyncStorage.setItem(TOKEN_KEY, token),
  removeToken: () => AsyncStorage.removeItem(TOKEN_KEY),
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  /**
   * Register a new user (Mahasiswa or Mitra Driver).
   *
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @param {string} nim
   * @param {string} phone
   * @param {string} role          - 'user' | 'driver'
   * @param {string} [plateNumber] - Required when role === 'driver'
   * @param {string} [vehicleDetail] - Required when role === 'driver'
   */
  register: (
    email,
    password,
    name,
    nim,
    phone,
    role = "user",
    plateNumber = null,
    vehicleDetail = null,
  ) =>
    api.post("/auth/register", {
      email,
      password,
      name,
      nim,
      phone,
      role,
      plateNumber,
      vehicleDetail,
    }),

  login: (email, password) => api.post("/auth/login", { email, password }),

  refresh: (token) => api.post("/auth/refresh", { token }),
};

// ─── Users API ────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get("/users/profile"),

  updateProfile: (data) => api.put("/users/profile", data),

  getStats: () => api.get("/users/stats"),
};

// ─── Orders API (scaffold) ────────────────────────────────────────────────────
export const ordersAPI = {
  getAll: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders", data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// ─── Notifications API (scaffold) ─────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => api.get("/notifications"),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

export default api;
