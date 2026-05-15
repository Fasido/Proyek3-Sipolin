/**
 * services/socket.service.js — SIPOLIN Socket Service
 */

import { io } from "socket.io-client";
import { tokenManager } from "./api";

// Set EXPO_PUBLIC_SOCKET_URL in your .env (e.g. http://192.168.1.x:3000)
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? "http://localhost:3000";

let socketInstance = null;

/**
 * Returns the existing connected socket or creates a new authenticated one.
 */
export async function getSocket() {
  if (socketInstance?.connected) return socketInstance;

  const token = await tokenManager.getToken();

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socketInstance.on("connect", () => console.log("🟢 Socket connected"));
  socketInstance.on("disconnect", (reason) => console.log("🔴 Socket disconnected:", reason));
  socketInstance.on("connect_error", (err) => console.warn("⚠️ Socket error:", err.message));

  return socketInstance;
}

/**
 * Call on logout to cleanly close the connection.
 */
export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
