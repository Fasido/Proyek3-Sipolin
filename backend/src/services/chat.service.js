// src/services/chat.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Pure data-access layer for the Chat feature.
// No Express req/res here — only Prisma calls and plain JS objects.
// Both the REST controllers AND the Socket.io handlers call these functions,
// which keeps the business logic in one place.
// ─────────────────────────────────────────────────────────────────────────────

import prisma from "../lib/prisma.js";

// ─── Reusable selector — the fields we always want on a sender object ─────────
const SENDER_SELECT = {
  id: true,
  name: true,
  avatar: true,
  role: true,
};

// ─── Reusable selector — full message shape returned to clients ───────────────
const MESSAGE_SELECT = {
  id: true,
  chatRoomId: true,
  senderId: true,
  text: true,
  isRead: true,
  createdAt: true,
  sender: { select: SENDER_SELECT },
};

// =============================================================================
// ROOM OPERATIONS
// =============================================================================

/**
 * findOrCreateChatRoom
 * ─────────────────────
 * Called when a driver accepts an order. Guarantees idempotency — if the room
 * already exists (e.g., due to a retry) it is simply returned.
 *
 * @param {string} orderId
 * @param {string} customerId
 * @param {string} driverId
 * @returns {Promise<ChatRoom>}
 */
export async function findOrCreateChatRoom(orderId, customerId, driverId) {
  // upsert on the @unique orderId field — safe to call multiple times
  return prisma.chatRoom.upsert({
    where: { orderId },
    update: {}, // already exists — nothing to change
    create: {
      orderId,
      customerId,
      driverId,
    },
    include: {
      customer: { select: SENDER_SELECT },
      driver: { select: SENDER_SELECT },
      order: {
        select: {
          id: true,
          title: true,
          status: true,
          pickup: true,
          destination: true,
        },
      },
    },
  });
}

/**
 * getChatRoomsForUser
 * ────────────────────
 * Returns all chat rooms for a given user (works for both customers and
 * drivers because the schema stores both IDs directly on ChatRoom).
 * Results are ordered by most-recent activity for the inbox screen.
 *
 * @param {string} userId
 * @returns {Promise<ChatRoom[]>}
 */
export async function getChatRoomsForUser(userId) {
  return prisma.chatRoom.findMany({
    where: {
      // Prisma OR: match if user is either participant
      OR: [{ customerId: userId }, { driverId: userId }],
    },
    select: {
      id: true,
      lastMessage: true,
      lastMessageAt: true,
      createdAt: true,
      // Include both participants so the client can display the OTHER person
      customer: { select: SENDER_SELECT },
      driver: { select: SENDER_SELECT },
      order: {
        select: {
          id: true,
          title: true,
          status: true,
          pickup: true,
          destination: true,
        },
      },
      // Unread count: messages NOT sent by this user that are still unread
      _count: {
        select: {
          messages: {
            where: {
              isRead: false,
              senderId: { not: userId },
            },
          },
        },
      },
    },
    orderBy: {
      // nulls last — new empty rooms fall to the bottom
      lastMessageAt: "desc",
    },
  });
}

/**
 * getChatRoomById
 * ────────────────
 * Fetches a single room and validates that the requesting user is a member.
 * Returns null if the room doesn't exist OR the user is not a participant —
 * the controller maps null → 403/404 as appropriate.
 *
 * @param {string} roomId
 * @param {string} userId  - the requesting user
 * @returns {Promise<ChatRoom|null>}
 */
export async function getChatRoomById(roomId, userId) {
  return prisma.chatRoom.findFirst({
    where: {
      id: roomId,
      OR: [{ customerId: userId }, { driverId: userId }],
    },
    include: {
      customer: { select: SENDER_SELECT },
      driver: { select: SENDER_SELECT },
      order: {
        select: {
          id: true,
          title: true,
          status: true,
          pickup: true,
          destination: true,
        },
      },
    },
  });
}

