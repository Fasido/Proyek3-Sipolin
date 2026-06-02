/**
 * backend/src/controllers/orderController.js
 *
 * Logic utama order Sipolin:
 * - Mahasiswa/customer membuat order Pol-Ride / Pol-Send
 * - Driver melihat order pending
 * - Driver mengambil order
 * - Driver menyelesaikan order
 * - Customer membatalkan order pending
 */

import { PrismaClient } from "@prisma/client";
import { getIO } from "../sockets/index.js";

const prisma = new PrismaClient();

const STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  ARRIVED: "arrived",
  PICKED_UP: "picked_up",
  ON_THE_WAY: "on_the_way",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const ACTIVE_DRIVER_STATUSES = [
  STATUS.ACCEPTED,
  STATUS.ARRIVED,
  STATUS.PICKED_UP,
  STATUS.ON_THE_WAY,
];

const PROGRESS_LABELS = {
  [STATUS.ACCEPTED]: "Driver menuju lokasi jemput/toko",
  [STATUS.ARRIVED]: "Driver sudah sampai di lokasi jemput/toko",
  [STATUS.PICKED_UP]: "User/barang sudah dijemput/diambil",
  [STATUS.ON_THE_WAY]: "Driver menuju lokasi tujuan",
  [STATUS.COMPLETED]: "Pesanan selesai",
};

const ALLOWED_PROGRESS_TRANSITIONS = {
  [STATUS.ACCEPTED]: [STATUS.ARRIVED],
  [STATUS.ARRIVED]: [STATUS.PICKED_UP],
  [STATUS.PICKED_UP]: [STATUS.ON_THE_WAY],
  [STATUS.ON_THE_WAY]: [STATUS.COMPLETED],
};

const ORDER_TYPE = {
  POL_RIDE: "pol_ride",
  POL_SEND: "pol_send",
};

const RIDE_PRICE_PER_KM = 5000;
const ESTIMATED_RIDE_KM = 3;
const SEND_BASE_FEE = 5000;
const SEND_SERVICE_PERCENT = 0.1;

const calcRidePrice = () => ESTIMATED_RIDE_KM * RIDE_PRICE_PER_KM;

const calcSendPrice = (itemPrice = 20000) => {
  const price = Number(itemPrice || 20000);
  const fee = SEND_BASE_FEE + price * SEND_SERVICE_PERCENT;
  return Math.round(price + fee);
};

const firstString = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
};

const toNullableFloat = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

const buildOrderLocationData = (body = {}) => ({
  pickupLatitude: toNullableFloat(body.pickupLatitude, body.pickupLat, body.fromLatitude),
  pickupLongitude: toNullableFloat(body.pickupLongitude, body.pickupLng, body.fromLongitude),
  destinationLatitude: toNullableFloat(
    body.destinationLatitude,
    body.destinationLat,
    body.dropoffLatitude,
    body.dropOffLatitude,
    body.toLatitude
  ),
  destinationLongitude: toNullableFloat(
    body.destinationLongitude,
    body.destinationLng,
    body.dropoffLongitude,
    body.dropOffLongitude,
    body.toLongitude
  ),
  pickupNote: firstString(body.pickupNote, body.fromNote, body.senderNote),
  destinationNote: firstString(body.destinationNote, body.dropoffNote, body.dropOffNote, body.toNote, body.receiverNote),
});

const normalizeRole = (role) => String(role || "").toUpperCase();
const isDriverRole = (role) => normalizeRole(role) === "DRIVER";

const publicUserSelect = {
  id: true,
  name: true,
  phone: true,
  nim: true,
  role: true,
  plateNumber: true,
  vehicleDetail: true,
  profilePicture: true,
  avatar: true,
};

const orderInclude = {
  customer: {
    select: publicUserSelect,
  },
  driver: {
    select: publicUserSelect,
  },
  chatRoom: {
    select: {
      id: true,
      orderId: true,
      customerId: true,
      driverId: true,
      lastMessage: true,
      lastMessageAt: true,
    },
  },
};

function emitOrder(event, payload) {
  try {
    const io = getIO();
    io.emit(event, payload);
  } catch (err) {
    console.warn(`[socket] emit ${event} failed:`, err.message);
  }
}

