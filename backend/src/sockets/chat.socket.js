// src/sockets/chat.socket.js
// ─────────────────────────────────────────────────────────────────────────────
// Registers all chat-related Socket.io event handlers for a single connected
// socket. Called once per connection from the central socket initialiser.
//
// RESPONSIBILITY BOUNDARY
//   • This file only handles the WebSocket transport layer.
//   • All database work is delegated to chat.service.js.
//   • Never import Express req/res here.
//
// SOCKET ROOM STRATEGY
//   Each ChatRoom row maps to a Socket.io "room" named by its UUID.
//   socket.join(roomId) subscribes this socket to that room so that
//   io.to(roomId).emit(...) broadcasts to ALL connected members of that trip.
// ─────────────────────────────────────────────────────────────────────────────

import {
  findOrCreateChatRoom,
  saveMessage,
  markMessagesAsRead,
  validateRoomMembership,
} from "../services/chat.service.js";

// ─── Typing debounce map ──────────────────────────────────────────────────────
// Prevents the server from spamming "stop_typing" broadcasts.
// Key: `${socketId}:${roomId}` → NodeJS.Timeout handle
const typingTimers = new Map();
const TYPING_TIMEOUT_MS = 3000;

/**
 * registerChatHandlers
 * ─────────────────────
 * Attaches all chat event listeners to the given socket.
 * Called from the main socket initialiser after authentication.
 *
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export function registerChatHandlers(io, socket) {
  // socket.data.user is populated by the auth middleware before this runs
  const { id: userId, name: userName, role: userRole } = socket.data.user;

  console.log(
    `[socket] user connected — id: ${userId} | role: ${userRole} | socket: ${socket.id}`
  );

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT: join_room
  // ───────────────────────────────────────────────────────────────────────────
  // Emitted by the client when it opens a chat screen.
  // Payload  : { roomId: string }
  // Callback : (response: { success: boolean, error?: string }) => void
  //
  // Side-effects:
  //   1. Validates the user is actually a participant.
  //   2. Subscribes the socket to the Socket.io room.
  //   3. Marks all incoming messages as read.
  //   4. Notifies the OTHER participant that this user is online in the room.
  // ───────────────────────────────────────────────────────────────────────────
  socket.on("join_room", async ({ roomId } = {}, callback) => {
    try {
      if (!roomId) {
        return callback?.({ success: false, error: "roomId is required" });
      }

      // Security gate — never trust the client
      const isMember = await validateRoomMembership(roomId, userId);
      if (!isMember) {
        return callback?.({ success: false, error: "Access denied" });
      }

      // Subscribe this socket to the room
      await socket.join(roomId);

      // Mark other person's messages as read now that the user has opened the room
      await markMessagesAsRead(roomId, userId);

      // Inform the other participant (if online) that their messages were read
      socket.to(roomId).emit("messages_read", { roomId, readBy: userId });

      console.log(`[socket] ${userId} joined room ${roomId}`);
      callback?.({ success: true });
    } catch (err) {
      console.error("[socket] join_room error:", err);
      callback?.({ success: false, error: "Failed to join room" });
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT: send_message
  // ───────────────────────────────────────────────────────────────────────────
  // Emitted when the user taps Send.
  // Payload  : { roomId: string, text: string, tempId: string }
  //   tempId is a client-generated UUID used for optimistic UI reconciliation.
  // Callback : (response: { success: boolean, message?: object, error?: string }) => void
  //
  // Flow:
  //   1. Validate input and membership.
  //   2. Persist the message (and update lastMessage cache) via service.
  //   3. Broadcast the confirmed message to ALL sockets in the room
  //      (including the sender's other devices).
  // ───────────────────────────────────────────────────────────────────────────
  socket.on("send_message", async ({ roomId, text, tempId } = {}, callback) => {
    try {
      // ── Input validation ──────────────────────────────────────────────────
      if (!roomId || !text?.trim()) {
        return callback?.({
          success: false,
          error: "roomId and text are required",
        });
      }

      if (text.trim().length > 2000) {
        return callback?.({
          success: false,
          error: "Message exceeds 2000 characters",
        });
      }

      // ── Membership check ──────────────────────────────────────────────────
      const isMember = await validateRoomMembership(roomId, userId);
      if (!isMember) {
        return callback?.({ success: false, error: "Access denied" });
      }

      // ── Persist ───────────────────────────────────────────────────────────
      const message = await saveMessage({
        chatRoomId: roomId,
        senderId: userId,
        text: text.trim(),
      });

      // ── Build broadcast payload ───────────────────────────────────────────
      // Attach tempId so the sender's client can reconcile the optimistic
      // bubble with the confirmed server record.
      const payload = { ...message, tempId: tempId ?? null };

      // Broadcast to EVERYONE in the room (io.to includes the sender's socket)
      // This ensures the message appears on all the sender's devices too.
      io.to(roomId).emit("receive_message", payload);

      // Stop any active typing indicator for this user in this room
      clearTypingTimer(socket.id, roomId);
      socket.to(roomId).emit("stop_typing", { roomId, userId, userName });

      callback?.({ success: true, message: payload });
    } catch (err) {
      console.error("[socket] send_message error:", err);
      callback?.({ success: false, error: "Failed to send message" });
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT: typing
  // ───────────────────────────────────────────────────────────────────────────
  // Emitted on every keystroke (debounced on the client to ~300 ms).
  // Payload: { roomId: string }
  //
  // The server re-broadcasts to OTHER sockets in the room and sets a server-
  // side watchdog timer that auto-emits "stop_typing" after 3 s of silence.
  // This prevents ghost indicators when a client disconnects mid-typing.
  // ───────────────────────────────────────────────────────────────────────────
  socket.on("typing", ({ roomId } = {}) => {
    if (!roomId) return;

    // Broadcast the indicator to the other participant
    socket.to(roomId).emit("typing", { roomId, userId, userName });

    // Reset the watchdog timer
    const timerKey = `${socket.id}:${roomId}`;
    clearTypingTimer(socket.id, roomId);

    const handle = setTimeout(() => {
      socket.to(roomId).emit("stop_typing", { roomId, userId, userName });
      typingTimers.delete(timerKey);
    }, TYPING_TIMEOUT_MS);

    typingTimers.set(timerKey, handle);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT: stop_typing
  // ───────────────────────────────────────────────────────────────────────────
  // Emitted when the input is cleared or the user pauses.
  // Payload: { roomId: string }
  // ───────────────────────────────────────────────────────────────────────────
  socket.on("stop_typing", ({ roomId } = {}) => {
    if (!roomId) return;
    clearTypingTimer(socket.id, roomId);
    socket.to(roomId).emit("stop_typing", { roomId, userId, userName });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT: leave_room
  // ───────────────────────────────────────────────────────────────────────────
  // Optional — clients emit this when navigating away from the chat screen.
  // Socket.io also auto-cleans rooms on disconnect, but explicit leave is
  // cleaner and lets us cancel the typing timer immediately.
  // Payload: { roomId: string }
  // ───────────────────────────────────────────────────────────────────────────
  socket.on("leave_room", ({ roomId } = {}) => {
    if (!roomId) return;
    clearTypingTimer(socket.id, roomId);
    socket.to(roomId).emit("stop_typing", { roomId, userId, userName });
    socket.leave(roomId);
    console.log(`[socket] ${userId} left room ${roomId}`);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT: create_room
  // ───────────────────────────────────────────────────────────────────────────
  // Triggered by the driver app after accepting an order.
  // Creates (or fetches) the ChatRoom row and joins both participants' sockets
  // to the new Socket.io room.
  //
  // Payload  : { orderId: string, customerId: string, driverId: string }
  // Callback : (response: { success: boolean, room?: object, error?: string })
  // ───────────────────────────────────────────────────────────────────────────
  socket.on(
    "create_room",
    async ({ orderId, customerId, driverId } = {}, callback) => {
      try {
        if (!orderId || !customerId || !driverId) {
          return callback?.({
            success: false,
            error: "orderId, customerId, and driverId are required",
          });
        }

        // Only the driver should be creating rooms
        if (userId !== driverId && userRole !== "admin") {
          return callback?.({ success: false, error: "Access denied" });
        }

        const room = await findOrCreateChatRoom(orderId, customerId, driverId);

        // Join THIS socket (the driver) to the new room
        await socket.join(room.id);

        // Notify the customer socket(s) about the new room so their client
        // can pre-emptively join. The customer app listens for "room_created".
        io.to(customerId).emit("room_created", { room });

        callback?.({ success: true, room });
      } catch (err) {
        console.error("[socket] create_room error:", err);
        callback?.({ success: false, error: "Failed to create room" });
      }
    }
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Disconnect cleanup
  // ───────────────────────────────────────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    console.log(
      `[socket] user disconnected — id: ${userId} | reason: ${reason}`
    );
    // Clear ALL typing timers for every room this socket was in
    for (const [key, handle] of typingTimers.entries()) {
      if (key.startsWith(`${socket.id}:`)) {
        clearTimeout(handle);
        typingTimers.delete(key);
      }
    }
  });
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function clearTypingTimer(socketId, roomId) {
  const key = `${socketId}:${roomId}`;
  const handle = typingTimers.get(key);
  if (handle) {
    clearTimeout(handle);
    typingTimers.delete(key);
  }
}