// backend/src/controllers/chat.controllers.js
// REST controller untuk fitur chat Sipolin.

import {
  getChatRoomsForUser,
  getChatRoomById,
  findOrCreateChatRoom,
  getMessages,
  markMessagesAsRead,
  saveMessage,
} from "../services/chat.service.js";

const getAuthUser = (req) => {
  const id = req.userId || req.user?.id || req.user?.userId;
  const role = req.userRole || req.user?.role;
  return {
    id,
    role: String(role || "").toLowerCase(),
  };
};

export async function getMyRooms(req, res) {
  try {
    const user = getAuthUser(req);

    if (!user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const rooms = await getChatRoomsForUser(user.id);
    return res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (err) {
    console.error("[chat.controller] getMyRooms:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat rooms",
    });
  }
}

export async function createRoom(req, res) {
  try {
    const { orderId, customerId, driverId } = req.body;
    const user = getAuthUser(req);

    if (!orderId || !customerId || !driverId) {
      return res.status(400).json({
        success: false,
        message: "orderId, customerId, and driverId are required",
      });
    }

    if (user.id !== driverId && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const room = await findOrCreateChatRoom(orderId, customerId, driverId);

    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (err) {
    console.error("[chat.controller] createRoom:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create chat room",
    });
  }
}

export async function getRoom(req, res) {
  try {
    const { roomId } = req.params;
    const user = getAuthUser(req);

    const room = await getChatRoomById(roomId, user.id);

    if (!room) {
      return res.status(403).json({
        success: false,
        message: "Room not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (err) {
    console.error("[chat.controller] getRoom:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch room",
    });
  }
}

export async function getRoomMessages(req, res) {
  try {
    const { roomId } = req.params;
    const user = getAuthUser(req);

    const room = await getChatRoomById(roomId, user.id);
    if (!room) {
      return res.status(403).json({
        success: false,
        message: "Room not found or access denied",
      });
    }

    const cursor = req.query.cursor ?? undefined;
    const rawLimit = parseInt(req.query.limit ?? "30", 10);
    const limit = Number.isNaN(rawLimit) ? 30 : Math.min(Math.max(rawLimit, 1), 50);

    const result = await getMessages(roomId, user.id, {
      cursor,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("[chat.controller] getRoomMessages:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
}

export async function sendRoomMessage(req, res) {
  try {
    const { roomId } = req.params;
    const { text } = req.body;
    const user = getAuthUser(req);

    const saved = await saveMessage({
      chatRoomId: roomId,
      senderId: user.id,
      text,
    });

    return res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (err) {
    console.error("[chat.controller] sendRoomMessage:", err);
    return res.status(400).json({
      success: false,
      message: err?.message || "Failed to send message",
    });
  }
}

export async function markRoomAsRead(req, res) {
  try {
    const { roomId } = req.params;
    const user = getAuthUser(req);

    const room = await getChatRoomById(roomId, user.id);
    if (!room) {
      return res.status(403).json({
        success: false,
        message: "Room not found or access denied",
      });
    }

    const { count } = await markMessagesAsRead(roomId, user.id);

    return res.status(200).json({
      success: true,
      data: {
        markedRead: count,
      },
    });
  } catch (err) {
    console.error("[chat.controller] markRoomAsRead:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
}