function emitToUser(userId, event, payload) {
  try {
    if (!userId) return;
    const io = getIO();
    io.to(String(userId)).emit(event, payload);
  } catch (err) {
    console.warn(`[socket] emit ${event} to user failed:`, err.message);
  }
}

async function createNotificationSafe({ userId, title, message, type = "order", relatedOrderId = null }) {
  try {
    if (!userId) return;

    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        relatedOrderId,
      },
    });
  } catch (err) {
    console.warn("[notification] create failed:", err.message);
  }
}

async function getActor(req) {
  if (!req.userId) return null;

  return prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      role: true,
      name: true,
      isActive: true,
    },
  });
}

async function makeChatRoomSafe(order) {
  try {
    if (!order?.id || !order?.customerId || !order?.driverId) return null;

    return await prisma.chatRoom.upsert({
      where: {
        orderId: order.id,
      },
      update: {
        driverId: order.driverId,
      },
      create: {
        orderId: order.id,
        customerId: order.customerId,
        driverId: order.driverId,
      },
    });
  } catch (err) {
    console.warn("[chatRoom] create/upsert failed:", err.message);
    return null;
  }
}

// ─── Create Pol-Ride ─────────────────────────────────────────────────────────
export const createPolRide = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Login diperlukan untuk membuat pesanan",
      });
    }

    const actor = await getActor(req);

    if (!actor || actor.isActive === false) {
      return res.status(403).json({
        success: false,
        error: "Akun tidak aktif atau tidak ditemukan",
      });
    }

    const pickup = firstString(req.body.pickupLocation, req.body.pickup, req.body.from);
    const destination = firstString(
      req.body.dropoffLocation,
      req.body.destination,
      req.body.dropOffLocation,
      req.body.to
    );
    const note = firstString(req.body.note, req.body.description);

    if (!pickup || !destination) {
      return res.status(400).json({
        success: false,
        error: "Lokasi jemput dan tujuan wajib diisi",
      });
    }

    const order = await prisma.order.create({
      data: {
        type: ORDER_TYPE.POL_RIDE,
        title: "Pol-Ride",
        description: note,
        pickup,
        destination,
        ...buildOrderLocationData(req.body),
        price: calcRidePrice(),
        customerId: userId,
        status: STATUS.PENDING,
      },
      include: orderInclude,
    });

    emitOrder("order:new", { order });
    emitToUser(userId, "order:created", { order });

    return res.status(201).json({
      success: true,
      message: "Pesanan Pol-Ride berhasil dibuat",
      data: order,
    });
  } catch (error) {
    console.error("[createPolRide]", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Gagal membuat pesanan Pol-Ride",
    });
  }
};

// ─── Create Pol-Send ─────────────────────────────────────────────────────────
export const createPolSend = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Login diperlukan untuk membuat pesanan",
      });
    }

    const actor = await getActor(req);

    if (!actor || actor.isActive === false) {
      return res.status(403).json({
        success: false,
        error: "Akun tidak aktif atau tidak ditemukan",
      });
    }

    const itemName = firstString(
      req.body.itemName,
      req.body.packageName,
      req.body.foodName,
      req.body.goodsName,
      req.body.title
    );

    const pickup = firstString(
      req.body.pickupLocation,
      req.body.pickup,
      req.body.restaurantName,
      req.body.senderLocation,
      req.body.from
    );

    const destination = firstString(
      req.body.dropoffLocation,
      req.body.dropOffLocation,
      req.body.destination,
      req.body.receiverLocation,
      req.body.to,
      itemName
    );

    const note = firstString(req.body.note, req.body.description);
    const rawPrice = Number(req.body.foodPrice ?? req.body.itemPrice ?? req.body.price ?? 20000);

    if (!itemName || !pickup) {
      return res.status(400).json({
        success: false,
        error: "Nama barang dan lokasi pengambilan wajib diisi",
      });
    }

    if (Number.isNaN(rawPrice) || rawPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: "Harga barang harus berupa angka positif",
      });
    }

    if (rawPrice > 1000000) {
      return res.status(400).json({
        success: false,
        error: "Harga barang maksimal Rp 1.000.000",
      });
    }

    const order = await prisma.order.create({
      data: {
        type: ORDER_TYPE.POL_SEND,
        title: `Pol-Send: ${itemName}`,
        description: note,
        pickup,
        destination,
        ...buildOrderLocationData(req.body),
        price: calcSendPrice(rawPrice),
        customerId: userId,
        status: STATUS.PENDING,
      },
      include: orderInclude,
    });

    emitOrder("order:new", { order });
    emitToUser(userId, "order:created", { order });

    return res.status(201).json({
      success: true,
      message: "Pesanan Pol-Send berhasil dibuat",
      data: order,
    });
  } catch (error) {
    console.error("[createPolSend]", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Gagal membuat pesanan Pol-Send",
    });
  }
};

