import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// GANTI IP DI BAWAH INI sesuai IP yang muncul di terminal Expo kamu!
// Saat ini saya set ke IP laptop kamu: 192.168.43.148
const API_BASE_URL = 'http://192.168.110.27:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// Interceptor untuk menambahkan token otomatis di setiap request
api.interceptors.request.use(
  async (config) => {
    try {
      // CEK PLATFORM: Kalau Web pakai localStorage, kalau HP pakai SecureStore
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('authToken');
      } else {
        token = await SecureStore.getItemAsync('authToken');
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API] Failed to get token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// 1. AUTH API
// ==========================================
export const authAPI = {
  register: (email, password, name, nim, phone, role = 'user') =>
    api.post('/auth/register', { email, password, name, nim, phone, role }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  refreshToken: (token) =>
    api.post('/auth/refresh', { token }),
};

// ==========================================
// 2. ORDERS API (TEBENGAN & JASTIP)
// ==========================================
export const ordersAPI = {
  create: (data) =>
    api.post('/orders', data),

  list: (filters) =>
    api.get('/orders', { params: filters }),

  getDetail: (id) =>
    api.get(`/orders/${id}`),

  update: (id, data) =>
    api.put(`/orders/${id}`, data),

  delete: (id) =>
    api.delete(`/orders/${id}`),

  acceptOrder: (id) =>
    api.post(`/orders/${id}/accept`),

  completeOrder: (id) =>
    api.post(`/orders/${id}/complete`),

  // Menuju route /available yang ada di backend
  getAvailableOrders: () =>
    api.get('/orders/available'),
};

// ==========================================
// 3. USERS API
// ==========================================
export const usersAPI = {
  getProfile: () =>
    api.get('/users/profile'),

  updateProfile: (data) =>
    api.put('/users/profile', data),

  getStats: () =>
    api.get('/users/stats'),

  verifyDriver: (ktmImage, vehicleInfo) =>
    api.post('/users/verify-driver', { ktmImage, vehicleInfo }),

  getDriverStats: () =>
    api.get('/users/driver-stats'),
};

// ==========================================
// 4. NOTIFICATIONS API
// ==========================================
export const notificationsAPI = {
  list: (limit = 20) =>
    api.get('/notifications', { params: { limit } }),

  markAsRead: (id) =>
    api.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put('/notifications/read-all'),

  delete: (id) =>
    api.delete(`/notifications/${id}`),
};

// ==========================================
// 5. TOKEN MANAGEMENT (SECURE STORAGE / LOCAL STORAGE)
// ==========================================
export const tokenManager = {
  setToken: async (token) => {
    if (Platform.OS === 'web') {
      return localStorage.setItem('authToken', token);
    }
    return SecureStore.setItemAsync('authToken', token);
  },

  getToken: async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('authToken');
    }
    return SecureStore.getItemAsync('authToken');
  },

  removeToken: async () => {
    if (Platform.OS === 'web') {
      return localStorage.removeItem('authToken');
    }
    return SecureStore.deleteItemAsync('authToken');
  },
};

export default api;