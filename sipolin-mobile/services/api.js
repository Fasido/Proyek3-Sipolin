/**
 * services/api.js — SIPOLIN API Service Layer
 * Full compatibility version.
 *
 * Aman untuk:
 * - AuthContext lama
 * - Dashboard lama yang pakai ordersAPI.getAll()
 * - History yang pakai ordersAPI.getHistory()
 * - Create Pol-Ride / Pol-Send
 * - Tracking yang pakai getOrderById / getById
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────
// Android HP fisik jangan pakai localhost.
// Buat .env di sipolin-mobile:
// EXPO_PUBLIC_API_URL=http://IP-LAPTOP:3000/api

const DEFAULT_BASE_URL = "http://10.0.163.203:3000/api";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL &&
  process.env.EXPO_PUBLIC_API_URL.trim().length > 0
    ? process.env.EXPO_PUBLIC_API_URL.trim()
    : DEFAULT_BASE_URL;

// Token keys dibuat banyak biar kompatibel dengan AuthContext lama
const TOKEN_KEY = "@sipolin_token";
const TOKEN_ALIASES = ["@sipolin_token", "token", "authToken", "accessToken"];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const isDev = typeof __DEV__ !== "undefined" && __DEV__;

const extractTokenFromResponse = (response) => {
  const data = response?.data;

  return (
    data?.token ||
    data?.accessToken ||
    data?.data?.token ||
    data?.data?.accessToken ||
    data?.user?.token ||
    data?.data?.user?.token ||
    null
  );
};

const getStoredToken = async () => {
  try {
    const pairs = await AsyncStorage.multiGet(TOKEN_ALIASES);

    for (const [, value] of pairs) {
      if (value) return value;
    }

    return null;
  } catch (error) {
    console.log("[API] Failed to read token:", error?.message);
    return null;
  }
};

const saveTokenEverywhere = async (token) => {
  if (!token) return;

  try {
    await AsyncStorage.multiSet(TOKEN_ALIASES.map((key) => [key, token]));
  } catch (error) {
    console.log("[API] Failed to save token:", error?.message);
  }
};

const removeTokenEverywhere = async () => {
  try {
    await AsyncStorage.multiRemove(TOKEN_ALIASES);
  } catch (error) {
    console.log("[API] Failed to remove token:", error?.message);
  }
};

const normalizeId = (id) => {
  if (id === undefined || id === null || id === "") {
    throw new Error("ID tidak valid.");
  }

  return String(id);
};

const cleanString = (value) => {
  return String(value || "").trim();
};

const normalizeOrderPayload = (data = {}) => {
  const pickupLocation =
    data.pickupLocation ||
    data.pickupAddress ||
    data.pickup ||
    data.from ||
    "";

  const dropoffLocation =
    data.dropoffLocation ||
    data.dropoffAddress ||
    data.destination ||
    data.to ||
    "";

  return {
    ...data,
    pickupLocation: cleanString(pickupLocation),
    dropoffLocation: cleanString(dropoffLocation),
    note: cleanString(data.note),
  };
};

const normalizePolSendPayload = (data = {}) => {
  const itemName = data.itemName || data.foodName || data.title || "";

  const restaurantName =
    data.restaurantName ||
    data.pickupLocation ||
    data.pickupAddress ||
    data.pickup ||
    "";

  const pickupLocation =
    data.pickupLocation ||
    data.pickupAddress ||
    data.restaurantName ||
    data.pickup ||
    "";

  const dropoffLocation =
    data.dropoffLocation ||
    data.dropoffAddress ||
    data.destination ||
    data.to ||
    "";

  const estimatedItemPrice =
    data.estimatedItemPrice !== undefined
      ? data.estimatedItemPrice
      : data.foodPrice;

  const foodPrice =
    data.foodPrice !== undefined ? data.foodPrice : data.estimatedItemPrice;

  return {
    ...data,
    itemName: cleanString(itemName),
    foodName: cleanString(data.foodName || itemName),
    restaurantName: cleanString(restaurantName),
    pickupLocation: cleanString(pickupLocation),
    dropoffLocation: cleanString(dropoffLocation),
    estimatedItemPrice,
    foodPrice,
    note: cleanString(data.note),
  };
};

export const extractApiList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.data?.orders)) return payload.data.orders;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
};

export const extractApiItem = (payload) => {
  return payload?.data || payload?.order || payload?.item || payload || null;
};

// ─────────────────────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isDev) {
      console.log(
        "[API REQUEST]",
        `${String(config.method || "GET").toUpperCase()} ${config.baseURL}${config.url}`,
        token ? "TOKEN_OK" : "NO_TOKEN"
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  async (response) => {
    const token = extractTokenFromResponse(response);

    if (token) {
      await saveTokenEverywhere(token);
    }

    if (
      response.data &&
      typeof response.data === "object" &&
      !Object.prototype.hasOwnProperty.call(response.data, "success")
    ) {
      response.data.success = true;
    }

    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Terjadi kesalahan jaringan.";

    if (isDev) {
      console.log("[API ERROR]", status || "NO_STATUS", message);
    }

    if (status === 401) {
      await removeTokenEverywhere();
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// TOKEN MANAGER
// ─────────────────────────────────────────────────────────────
export const tokenManager = {
  getToken: getStoredToken,

  setToken: async (token) => {
    await saveTokenEverywhere(token);
  },

  removeToken: async () => {
    await removeTokenEverywhere();
  },

  clear: async () => {
    await removeTokenEverywhere();
  },

  key: TOKEN_KEY,
};

// ─────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────
export const authAPI = {
  register: async (
    email,
    password,
    name,
    nim,
    phone,
    role = "user",
    plateNumber = null,
    vehicleDetail = null
  ) => {
    const response = await api.post("/auth/register", {
      email,
      password,
      name,
      nim,
      phone,
      role,
      plateNumber,
      vehicleDetail,
    });

    const token = extractTokenFromResponse(response);
    if (token) await saveTokenEverywhere(token);

    return response;
  },

  login: async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const token = extractTokenFromResponse(response);
    if (token) await saveTokenEverywhere(token);

    return response;
  },

  refresh: async (token) => {
    const response = await api.post("/auth/refresh", { token });

    const newToken = extractTokenFromResponse(response);
    if (newToken) await saveTokenEverywhere(newToken);

    return response;
  },

  logout: async () => {
    await removeTokenEverywhere();
    return true;
  },
};

// ─────────────────────────────────────────────────────────────
// USERS API
// ─────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get("/users/profile"),

  profile: () => api.get("/users/profile"),

  me: () => api.get("/users/profile"),

  updateProfile: (data) => api.put("/users/profile", data),

  updateProfilePicture: (imageData) =>
    api.put("/users/profile-picture", {
      profilePicture: imageData,
    }),

  removeProfilePicture: () => api.delete("/users/profile-picture"),

  updateLocation: ({ latitude, longitude }) =>
    api.put("/users/location", {
      latitude,
      longitude,
    }),

  getDriverLocation: (driverUserId) =>
    api.get(`/users/${normalizeId(driverUserId)}/location`),

  getStats: () => api.get("/users/stats"),
};

// ─────────────────────────────────────────────────────────────
// ORDERS API
// ─────────────────────────────────────────────────────────────
export const ordersAPI = {
  /**
   * Utama: ambil semua order milik user login.
   */
  getOrders: () => api.get("/orders"),

  /**
   * Alias lama untuk dashboard app/(app)/index.jsx.
   */
  getAll: () => api.get("/orders"),

  /**
   * Alias tambahan untuk jaga-jaga file lama.
   */
  list: () => api.get("/orders"),

  all: () => api.get("/orders"),

  /**
   * Untuk History. Ambil semua order supaya pending/accepted/completed tampil.
   */
  getHistory: () => api.get("/orders"),

  history: () => api.get("/orders"),

  /**
   * Detail order.
   */
  getOrderById: (id) => api.get(`/orders/${normalizeId(id)}`),

  getById: (id) => api.get(`/orders/${normalizeId(id)}`),

  detail: (id) => api.get(`/orders/${normalizeId(id)}`),

  /**
   * Order tersedia untuk driver.
   */
  getAvailableOrders: () => api.get("/orders/available"),

  getAvailable: () => api.get("/orders/available"),

  available: () => api.get("/orders/available"),

  /**
   * Filter berdasarkan type.
   */
  getOrdersByType: (type) => api.get(`/orders/type/${type}`),

  getByType: (type) => api.get(`/orders/type/${type}`),

  /**
   * Create Pol-Ride.
   */
  createRide: (data = {}) => {
    const payload = normalizeOrderPayload(data);

    return api.post("/orders/pol_ride", {
      pickupLocation: payload.pickupLocation,
      dropoffLocation: payload.dropoffLocation,

      // Field cadangan untuk backend lama/baru
      pickupAddress: payload.pickupLocation,
      dropoffAddress: payload.dropoffLocation,
      pickup: payload.pickupLocation,
      destination: payload.dropoffLocation,

      estimatedDistanceKm: payload.estimatedDistanceKm,
      estimatedPrice: payload.estimatedPrice,
      note: payload.note || "",
    });
  },

  createPolRide: (data = {}) => {
    const payload = normalizeOrderPayload(data);

    return api.post("/orders/pol_ride", {
      pickupLocation: payload.pickupLocation,
      dropoffLocation: payload.dropoffLocation,
      pickupAddress: payload.pickupLocation,
      dropoffAddress: payload.dropoffLocation,
      pickup: payload.pickupLocation,
      destination: payload.dropoffLocation,
      estimatedDistanceKm: payload.estimatedDistanceKm,
      estimatedPrice: payload.estimatedPrice,
      note: payload.note || "",
    });
  },

  /**
   * Create Pol-Send.
   */
  createSend: (data = {}) => {
    const payload = normalizePolSendPayload(data);

    return api.post("/orders/pol_send", {
      itemName: payload.itemName,
      foodName: payload.foodName,

      restaurantName: payload.restaurantName,

      pickupLocation: payload.pickupLocation,
      pickupAddress: payload.pickupLocation,
      pickup: payload.pickupLocation,

      dropoffLocation: payload.dropoffLocation,
      dropoffAddress: payload.dropoffLocation,
      destination: payload.dropoffLocation,

      estimatedItemPrice: payload.estimatedItemPrice,
      foodPrice: payload.foodPrice,

      note: payload.note || "",
    });
  },

  createPolSend: (data = {}) => {
    const payload = normalizePolSendPayload(data);

    return api.post("/orders/pol_send", {
      itemName: payload.itemName,
      foodName: payload.foodName,
      restaurantName: payload.restaurantName,
      pickupLocation: payload.pickupLocation,
      pickupAddress: payload.pickupLocation,
      pickup: payload.pickupLocation,
      dropoffLocation: payload.dropoffLocation,
      dropoffAddress: payload.dropoffLocation,
      destination: payload.dropoffLocation,
      estimatedItemPrice: payload.estimatedItemPrice,
      foodPrice: payload.foodPrice,
      note: payload.note || "",
    });
  },

  /**
   * Generic create untuk file lama.
   */
  create: (type, data = {}) => {
    const normalizedType = String(type || "").toLowerCase();

    if (normalizedType.includes("send")) {
      const payload = normalizePolSendPayload(data);

      return api.post("/orders/pol_send", {
        itemName: payload.itemName,
        foodName: payload.foodName,
        restaurantName: payload.restaurantName,
        pickupLocation: payload.pickupLocation,
        pickupAddress: payload.pickupLocation,
        pickup: payload.pickupLocation,
        dropoffLocation: payload.dropoffLocation,
        dropoffAddress: payload.dropoffLocation,
        destination: payload.dropoffLocation,
        estimatedItemPrice: payload.estimatedItemPrice,
        foodPrice: payload.foodPrice,
        note: payload.note || "",
      });
    }

    const payload = normalizeOrderPayload(data);

    return api.post("/orders/pol_ride", {
      pickupLocation: payload.pickupLocation,
      dropoffLocation: payload.dropoffLocation,
      pickupAddress: payload.pickupLocation,
      dropoffAddress: payload.dropoffLocation,
      pickup: payload.pickupLocation,
      destination: payload.dropoffLocation,
      estimatedDistanceKm: payload.estimatedDistanceKm,
      estimatedPrice: payload.estimatedPrice,
      note: payload.note || "",
    });
  },

  /**
   * Driver actions.
   */
  acceptOrder: (id) => api.post(`/orders/${normalizeId(id)}/accept`),

  accept: (id) => api.post(`/orders/${normalizeId(id)}/accept`),

  completeOrder: (id) => api.post(`/orders/${normalizeId(id)}/complete`),

  complete: (id) => api.post(`/orders/${normalizeId(id)}/complete`),

  cancelOrder: (id) => api.delete(`/orders/${normalizeId(id)}`),

  cancel: (id) => api.delete(`/orders/${normalizeId(id)}`),
};

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS API
// ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => api.get("/notifications"),

  list: () => api.get("/notifications"),

  markAsRead: (id) => api.put(`/notifications/${normalizeId(id)}/read`),

  read: (id) => api.put(`/notifications/${normalizeId(id)}/read`),

  delete: (id) => api.delete(`/notifications/${normalizeId(id)}`),
};

// ─────────────────────────────────────────────────────────────
// CHAT API
// ─────────────────────────────────────────────────────────────
export const chatAPI = {
  getRooms: () => api.get("/chat/rooms"),

  rooms: () => api.get("/chat/rooms"),

  getRoomById: (roomId) => api.get(`/chat/rooms/${normalizeId(roomId)}`),

  getById: (roomId) => api.get(`/chat/rooms/${normalizeId(roomId)}`),

  getMessages: (roomId, cursor = null) =>
    api.get(`/chat/rooms/${normalizeId(roomId)}/messages`, {
      params: {
        cursor,
        limit: 30,
      },
    }),

  messages: (roomId, cursor = null) =>
    api.get(`/chat/rooms/${normalizeId(roomId)}/messages`, {
      params: {
        cursor,
        limit: 30,
      },
    }),

  getOrCreateRoom: (orderId, customerId, driverId) =>
    api.post("/chat/rooms", {
      orderId,
      customerId,
      driverId,
    }),

  createRoom: (orderId, customerId, driverId) =>
    api.post("/chat/rooms", {
      orderId,
      customerId,
      driverId,
    }),

  markRead: (roomId) => api.post(`/chat/rooms/${normalizeId(roomId)}/read`),
};

export default api;