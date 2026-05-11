// mobile/src/hooks/useSocket.js
import { useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";
import { io } from "socket.io-client";
import { tokenStorage } from "../services/api";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? "https://api.sipolin.com";

// ─── Singleton socket instance ────────────────────────────────────────────────

let socketInstance = null;

async function getSocket() {
  if (socketInstance?.connected) return socketInstance;

  const token = await tokenStorage.get();
  if (!token) throw new Error("No auth token for socket");

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 10000,
  });

  socketInstance.on("connect", () => {
    console.log("[socket] connected:", socketInstance.id);
  });

  socketInstance.on("disconnect", (reason) => {
    console.warn("[socket] disconnected:", reason);
  });

  socketInstance.on("connect_error", (err) => {
    console.error("[socket] connection error:", err.message);
  });

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} UseSocketOptions
 * @property {string} [orderId] - Join an order room
 * @property {string} [driverId] - Join as driver
 * @property {(data: { orderId: string; status: string; order: object }) => void} [onOrderStatusUpdate]
 * @property {(data: { orderId: string; lat: number; lng: number }) => void} [onDriverLocationUpdate]
 */

/**
 * @param {UseSocketOptions} options
 */
export function useSocket(options = {}) {
  const {
    orderId,
    driverId,
    onOrderStatusUpdate,
    onDriverLocationUpdate,
  } = options;

  const socketRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // ─ Connect & join rooms ──────────────────────────

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const socket = await getSocket();
        if (!active) return;
        socketRef.current = socket;

        if (orderId) socket.emit("order:join", { orderId });
        if (driverId) socket.emit("driver:join", { driverId });
      } catch (err) {
        console.error("[useSocket] init error:", err);
      }
    })();

    return () => {
      active = false;
    };
  }, [orderId, driverId]);

  // ─ Event listeners ───────────────────────────────

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (onOrderStatusUpdate) {
      socket.on("order:status:update", onOrderStatusUpdate);
    }
    if (onDriverLocationUpdate) {
      socket.on("driver:location:update", onDriverLocationUpdate);
    }

    return () => {
      if (onOrderStatusUpdate) socket.off("order:status:update", onOrderStatusUpdate);
      if (onDriverLocationUpdate) socket.off("driver:location:update", onDriverLocationUpdate);
    };
  }, [onOrderStatusUpdate, onDriverLocationUpdate]);

  // ─ Handle app foreground/background ─────────────

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      if (prev.match(/inactive|background/) && nextState === "active") {
        // App came to foreground — ensure connected
        try {
          const socket = await getSocket();
          socketRef.current = socket;
          if (!socket.connected) socket.connect();
          // Re-join rooms
          if (orderId) socket.emit("order:join", { orderId });
          if (driverId) socket.emit("driver:join", { driverId });
        } catch (err) {
          console.error("[useSocket] foreground reconnect error:", err);
        }
      }

      if (nextState.match(/inactive|background/)) {
        // App went to background — optionally reduce activity
        // Keep socket connected but stop non-critical work
      }
    });

    return () => subscription.remove();
  }, [orderId, driverId]);

  // ─ Emitters ──────────────────────────────────────

  const joinOrder = useCallback((id) => {
    socketRef.current?.emit("order:join", { orderId: id });
  }, []);

  const joinDriver = useCallback((id) => {
    socketRef.current?.emit("driver:join", { driverId: id });
  }, []);

  const emitDriverLocation = useCallback((oid, lat, lng) => {
    socketRef.current?.emit("driver:location", { orderId: oid, lat, lng });
  }, []);

  return {
    joinOrder,
    joinDriver,
    emitDriverLocation,
    isConnected: socketRef.current?.connected ?? false,
  };
}
