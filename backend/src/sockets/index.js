// backend/src/sockets/index.js
// Initialises Socket.io untuk Sipolin.

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

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token ?? socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;

      if (!userId) {
        return next(new Error("Invalid token payload"));
      }

      socket.data.user = {
        ...decoded,
        id: userId,
        userId,
        role: String(decoded.role || "").toLowerCase(),
        name: decoded.name || decoded.email || "User",
      };

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user || {};
    const userId = (user.userId || user.id)?.toString();

    if (userId) {
      socket.join(userId);
    }

    socket.on("driver:subscribe", () => {
      socket.join("drivers");
      console.log(`[socket] Driver ${userId} joined drivers room`);
    });

    socket.on("driver:unsubscribe", () => {
      socket.leave("drivers");
    });

    socket.on("order:subscribe", ({ orderId }) => {
      if (orderId) socket.join(`order:${orderId}`);
    });

    socket.on("order:unsubscribe", ({ orderId }) => {
      if (orderId) socket.leave(`order:${orderId}`);
    });

    registerChatHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`[socket] ${userId} disconnected: ${reason}`);
    });
  });

  console.log("[socket.io] Initialised");
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialised. Call initSocketIO() first.");
  }

  return io;
}
