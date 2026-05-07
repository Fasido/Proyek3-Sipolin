// src/controllers/chat.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles HTTP requests for the Chat feature REST API.
// Delegates all database work to chat.service.js.
//
// Endpoints covered:
//   GET  /api/chat/rooms              — inbox: all rooms for the auth'd user
//   POST /api/chat/rooms              — create/get room when driver accepts
//   GET  /api/chat/rooms/:roomId      — single room metadata
//   GET  /api/chat/rooms/:roomId/messages — paginated message history
//   POST /api/chat/rooms/:roomId/read — mark messages as read (REST fallback)
// ─────────────────────────────────────────────────────────────────────────────

import {
  getChatRoomsForUser,
  getChatRoomById,
  findOrCreateChatRoom,
  getMessages,
  markMessagesAsRead,
} from "../services/chat.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/chat/rooms
// ─────────────────────────────────────────────────────────────────────────────
// Returns all chat rooms the authenticated user is part of, ordered by most
// recent activity. Powers the inbox list screen.
// ─────────────────────────────────────────────────────────────────────────────
export async function getMyRooms(req, res) {
  try {
    const userId = req.user.id;
    const rooms = await getChatRoomsForUser(userId);
    return res.status(200).json({ success: true, data: rooms });
  } catch (err) {
    console.error("[chat.controller] getMyRooms:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch chat rooms" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat/rooms
// ─────────────────────────────────────────────────────────────────────────────
// Creates a chat room for an order (idempotent — safe to call multiple times).
// Intended to be called by the backend itself when a driver accepts an order,
// but exposed as a REST endpoint for flexibility and admin tooling.
//
// Body: { orderId, customerId, driverId }
// ─────────────────────────────────────────────────────────────────────────────
export async function createRoom(req, res) {
  try {
    const { orderId, customerId, driverId } = req.body;

    if (!orderId || !customerId || !driverId) {
      return res.status(400).json({
        success: false,
        message: "orderId, customerId, and driverId are required",
      });
    }

    // Only the driver or an admin should be able to create rooms
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    if (requesterId !== driverId && requesterRole !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const room = await findOrCreateChatRoom(orderId, customerId, driverId);
    return res.status(200).json({ success: true, data: room });
  } catch (err) {
    console.error("[chat.controller] createRoom:", err);
    return res.status(500).json({ success: false, message: "Failed to create chat room" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/chat/rooms/:roomId
// ─────────────────────────────────────────────────────────────────────────────
// Returns metadata for a single room.
// Returns 404 if the room doesn't exist.
// Returns 403 if the requesting user is not a participant.
// ─────────────────────────────────────────────────────────────────────────────
export async function getRoom(req, res) {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await getChatRoomById(roomId, userId);

    if (!room) {
      // We deliberately return 403 in both cases (not found AND no access) to
      // avoid leaking information about the existence of other users' rooms.
      return res.status(403).json({ success: false, message: "Room not found or access denied" });
    }

    return res.status(200).json({ success: true, data: room });
  } catch (err) {
    console.error("[chat.controller] getRoom:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch room" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/chat/rooms/:roomId/messages
// ─────────────────────────────────────────────────────────────────────────────
// Paginated message history for a room.
// Used to load the initial batch when a user opens the chat screen.
// Real-time new messages arrive via Socket.io — this endpoint is for history.
//
// Query params:
//   cursor  {string}  — message id to paginate from (fetch messages before this)
//   limit   {number}  — messages per page, default 30, max 50
// ─────────────────────────────────────────────────────────────────────────────
export async function getRoomMessages(req, res) {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // ── Auth: verify membership ──────────────────────────────────────────────
    const room = await getChatRoomById(roomId, userId);
    if (!room) {
      return res.status(403).json({ success: false, message: "Room not found or access denied" });
    }

    // ── Parse & clamp pagination params ─────────────────────────────────────
    const cursor = req.query.cursor ?? undefined;
    const rawLimit = parseInt(req.query.limit ?? "30", 10);
    const limit = Number.isNaN(rawLimit)
      ? 30
      : Math.min(Math.max(rawLimit, 1), 50); // clamp to [1, 50]

    const result = await getMessages(roomId, userId, { cursor, limit });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("[chat.controller] getRoomMessages:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat/rooms/:roomId/read
// ─────────────────────────────────────────────────────────────────────────────
// REST fallback to mark messages as read.
// The socket handler does this automatically on join_room, but clients
// without an active socket (e.g., push notification tap with the app closed)
// can call this endpoint instead.
// ─────────────────────────────────────────────────────────────────────────────
export async function markRoomAsRead(req, res) {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Verify membership before allowing the write
    const room = await getChatRoomById(roomId, userId);
    if (!room) {
      return res.status(403).json({ success: false, message: "Room not found or access denied" });
    }

    const { count } = await markMessagesAsRead(roomId, userId);

    return res.status(200).json({ success: true, data: { markedRead: count } });
  } catch (err) {
    console.error("[chat.controller] markRoomAsRead:", err);
    return res.status(500).json({ success: false, message: "Failed to mark messages as read" });
  }
}