// =============================================================================
// MESSAGE OPERATIONS
// =============================================================================

/**
 * getMessages
 * ────────────
 * Cursor-based pagination — fetches `limit` messages BEFORE `cursor`.
 * The client scrolls up to trigger the next page.
 *
 * Returned order is oldest-first (ascending createdAt) so the FlatList
 * renders naturally from top to bottom without reversing.
 *
 * @param {string}  roomId
 * @param {string}  userId  - used to mark fetched messages as read
 * @param {object}  opts
 * @param {string}  [opts.cursor]   - message id — fetch messages before this
 * @param {number}  [opts.limit=30]
 * @returns {Promise<{ messages: Message[], hasMore: boolean, nextCursor: string|null }>}
 */
export async function getMessages(roomId, userId, { cursor, limit = 30 } = {}) {
  // Fetch one extra record to determine whether another page exists
  const take = limit + 1;

  const messages = await prisma.message.findMany({
    where: { chatRoomId: roomId },
    select: MESSAGE_SELECT,
    orderBy: { createdAt: "desc" }, // desc so cursor gives us "older" messages
    take,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1, // skip the cursor record itself
        }
      : {}),
  });

  const hasMore = messages.length === take;
  if (hasMore) messages.pop(); // remove the extra sentinel record

  // Reverse so the client receives oldest-first
  messages.reverse();

  const nextCursor = hasMore ? messages[0]?.id ?? null : null;

  // Side-effect: mark all messages in this room sent by OTHER users as read
  // Fire-and-forget — we don't await this to keep the response fast.
  markMessagesAsRead(roomId, userId).catch((err) =>
    console.error("[chat.service] markMessagesAsRead failed:", err)
  );

  return { messages, hasMore, nextCursor };
}

/**
 * saveMessage
 * ────────────
 * Persists a new Message AND updates the ChatRoom's denormalised
 * lastMessage + lastMessageAt fields in a single atomic transaction.
 *
 * Using $transaction ensures the inbox cache is never stale — either both
 * writes succeed or neither does.
 *
 * @param {object} data
 * @param {string} data.chatRoomId
 * @param {string} data.senderId
 * @param {string} data.text
 * @returns {Promise<Message>}  the created message with sender included
 */
export async function saveMessage({ chatRoomId, senderId, text }) {
  const [message] = await prisma.$transaction([
    // 1. Create the message
    prisma.message.create({
      data: { chatRoomId, senderId, text },
      select: MESSAGE_SELECT,
    }),
    // 2. Update the room's inbox preview cache atomically
    prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: {
        lastMessage: text,
        lastMessageAt: new Date(),
      },
    }),
  ]);

  return message;
}

/**
 * markMessagesAsRead
 * ───────────────────
 * Bulk-marks all unread messages in a room that were NOT sent by `userId`
 * (i.e., messages the OTHER participant sent, now being read).
 *
 * Called automatically when a user fetches messages and also when they
 * emit a `join_room` socket event.
 *
 * @param {string} roomId
 * @param {string} userId  - the reader, NOT the sender
 * @returns {Promise<{ count: number }>}
 */
export async function markMessagesAsRead(roomId, userId) {
  return prisma.message.updateMany({
    where: {
      chatRoomId: roomId,
      isRead: false,
      senderId: { not: userId }, // only mark OTHER person's messages
    },
    data: { isRead: true },
  });
}

/**
 * validateRoomMembership
 * ───────────────────────
 * Lightweight check — used by the socket handler before allowing any event.
 * Returns true if userId is either the customer or driver of this room.
 *
 * @param {string} roomId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function validateRoomMembership(roomId, userId) {
  const room = await prisma.chatRoom.findFirst({
    where: {
      id: roomId,
      OR: [{ customerId: userId }, { driverId: userId }],
    },
    select: { id: true },
  });
  return room !== null;
}