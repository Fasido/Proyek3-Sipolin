// backend/src/services/chat.service.js
// Service layer chat Sipolin.
// Semua query Prisma untuk chat dipusatkan di sini supaya controller dan socket tetap rapi.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userSelect = {
  id: true,
  name: true,
  email: true,
  nim: true,
  phone: true,
  role: true,
  avatar: true,
  profilePicture: true,
  plateNumber: true,
  vehicleDetail: true,
};

const orderSelect = {
  id: true,
  type: true,
  title: true,
  status: true,
  pickup: true,
  destination: true,
  price: true,
  customerId: true,
  driverId: true,
  createdAt: true,
  updatedAt: true,
};

const messageInclude = {
  sender: {
    select: userSelect,
  },
};

const roomIncludeBase = {
  order: {
    select: orderSelect,
  },
  customer: {
    select: userSelect,
  },
  driver: {
    select: userSelect,
  },
  messages: {
    take: 1,
    orderBy: {
      createdAt: "desc",
    },
    include: messageInclude,
  },
};

const asClientUser = (user) => {
  if (!user) return user;
  return {
    ...user,
    role: String(user.role || "").toLowerCase(),
  };
};

const normalizeRoom = (room, userId = null) => {
  if (!room) return room;

  const unreadCount =
    room._count?.messages ??
    room.unreadCount ??
    0;

  return {
    ...room,
    customer: asClientUser(room.customer),
    driver: asClientUser(room.driver),
    unreadCount,
  };
};

const assertParticipantWhere = (roomId, userId) => ({
  id: roomId,
  OR: [{ customerId: userId }, { driverId: userId }],
});

export async function validateRoomMembership(roomId, userId) {
  if (!roomId || !userId) return false;

  const count = await prisma.chatRoom.count({
    where: assertParticipantWhere(roomId, userId),
  });

  return count > 0;
}

export async function getChatRoomsForUser(userId) {
  const rooms = await prisma.chatRoom.findMany({
    where: {
      OR: [{ customerId: userId }, { driverId: userId }],
    },
    include: {
      ...roomIncludeBase,
      _count: {
        select: {
          messages: {
            where: {
              senderId: {
                not: userId,
              },
              isRead: false,
            },
          },
        },
      },
    },
    orderBy: [
      {
        lastMessageAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return rooms.map((room) => normalizeRoom(room, userId));
}

export async function getChatRoomById(roomId, userId) {
  const room = await prisma.chatRoom.findFirst({
    where: assertParticipantWhere(roomId, userId),
    include: {
      ...roomIncludeBase,
      _count: {
        select: {
          messages: {
            where: {
              senderId: {
                not: userId,
              },
              isRead: false,
            },
          },
        },
      },
    },
  });

  return normalizeRoom(room, userId);
}

export async function findOrCreateChatRoom(orderId, customerId, driverId) {
  const room = await prisma.chatRoom.upsert({
    where: {
      orderId,
    },
    update: {
      customerId,
      driverId,
    },
    create: {
      orderId,
      customerId,
      driverId,
    },
    include: roomIncludeBase,
  });

  return normalizeRoom(room);
}

export async function getMessages(roomId, userId, { cursor, limit = 30 } = {}) {
  const isMember = await validateRoomMembership(roomId, userId);
  if (!isMember) {
    throw new Error("Access denied");
  }

  const take = Math.min(Math.max(Number(limit) || 30, 1), 50);

  const messages = await prisma.message.findMany({
    where: {
      chatRoomId: roomId,
    },
    take: take + 1,
    ...(cursor
      ? {
          cursor: {
            id: cursor,
          },
          skip: 1,
        }
      : {}),
    orderBy: {
      createdAt: "desc",
    },
    include: messageInclude,
  });

  const hasNextPage = messages.length > take;
  const sliced = hasNextPage ? messages.slice(0, take) : messages;
  const ordered = sliced.reverse();

  return {
    items: ordered,
    nextCursor: hasNextPage ? sliced[sliced.length - 1]?.id : null,
    hasNextPage,
  };
}

export async function markMessagesAsRead(roomId, userId) {
  const isMember = await validateRoomMembership(roomId, userId);
  if (!isMember) {
    throw new Error("Access denied");
  }

  return prisma.message.updateMany({
    where: {
      chatRoomId: roomId,
      senderId: {
        not: userId,
      },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

export async function saveMessage({ chatRoomId, senderId, text }) {
  const room = await prisma.chatRoom.findFirst({
    where: assertParticipantWhere(chatRoomId, senderId),
    include: {
      customer: {
        select: userSelect,
      },
      driver: {
        select: userSelect,
      },
      order: {
        select: orderSelect,
      },
    },
  });

  if (!room) {
    throw new Error("Room not found or access denied");
  }

  const cleanText = String(text || "").trim();

  if (!cleanText) {
    throw new Error("Text is required");
  }

  if (cleanText.length > 2000) {
    throw new Error("Message exceeds 2000 characters");
  }

  const recipientId = senderId === room.customerId ? room.driverId : room.customerId;
  const senderName =
    senderId === room.customerId
      ? room.customer?.name || "Pembeli"
      : room.driver?.name || "Driver";

  const result = await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        chatRoomId,
        senderId,
        text: cleanText,
      },
      include: messageInclude,
    });

    await tx.chatRoom.update({
      where: {
        id: chatRoomId,
      },
      data: {
        lastMessage: cleanText,
        lastMessageAt: message.createdAt,
      },
    });

    const notification = await tx.notification.create({
      data: {
        userId: recipientId,
        title: `Pesan baru dari ${senderName}`,
        message: cleanText.length > 80 ? `${cleanText.slice(0, 80)}...` : cleanText,
        type: "chat_message",
        relatedOrderId: room.orderId,
      },
    });

    return {
      message,
      notification,
    };
  });

  return {
    ...result.message,
    notification: result.notification,
    recipientId,
    chatRoom: {
      id: room.id,
      orderId: room.orderId,
      customerId: room.customerId,
      driverId: room.driverId,
      order: room.order,
    },
  };
}
