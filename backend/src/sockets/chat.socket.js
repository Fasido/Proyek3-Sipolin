// backend/src/sockets/chat.socket.js
// Socket.io handlers untuk chat Sipolin.

import {
  findOrCreateChatRoom,
  saveMessage,
  markMessagesAsRead,
  validateRoomMembership,
} from "../services/chat.service.js";

const typingTimers = new Map();
const TYPING_TIMEOUT_MS = 3000;

const getSocketUser = (socket) => {
  const raw = socket.data.user || {};
  const id = raw.id || raw.userId;
  return {
    id,
    name: raw.name || "User",
    role: String(raw.role || "").toLowerCase(),
  };
};

export function registerChatHandlers(io, socket) {
  const user = getSocketUser(socket);
  const userId = user.id;
  const userName = user.name;
  const userRole = user.role;

  console.log(`[socket:chat] connected user=${userId} role=${userRole} socket=${socket.id}`);

  socket.on("join_room", async ({ roomId } = {}, callback) => {
    try {
      if (!roomId) {
        return callback?.({
          success: false,
          error: "roomId is required",
        });
      }

      const isMember = await validateRoomMembership(roomId, userId);
      if (!isMember) {
        return callback?.({
          success: false,
          error: "Access denied",
        });
      }

      await socket.join(roomId);
      await markMessagesAsRead(roomId, userId);

      socket.to(roomId).emit("messages_read", {
        roomId,
        readBy: userId,
      });

      callback?.({
        success: true,
      });
    } catch (err) {
      console.error("[socket:chat] join_room:", err);
      callback?.({
        success: false,
        error: "Failed to join room",
      });
    }
  });

  socket.on("send_message", async ({ roomId, text, tempId } = {}, callback) => {
    try {
      if (!roomId || !String(text || "").trim()) {
        return callback?.({
          success: false,
          error: "roomId and text are required",
        });
      }

      const saved = await saveMessage({
        chatRoomId: roomId,
        senderId: userId,
        text,
      });

      const { notification, recipientId, ...message } = saved;
      const payload = {
        ...message,
        tempId: tempId || null,
      };

      io.to(roomId).emit("receive_message", payload);

      if (recipientId && notification) {
        io.to(String(recipientId)).emit("notification:new", {
          ...notification,
          roomId,
          orderId: saved.chatRoom?.orderId,
        });

        io.to(String(recipientId)).emit("chat:unread", {
          roomId,
          orderId: saved.chatRoom?.orderId,
          message: payload,
        });
      }

      clearTypingTimer(socket.id, roomId);
      socket.to(roomId).emit("stop_typing", {
        roomId,
        userId,
        userName,
      });

      callback?.({
        success: true,
        message: payload,
      });
    } catch (err) {
      console.error("[socket:chat] send_message:", err);
      callback?.({
        success: false,
        error: err?.message || "Failed to send message",
      });
    }
  });

  socket.on("typing", ({ roomId } = {}) => {
    if (!roomId) return;

    socket.to(roomId).emit("typing", {
      roomId,
      userId,
      userName,
    });

    clearTypingTimer(socket.id, roomId);

    const timerKey = `${socket.id}:${roomId}`;
    const handle = setTimeout(() => {
      socket.to(roomId).emit("stop_typing", {
        roomId,
        userId,
        userName,
      });
      typingTimers.delete(timerKey);
    }, TYPING_TIMEOUT_MS);

    typingTimers.set(timerKey, handle);
  });

  socket.on("stop_typing", ({ roomId } = {}) => {
    if (!roomId) return;

    clearTypingTimer(socket.id, roomId);
    socket.to(roomId).emit("stop_typing", {
      roomId,
      userId,
      userName,
    });
  });

  socket.on("leave_room", ({ roomId } = {}) => {
    if (!roomId) return;

    clearTypingTimer(socket.id, roomId);
    socket.to(roomId).emit("stop_typing", {
      roomId,
      userId,
      userName,
    });
    socket.leave(roomId);
  });

  socket.on("create_room", async ({ orderId, customerId, driverId } = {}, callback) => {
    try {
      if (!orderId || !customerId || !driverId) {
        return callback?.({
          success: false,
          error: "orderId, customerId, and driverId are required",
        });
      }

      if (userId !== driverId && userRole !== "admin") {
        return callback?.({
          success: false,
          error: "Access denied",
        });
      }

      const room = await findOrCreateChatRoom(orderId, customerId, driverId);

      await socket.join(room.id);
      io.to(String(customerId)).emit("room_created", {
        room,
      });

      callback?.({
        success: true,
        room,
      });
    } catch (err) {
      console.error("[socket:chat] create_room:", err);
      callback?.({
        success: false,
        error: "Failed to create room",
      });
    }
  });

  socket.on("disconnect", () => {
    for (const [key, handle] of typingTimers.entries()) {
      if (key.startsWith(`${socket.id}:`)) {
        clearTimeout(handle);
        typingTimers.delete(key);
      }
    }
  });
}

function clearTypingTimer(socketId, roomId) {
  const key = `${socketId}:${roomId}`;
  const handle = typingTimers.get(key);

  if (handle) {
    clearTimeout(handle);
    typingTimers.delete(key);
  }
}
