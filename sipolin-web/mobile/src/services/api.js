// mobile/src/services/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.sipolin.com";

// ─── Token helpers ────────────────────────────────────────────────────────────

const TOKEN_KEY = "@sipolin:token";

export const tokenStorage = {
  get: () => AsyncStorage.getItem(TOKEN_KEY),
  set: (token) => AsyncStorage.setItem(TOKEN_KEY, token),
  remove: () => AsyncStorage.removeItem(TOKEN_KEY),
};

// ─── Core fetcher ─────────────────────────────────────────────────────────────

/**
 * @template T
 * @param {string} endpoint
 * @param {RequestInit & { params?: Record<string, string> }} [options]
 * @returns {Promise<T>}
 */
async function request(endpoint, options = {}) {
  const token = await tokenStorage.get();

  const { params, ...fetchOptions } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers ?? {}),
  };

  let response;
  try {
    response = await fetch(url, { ...fetchOptions, headers });
  } catch (networkError) {
    throw new Error(`Network error: ${networkError.message}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" ? data?.error ?? "Request failed" : data;
    throw new Error(message);
  }

  return data;
}

// ─── HTTP Methods ─────────────────────────────────────────────────────────────

export const api = {
  /**
   * @template T
   * @param {string} endpoint
   * @param {{ params?: Record<string, string> }} [options]
   * @returns {Promise<T>}
   */
  get: (endpoint, options = {}) =>
    request(endpoint, { method: "GET", ...options }),

  /**
   * @template T
   * @param {string} endpoint
   * @param {unknown} body
   * @returns {Promise<T>}
   */
  post: (endpoint, body) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body) }),

  /**
   * @template T
   * @param {string} endpoint
   * @param {unknown} body
   * @returns {Promise<T>}
   */
  patch: (endpoint, body) =>
    request(endpoint, { method: "PATCH", body: JSON.stringify(body) }),

  /**
   * @template T
   * @param {string} endpoint
   * @returns {Promise<T>}
   */
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (phone, password) => {
    const data = await api.post("/auth/login", { phone, password });
    if (data.token) await tokenStorage.set(data.token);
    return data;
  },

  me: () => api.get("/auth/me"),

  logout: async () => {
    await tokenStorage.remove();
  },
};

// ─── Orders API ───────────────────────────────────────────────────────────────

export const ordersApi = {
  list: () => api.get("/orders"),

  create: (payload) => api.post("/orders/create", payload),

  updateStatus: (id, status, driverId) =>
    api.patch(`/orders/${id}/status`, { status, driverId }),
};
