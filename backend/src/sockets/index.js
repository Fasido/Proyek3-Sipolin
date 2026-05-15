/**
 * backend/src/sockets/index.js
 *
 * Initialises Socket.io.
 * - Each user auto-joins their personal room (userId string).
 * - Drivers can join the "drivers" room to receive order:new broadcasts.
 * - Exports getIO() so controllers can emit events without circular deps.
 */

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { registerChatHandlers } from "./chat.socket.js";

let io;

export function initSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["polling", "websocket"],
  });

  // ── Auth middleware ──────────────────────────────────────────────────────
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ?? socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  // ── Connection handler ───────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const user = socket.data.user;
    const userId = (user.userId ?? user.id)?.toString();

    if (userId) {
      // Personal room — used to push targeted notifications
      socket.join(userId);
    }

    // ── Order rooms ────────────────────────────────────────────────────────
    // Drivers subscribe to the shared "drivers" room to receive new orders.
    // The mobile client emits "driver:subscribe" right after connecting
    // when the logged-in user has role === 'driver'.
    socket.on("driver:subscribe", () => {
      socket.join("drivers");
      console.log(`[socket] Driver ${userId} joined drivers room`);
    });

    socket.on("driver:unsubscribe", () => {
      socket.leave("drivers");
    });

    // Allow a client to subscribe to a specific order room for live updates
    socket.on("order:subscribe", ({ orderId }) => {
      if (orderId) socket.join(`order:${orderId}`);
    });

    socket.on("order:unsubscribe", ({ orderId }) => {
      if (orderId) socket.leave(`order:${orderId}`);
    });

    // ── Chat handlers ──────────────────────────────────────────────────────
    registerChatHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      // console.log(`[socket] ${userId} disconnected: ${reason}`);
    });
  });

  console.log("[socket.io] Initialised");
  return io;
}

/**
 * Returns the Socket.io server instance.
 * Throws if called before initSocketIO().
 */
export function getIO() {
  if (!io) {
    throw new Error(
      "Socket.io has not been initialised. Call initSocketIO() first."
    );
  }
  return io;
}