// ─── Get all user orders ─────────────────────────────────────────────────────
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Token tidak valid",
      });
    }

    const actor = await getActor(req);

    if (!actor) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    const where = isDriverRole(actor.role)
      ? { driverId: userId }
      : { customerId: userId };

    const orders = await prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("[getUserOrders]", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Gagal mengambil pesanan",
    });
  }
};

// ─── Get order by ID ─────────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const actor = await getActor(req);

    if (!actor) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    const where = isDriverRole(actor.role)
      ? {
          id,
          OR: [
            { driverId: userId },
            { status: STATUS.PENDING, driverId: null },
          ],
        }
      : {
          id,
          customerId: userId,
        };

    const order = await prisma.order.findFirst({
      where,
      include: orderInclude,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Pesanan tidak ditemukan atau tidak bisa diakses",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("[getOrderById]", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Gagal mengambil detail pesanan",
    });
  }
};

// ─── Get orders by type ──────────────────────────────────────────────────────
export const getOrdersByType = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.userId;
    const actor = await getActor(req);

    if (![ORDER_TYPE.POL_RIDE, ORDER_TYPE.POL_SEND].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Tipe pesanan tidak valid",
      });
    }

    if (!actor) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    const where = isDriverRole(actor.role)
      ? { type, driverId: userId }
      : { type, customerId: userId };

    const orders = await prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("[getOrdersByType]", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Gagal mengambil pesanan berdasarkan tipe",
    });
  }
};

// ─── Get available orders (drivers) ─────────────────────────────────────────
export const getAvailableOrders = async (req, res) => {
  try {
    const actor = await getActor(req);

    if (!actor) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    if (!isDriverRole(actor.role)) {
      return res.status(403).json({
        success: false,
        error: "Hanya driver yang bisa melihat order tersedia",
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        status: STATUS.PENDING,
        driverId: null,
      },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("[getAvailableOrders]", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Gagal mengambil orderan tersedia",
    });
  }
};

// ─── Accept order (driver) ───────────────────────────────────────────────────
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.userId;
    const actor = await getActor(req);

    if (!actor) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    if (!isDriverRole(actor.role)) {
      return res.status(403).json({
        success: false,
        error: "Hanya driver yang bisa mengambil pesanan",
      });
    }

    const updateResult = await prisma.order.updateMany({
      where: {
        id,
        status: STATUS.PENDING,
        driverId: null,
        customerId: {
          not: driverId,
        },
      },
      data: {
        driverId,
        status: STATUS.ACCEPTED,
      },
    });

    if (updateResult.count === 0) {
      return res.status(400).json({
        success: false,
        error: "Pesanan sudah diambil, tidak tersedia, atau tidak boleh diambil oleh akun ini",
      });
    }

    let order = await prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    await makeChatRoomSafe(order);

    order = await prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    await createNotificationSafe({
      userId: order.customerId,
      title: "Pesanan diterima driver",
      message: `${actor.name || "Driver"} sudah mengambil pesanan kamu.`,
      type: "order_accepted",
      relatedOrderId: order.id,
    });

    emitOrder("order:accepted", { order });
    emitToUser(order.customerId, "order:accepted", { order });
    emitToUser(driverId, "order:accepted", { order });

    return res.json({
      success: true,
      message: "Pesanan berhasil diambil",
      data: order,
    });
  } catch (error) {
    console.error("[acceptOrder]", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Gagal mengambil pesanan",
    });
  }
};


