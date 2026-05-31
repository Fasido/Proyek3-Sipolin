/**
 * services/api.js — SIPOLIN API Service Layer
 * Full compatibility version.
 *
 * Aman untuk:
 * - AuthContext lama
 * - Dashboard customer/driver
 * - Order Pol-Ride / Pol-Send
 * - Manual tracking progress
 * - History
 * - Chat realtime + REST fallback
 * - Notifications
 * - AI Chatbot Sipolin
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────
// Android HP fisik jangan pakai localhost.
// Buat .env di sipolin-mobile:
// EXPO_PUBLIC_API_URL=http://IP-LAPTOP:3000/api

const DEFAULT_BASE_URL = "http://192.168.10.19:3000/api";

const RAW_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL &&
  process.env.EXPO_PUBLIC_API_URL.trim().length > 0
    ? process.env.EXPO_PUBLIC_API_URL.trim()
    : DEFAULT_BASE_URL;

const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
const SOCKET_URL = BASE_URL.replace(/\/api$/, "");

// Token keys dibuat banyak biar kompatibel dengan AuthContext lama
const TOKEN_KEY = "@sipolin_token";
const TOKEN_ALIASES = ["@sipolin_token", "token", "authToken", "accessToken"];

// Export config biar hook socket bisa pakai
export const API_BASE_URL = BASE_URL;
export const BASE_API_URL = BASE_URL;
export const API_URL = BASE_URL;
export const WS_URL = SOCKET_URL;
export const SOCKET_BASE_URL = SOCKET_URL;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const isDev = typeof __DEV__ !== "undefined" && __DEV__;

const cleanString = (value) => {
  return String(value || "").trim();
};

const normalizeId = (id) => {
  if (id === undefined || id === null || id === "") {
    throw new Error("ID tidak valid.");
  }

  return String(id);
};

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

export const extractApiItem = (payload) => {
  if (!payload) return null;

  const data = payload?.data ?? payload;

  if (data?.data && !Array.isArray(data.data)) return data.data;
  if (data?.item) return data.item;
  if (data?.order) return data.order;
  if (data?.room) return data.room;
  if (data?.message) return data.message;
  if (data?.user) return data.user;

  return data;
};

export const extractApiList = (payload) => {
  if (!payload) return [];

  const data = payload?.data ?? payload;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.rooms)) return data.rooms;
  if (Array.isArray(data?.messages)) return data.messages;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.data?.orders)) return data.data.orders;
  if (Array.isArray(data?.data?.rooms)) return data.data.rooms;
  if (Array.isArray(data?.data?.messages)) return data.data.messages;
  if (Array.isArray(data?.data?.notifications)) return data.data.notifications;

  return [];
};

export const extractStats = (payload) => {
  const data = payload?.data ?? payload;

  return {
    totalOrders: data?.totalOrders ?? data?.data?.totalOrders ?? 0,
    totalTrips: data?.totalTrips ?? data?.data?.totalTrips ?? data?.totalOrders ?? 0,
    activeOrders: data?.activeOrders ?? data?.data?.activeOrders ?? 0,
    completedOrders: data?.completedOrders ?? data?.data?.completedOrders ?? 0,
    unreadNotifications:
      data?.unreadNotifications ?? data?.data?.unreadNotifications ?? 0,
    ordersByStatus: data?.ordersByStatus ?? data?.data?.ordersByStatus ?? {},
    avgRating: data?.avgRating ?? data?.data?.avgRating ?? 5,
    totalSavings: data?.totalSavings ?? data?.data?.totalSavings ?? 0,
  };
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
    note: cleanString(data.note || data.description),
  };
};

const normalizePolSendPayload = (data = {}) => {
  const itemName =
    data.itemName ||
    data.foodName ||
    data.packageName ||
    data.goodsName ||
    data.title ||
    "";

  const pickupLocation =
    data.pickupLocation ||
    data.pickupAddress ||
    data.pickup ||
    data.restaurantName ||
    data.senderLocation ||
    data.from ||
    "";

  const dropoffLocation =
    data.dropoffLocation ||
    data.dropoffAddress ||
    data.destination ||
    data.receiverLocation ||
    data.to ||
    itemName ||
    "";

  const rawPrice =
    data.foodPrice ??
    data.itemPrice ??
    data.price ??
    data.estimatedItemPrice ??
    20000;

  return {
    ...data,
    itemName: cleanString(itemName),
    foodName: cleanString(data.foodName || itemName),
    restaurantName: cleanString(data.restaurantName || pickupLocation),
    pickupLocation: cleanString(pickupLocation),
    dropoffLocation: cleanString(dropoffLocation),
    foodPrice: Number(rawPrice || 20000),
    estimatedItemPrice: Number(rawPrice || 20000),
    note: cleanString(data.note || data.description),
  };
};

// ─────────────────────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

if (isDev) {
  console.log("[API CONFIG] BASE_URL:", BASE_URL);
  console.log("[API CONFIG] SOCKET_URL:", SOCKET_URL);
}

api.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isDev) {
      const method = String(config.method || "GET").toUpperCase();
      const url = `${config.baseURL || ""}${config.url || ""}`;
      console.log(
        `[API REQUEST] ${method} ${url} ${token ? "TOKEN_OK" : "NO_TOKEN"}`
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  async (response) => {
    const token = extractTokenFromResponse(response);
    if (token) await saveTokenEverywhere(token);
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "API Error";

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

export const getAuthToken = getStoredToken;
export const getSocketUrl = () => SOCKET_URL;

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
   * Alias lama untuk dashboard.
   */
  getAll: () => api.get("/orders"),

  /**
   * Alias tambahan.
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

      pickupLatitude: payload.pickupLatitude,
      pickupLongitude: payload.pickupLongitude,
      destinationLatitude: payload.destinationLatitude,
      destinationLongitude: payload.destinationLongitude,
      pickupNote: payload.pickupNote,
      destinationNote: payload.destinationNote,

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

      pickupLatitude: payload.pickupLatitude,
      pickupLongitude: payload.pickupLongitude,
      destinationLatitude: payload.destinationLatitude,
      destinationLongitude: payload.destinationLongitude,
      pickupNote: payload.pickupNote,
      destinationNote: payload.destinationNote,

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
      packageName: payload.packageName,
      goodsName: payload.goodsName,

      restaurantName: payload.restaurantName,

      pickupLocation: payload.pickupLocation,
      pickupAddress: payload.pickupLocation,
      pickup: payload.pickupLocation,
      senderLocation: payload.pickupLocation,

      dropoffLocation: payload.dropoffLocation,
      dropoffAddress: payload.dropoffLocation,
      destination: payload.dropoffLocation,
      receiverLocation: payload.dropoffLocation,

      pickupLatitude: payload.pickupLatitude,
      pickupLongitude: payload.pickupLongitude,
      destinationLatitude: payload.destinationLatitude,
      destinationLongitude: payload.destinationLongitude,
      pickupNote: payload.pickupNote,
      destinationNote: payload.destinationNote,

      foodPrice: payload.foodPrice,
      itemPrice: payload.foodPrice,
      price: payload.foodPrice,
      estimatedItemPrice: payload.estimatedItemPrice,

      note: payload.note || "",
    });
  },

  createPolSend: (data = {}) => {
    const payload = normalizePolSendPayload(data);

    return api.post("/orders/pol_send", {
      itemName: payload.itemName,
      foodName: payload.foodName,
      packageName: payload.packageName,
      goodsName: payload.goodsName,

      restaurantName: payload.restaurantName,

      pickupLocation: payload.pickupLocation,
      pickupAddress: payload.pickupLocation,
      pickup: payload.pickupLocation,
      senderLocation: payload.pickupLocation,

      dropoffLocation: payload.dropoffLocation,
      dropoffAddress: payload.dropoffLocation,
      destination: payload.dropoffLocation,
      receiverLocation: payload.dropoffLocation,

      pickupLatitude: payload.pickupLatitude,
      pickupLongitude: payload.pickupLongitude,
      destinationLatitude: payload.destinationLatitude,
      destinationLongitude: payload.destinationLongitude,
      pickupNote: payload.pickupNote,
      destinationNote: payload.destinationNote,

      foodPrice: payload.foodPrice,
      itemPrice: payload.foodPrice,
      price: payload.foodPrice,
      estimatedItemPrice: payload.estimatedItemPrice,

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

        pickupLatitude: payload.pickupLatitude,
        pickupLongitude: payload.pickupLongitude,
        destinationLatitude: payload.destinationLatitude,
        destinationLongitude: payload.destinationLongitude,
        pickupNote: payload.pickupNote,
        destinationNote: payload.destinationNote,

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

      pickupLatitude: payload.pickupLatitude,
      pickupLongitude: payload.pickupLongitude,
      destinationLatitude: payload.destinationLatitude,
      destinationLongitude: payload.destinationLongitude,
      pickupNote: payload.pickupNote,
      destinationNote: payload.destinationNote,

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

  /**
   * Manual tracking progress.
   * status:
   * - arrived
   * - picked_up
   * - on_the_way
   */
  updateProgress: (id, status) =>
    api.post(`/orders/${normalizeId(id)}/progress`, {
      status,
      progressStatus: status,
    }),

  progress: (id, status) =>
    api.post(`/orders/${normalizeId(id)}/progress`, {
      status,
      progressStatus: status,
    }),

  setProgress: (id, status) =>
    api.post(`/orders/${normalizeId(id)}/progress`, {
      status,
      progressStatus: status,
    }),

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
  /**
   * Raw axios versions.
   */
  getRoomsRaw: () => api.get("/chat/rooms"),

  getRoomRaw: (roomId) => api.get(`/chat/rooms/${normalizeId(roomId)}`),

  getMessagesRaw: (roomId, cursor = null) =>
    api.get(`/chat/rooms/${normalizeId(roomId)}/messages`, {
      params: {
        cursor,
        limit: 30,
      },
    }),

  /**
   * Friendly versions untuk screen chat.
   * Ini return data langsung, bukan axios response.
   */
  getRooms: async () => {
    const response = await api.get("/chat/rooms");
    return extractApiList(response);
  },

  rooms: async () => {
    const response = await api.get("/chat/rooms");
    return extractApiList(response);
  },

  getRoomById: async (roomId) => {
    const response = await api.get(`/chat/rooms/${normalizeId(roomId)}`);
    return extractApiItem(response);
  },

  getById: async (roomId) => {
    const response = await api.get(`/chat/rooms/${normalizeId(roomId)}`);
    return extractApiItem(response);
  },

  getMessages: async (roomId, cursor = null) => {
    const response = await api.get(`/chat/rooms/${normalizeId(roomId)}/messages`, {
      params: {
        cursor,
        limit: 30,
      },
    });

    return extractApiItem(response);
  },

  messages: async (roomId, cursor = null) => {
    const response = await api.get(`/chat/rooms/${normalizeId(roomId)}/messages`, {
      params: {
        cursor,
        limit: 30,
      },
    });

    return extractApiItem(response);
  },

  getOrCreateRoom: async (orderId, customerId, driverId) => {
    const response = await api.post("/chat/rooms", {
      orderId,
      customerId,
      driverId,
    });

    return extractApiItem(response);
  },

  createRoom: async (orderId, customerId, driverId) => {
    const response = await api.post("/chat/rooms", {
      orderId,
      customerId,
      driverId,
    });

    return extractApiItem(response);
  },

  markAsRead: async (roomId) => {
    const response = await api.post(`/chat/rooms/${normalizeId(roomId)}/read`);
    return extractApiItem(response);
  },

  read: async (roomId) => {
    const response = await api.post(`/chat/rooms/${normalizeId(roomId)}/read`);
    return extractApiItem(response);
  },

  /**
   * REST fallback kalau socket gagal.
   * Backend batch chat sudah disiapkan untuk endpoint ini.
   */
  sendMessage: async (roomId, text) => {
    const response = await api.post(`/chat/rooms/${normalizeId(roomId)}/messages`, {
      text,
    });

    return extractApiItem(response);
  },
};

