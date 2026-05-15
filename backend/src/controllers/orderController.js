/**
 * backend/src/controllers/orderController.js
 *
 * All order business logic lives here.
 * Routes in orders.js are thin — they just call these functions.
 * Socket events are emitted here so every mutation broadcasts correctly.
 */

import { PrismaClient } from "@prisma/client";
import { getIO } from "../sockets/index.js";

const prisma = new PrismaClient();

// ─── Price helpers ───────────────────────────────────────────────────────────
const RIDE_PRICE_PER_KM = 5000;
const ESTIMATED_RIDE_KM = 3;

const calcRidePrice = () => ESTIMATED_RIDE_KM * RIDE_PRICE_PER_KM; // Rp 15.000

const calcSendPrice = (foodPrice = 20000) => {
  const fee = 5000 + foodPrice * 0.1;
  return foodPrice + fee;
};

// ─── Emit helper ─────────────────────────────────────────────────────────────
/**
 * Safely emit a socket event. Swallows errors so a socket issue
 * never breaks an otherwise-successful HTTP response.
 */
function emitOrder(event, payload) {
  try {
    getIO().emit(event, payload);
  } catch (err) {
    console.warn("[socket] emit failed:", err.message);
  }
}

// ─── Create Pol-Ride ─────────────────────────────────────────────────────────
export const createPolRide = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, note } = req.body;
    const userId = req.userId;

    if (!pickupLocation?.trim() || !dropoffLocation?.trim()) {
      return res
        .status(400)
        .json({ error: "Lokasi jemput dan tujuan wajib diisi" });
    }

    const order = await prisma.order.create({
      data: {
        type: "pol_ride",
        title: "Pol_Ride",
        description: note?.trim() || "",
        pickup: pickupLocation.trim(),
        destination: dropoffLocation.trim(),
        price: calcRidePrice(),
        customerId: userId,
        status: "pending",
      },
    });

    // Broadcast to all connected drivers so they see the new order immediately
    emitOrder("order:new", { order });

    // Also notify the customer's personal room
    getIO().to(userId.toString()).emit("order:created", { order });

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("[createPolRide]", error);
    return res.status(500).json({ error: "Gagal membuat Pol_Ride" });
  }
};

// ─── Create Pol-Send ─────────────────────────────────────────────────────────
export const createPolSend = async (req, res) => {
  try {
    const { foodName, restaurantName, foodPrice, note } = req.body;
    const userId = req.userId;

    if (!foodName?.trim() || !restaurantName?.trim()) {
      return res
        .status(400)
        .json({ error: "Nama makanan dan restoran wajib diisi" });
    }

    // Validate foodPrice
    const rawPrice = foodPrice !== undefined ? Number(foodPrice) : 20000;
    if (Number.isNaN(rawPrice) || rawPrice <= 0) {
      return res
        .status(400)
        .json({ error: "Harga makanan harus berupa angka positif" });
    }
    if (rawPrice > 100000) {
      return res
        .status(400)
        .json({ error: "Harga makanan maksimal Rp 100.000" });
    }

    const order = await prisma.order.create({
      data: {
        type: "pol_send",
        title: `Jastip: ${foodName.trim()}`,
        description: note?.trim() || "",
        pickup: restaurantName.trim(),
        destination: foodName.trim(),
        price: calcSendPrice(rawPrice),
        customerId: userId,
        status: "pending",
      },
    });

    emitOrder("order:new", { order });
    getIO().to(userId.toString()).emit("order:created", { order });

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("[createPolSend]", error);
    return res.status(500).json({ error: "Gagal membuat Pol_Send" });
  }
};

// ─── Get all user orders ─────────────────────────────────────────────────────
export const getUserOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [{ customerId: req.userId }, { driverId: req.userId }],
      },
      include: {
        customer: { select: { name: true, phone: true, nim: true } },
        driver: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error("[getUserOrders]", error);
    return res.status(500).json({ error: "Gagal mengambil pesanan" });
  }
};

// ─── Get order by ID ─────────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [{ customerId: req.userId }, { driverId: req.userId }],
      },
      include: {
        customer: { select: { name: true, phone: true, nim: true } },
        driver: { select: { name: true, phone: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan" });
    }
    return res.json({ success: true, data: order });
  } catch (error) {
    console.error("[getOrderById]", error);
    return res.status(500).json({ error: "Gagal mengambil detail pesanan" });
  }
};

// ─── Get orders by type ──────────────────────────────────────────────────────
export const getOrdersByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (!["pol_ride", "pol_send"].includes(type)) {
      return res.status(400).json({ error: "Tipe pesanan tidak valid" });
    }
    const orders = await prisma.order.findMany({
      where: {
        type,
        OR: [{ customerId: req.userId }, { driverId: req.userId }],
      },
      include: {
        customer: { select: { name: true, phone: true, nim: true } },
        driver: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error("[getOrdersByType]", error);
    return res.status(500).json({ error: "Gagal mengambil pesanan" });
  }
};

// ─── Get available orders (drivers) ─────────────────────────────────────────
export const getAvailableOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "pending", driverId: null },
      include: {
        customer: { select: { name: true, phone: true, nim: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error("[getAvailableOrders]", error);
    return res.status(500).json({ error: "Gagal mengambil orderan tersedia" });
  }
};

// ─── Accept order (driver) ───────────────────────────────────────────────────
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.userId;

    const existing = await prisma.order.findFirst({
      where: { id, status: "pending", driverId: null },
    });
    if (!existing) {
      return res.status(400).json({ error: "Pesanan sudah diambil atau tidak tersedia" });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { driverId, status: "accepted" },
      include: { customer: { select: { name: true, phone: true } } },
    });

    emitOrder("order:accepted", { order });
    // Notify customer personally
    getIO().to(order.customerId.toString()).emit("order:accepted", { order });

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error("[acceptOrder]", error);
    return res.status(500).json({ error: "Gagal mengambil pesanan" });
  }
};

// ─── Complete order (driver) ─────────────────────────────────────────────────
export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.userId;

    const existing = await prisma.order.findFirst({
      where: { id, driverId, status: "accepted" },
    });
    if (!existing) {
      return res.status(400).json({ error: "Pesanan tidak ditemukan atau belum diambil" });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: "completed", completedAt: new Date() },
    });

    emitOrder("order:completed", { order });
    getIO().to(order.customerId.toString()).emit("order:completed", { order });

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error("[completeOrder]", error);
    return res.status(500).json({ error: "Gagal menyelesaikan pesanan" });
  }
};

// ─── Cancel order (customer only, pending only) ──────────────────────────────
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existing = await prisma.order.findFirst({
      where: { id, customerId: userId, status: "pending" },
    });
    if (!existing) {
      return res
        .status(400)
        .json({ error: "Pesanan tidak dapat dibatalkan" });
    }

    await prisma.order.delete({ where: { id } });

    emitOrder("order:cancelled", { orderId: id });

    return res.json({ success: true, message: "Pesanan dibatalkan" });
  } catch (error) {
    console.error("[cancelOrder]", error);
    return res.status(500).json({ error: "Gagal membatalkan pesanan" });
  }
};
