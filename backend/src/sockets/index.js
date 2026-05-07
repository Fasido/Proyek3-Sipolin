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
      // Secret key token disamakan dengan JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // ✅ FIX: Nyesuain payload token lo (ngambil userId dari decoded JWT)
    const userId = socket.data.user.userId || socket.data.user.id;
    
    if (userId) {
      socket.join(userId.toString());
      // console.log(`User ${userId} joined their personal room`);
    }

    // Daftarin fungsi chat-nya
    registerChatHandlers(io, socket);
  });

  console.log("[socket.io] Initialised on port 3000");
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialised. Call initSocketIO() first.");
  }
  return io;
}