// Alias biar file lama yang pakai chatApi tetap aman
export const chatApi = chatAPI;

// ─────────────────────────────────────────────────────────────
// AI CHATBOT API
// ─────────────────────────────────────────────────────────────
const normalizeAIText = (payload) => {
  const data = payload?.data ?? payload;
  const core = data?.data ?? data;

  const geminiText =
    core?.candidates?.[0]?.content?.parts?.[0]?.text ||
    core?.candidates?.[0]?.content?.text ||
    core?.candidates?.[0]?.text ||
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.candidates?.[0]?.content?.text ||
    data?.candidates?.[0]?.text;

  const answer =
    core?.response ||
    core?.reply ||
    core?.answer ||
    core?.message ||
    core?.text ||
    core?.result ||
    core?.content ||
    data?.response ||
    data?.reply ||
    data?.answer ||
    data?.message ||
    data?.text ||
    data?.result ||
    geminiText;

  if (typeof answer === "string" && answer.trim().length > 0) {
    return answer.trim();
  }

  return "";
};

const buildAIResult = (axiosResponse) => {
  const raw = axiosResponse?.data ?? {};
  const core = raw?.data ?? raw;
  const answer = normalizeAIText(raw);

  if (isDev) {
    try {
      console.log("[AI RAW RESPONSE]", JSON.stringify(raw).slice(0, 1500));
      console.log("[AI NORMALIZED ANSWER]", answer || "EMPTY_ANSWER");
    } catch {
      console.log("[AI RAW RESPONSE]", raw);
    }
  }

  const safeAnswer =
    answer ||
    "Maaf, aku belum bisa menjawab pertanyaan itu.";

  // Return top-level response/answer supaya screen lama yang baca
  // result.response atau result.answer tetap langsung jalan.
  return {
    success: raw?.success ?? Boolean(answer),
    response: safeAnswer,
    reply: safeAnswer,
    answer: safeAnswer,
    message: safeAnswer,
    text: safeAnswer,
    raw,
    data: {
      ...core,
      response: safeAnswer,
      reply: safeAnswer,
      answer: safeAnswer,
      message: safeAnswer,
      text: safeAnswer,
    },
  };
};

const normalizeAIPrompt = (input) => {
  if (typeof input === "string") return input.trim();

  return String(
    input?.prompt ||
      input?.message ||
      input?.text ||
      input?.question ||
      ""
  ).trim();
};

const postAIChat = async (input) => {
  const prompt = normalizeAIPrompt(input);

  const response = await api.post("/ai/chat", {
    prompt,
    message: prompt,
    text: prompt,
    question: prompt,
  });

  return buildAIResult(response);
};

export const aiAPI = {
  chat: postAIChat,
  ask: postAIChat,
  sendMessage: postAIChat,
  send: postAIChat,
};

// Alias cadangan biar file lama tetap aman
export const chatbotAPI = aiAPI;
export const aiChatAPI = aiAPI;

// ─────────────────────────────────────────────────────────────
// DEFAULT EXPORT
// ─────────────────────────────────────────────────────────────
export default api;