// ─── Update order progress (driver manual status) ────────────────────────────
export const updateOrderProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.userId;
    const nextStatus = String(req.body.status || req.body.nextStatus || "").toLowerCase();
    const actor = await getActor(req);

    if (!actor) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    if (!isDriverRole(actor.role)) {
      return res.status(403).json({
        success: false,
        error: "Hanya driver yang bisa mengubah progress pesanan",
      });
    }

    const allowedNext = [STATUS.ARRIVED, STATUS.PICKED_UP, STATUS.ON_THE_WAY, STATUS.COMPLETED];

    if (!allowedNext.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        error: "Status progress tidak valid",
        allowed: allowedNext,
      });
    }

    const currentOrder = await prisma.order.findFirst({
      where: {
        id,
        driverId,
      },
      include: orderInclude,
    });

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        error: "Pesanan tidak ditemukan atau bukan milik driver ini",
      });
    }

    const currentStatus = String(currentOrder.status || "").toLowerCase();

    if (currentStatus === STATUS.COMPLETED || currentStatus === STATUS.CANCELLED) {
      return res.status(400).json({
        success: false,
        error: "Pesanan sudah selesai/dibatalkan, progress tidak bisa diubah",
      });
    }

    const expectedNext = ALLOWED_PROGRESS_TRANSITIONS[currentStatus] || [];

    if (!expectedNext.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        error: `Urutan progress tidak valid. Status sekarang: ${currentStatus}`,
        currentStatus,
        expectedNext,
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: nextStatus,
        ...(nextStatus === STATUS.COMPLETED && { completedAt: new Date() }),
      },
      include: orderInclude,
    });

    await createNotificationSafe({
      userId: order.customerId,
      title: "Progress pesanan diperbarui",
      message: PROGRESS_LABELS[nextStatus] || "Progress pesanan diperbarui oleh driver.",
      type: "order_progress",
      relatedOrderId: order.id,
    });

    emitOrder("order:progress", { order });
    emitToUser(order.customerId, "order:progress", { order });
    emitToUser(driverId, "order:progress", { order });

    return res.json({
      success: true,
      message: PROGRESS_LABELS[nextStatus] || "Progress pesanan diperbarui",
      data: order,
    });
  } catch (error) {
    console.error("[updateOrderProgress]", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Gagal mengubah progress pesanan",
    });
  }
};

// ─── Complete order (driver) ─────────────────────────────────────────────────
export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.userId;
    const actor = await getActor(req);

    if (!actor) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    if (!isDriverRole(actor.role)) {
      return res.status(403).json({
        success: false,
        error: "Hanya driver yang bisa menyelesaikan pesanan",
      });
    }

    const updateResult = await prisma.order.updateMany({
      where: {
        id,
        driverId,
        status: {
          in: ACTIVE_DRIVER_STATUSES,
        },
      },
      data: {
        status: STATUS.COMPLETED,
        completedAt: new Date(),
      },
    });

    if (updateResult.count === 0) {
      return res.status(400).json({
        success: false,
        error: "Pesanan tidak ditemukan, belum diambil, atau sudah selesai",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    await createNotificationSafe({
      userId: order.customerId,
      title: "Pesanan selesai",
      message: "Pesanan kamu sudah diselesaikan oleh driver.",
      type: "order_completed",
      relatedOrderId: order.id,
    });

    emitOrder("order:completed", { order });
    emitToUser(order.customerId, "order:completed", { order });
    emitToUser(driverId, "order:completed", { order });

    return res.json({
      success: true,
      message: "Pesanan berhasil diselesaikan",
      data: order,
    });
  } catch (error) {
    console.error("[completeOrder]", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Gagal menyelesaikan pesanan",
    });
  }
};

// ─── Cancel order (customer only, pending only) ──────────────────────────────
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const updateResult = await prisma.order.updateMany({
      where: {
        id,
        customerId: userId,
        status: STATUS.PENDING,
        driverId: null,
      },
      data: {
        status: STATUS.CANCELLED,
      },
    });

    if (updateResult.count === 0) {
      return res.status(400).json({
        success: false,
        error: "Pesanan tidak dapat dibatalkan karena sudah diambil atau tidak ditemukan",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    emitOrder("order:cancelled", { order });
    emitToUser(userId, "order:cancelled", { order });

    return res.json({
      success: true,
      message: "Pesanan dibatalkan",
      data: order,
    });
  } catch (error) {
    console.error("[cancelOrder]", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Gagal membatalkan pesanan",
    });
  }
};