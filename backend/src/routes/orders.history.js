/**
 * backend/src/routes/orders.history.js — SIPOLIN Order History Route
 * ───────────────────────────────────────────────────────────────────
 * Mount di file utama order router (routes/orders.js) dengan:
 *
 * import historyRouter from './orders.history.js';
 * router.use('/', historyRouter);
 *
 * Endpoint:
 * GET /api/orders/history          — histori pesanan (completed | cancelled)
 * GET /api/orders/history/summary  — ringkasan statistik histori
 */

import express from 'express';
import { PrismaClient } from '@prisma/client'; // ✅ INI YANG DIBENERIN (Pakai Import)

const router = express.Router();
const prisma = new PrismaClient();

// Status yang masuk ke "histori" (bukan yang sedang berjalan)
const HISTORY_STATUSES = ['completed', 'cancelled'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseIntSafe = (val, fallback) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : fallback;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/history
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Ambil histori pesanan (completed + cancelled) milik user yang login.
 * User bisa berperan sebagai CUSTOMER atau DRIVER — keduanya digabungkan.
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      status,
      role   = 'all',
      page   = '1',
      limit  = '20',
    } = req.query;

    // ── Pagination ────────────────────────────────────────────────────────────
    const take = Math.min(parseIntSafe(limit, 20), 50);
    const skip = (parseIntSafe(page, 1) - 1) * take;

    // ── Status filter ─────────────────────────────────────────────────────────
    const statusFilter = status && HISTORY_STATUSES.includes(status)
      ? [status]
      : HISTORY_STATUSES;

    // ── Role-based WHERE clause ───────────────────────────────────────────────
    let whereClause;
    if (role === 'customer') {
      whereClause = { customerId: userId, status: { in: statusFilter } };
    } else if (role === 'driver') {
      whereClause = { driverId: userId,   status: { in: statusFilter } };
    } else {
      // "all" — tampilkan pesanan sebagai customer ATAU driver
      whereClause = {
        status: { in: statusFilter },
        OR: [
          { customerId: userId },
          { driverId:   userId },
        ],
      };
    }

    // ── Query ─────────────────────────────────────────────────────────────────
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where:   whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          customer: {
            select: {
              id:             true,
              name:           true,
              phone:          true,
              profilePicture: true,
            },
          },
          driver: {
            select: {
              id:             true,
              name:           true,
              phone:          true,
              profilePicture: true,
              plateNumber:    true,
              vehicleDetail:  true,
              isVerified:     true,
            },
          },
        },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / take);
    const currentPage = parseIntSafe(page, 1);

    return res.json({
      success: true,
      orders,
      pagination: {
        total,
        page:       currentPage,
        limit:      take,
        totalPages,
        hasNext:    currentPage < totalPages,
        hasPrev:    currentPage > 1,
      },
    });

  } catch (err) {
    console.error('[GET /orders/history]', err);
    return res.status(500).json({ error: 'Gagal mengambil histori pesanan.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/history/summary
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Statistik ringkasan histori pesanan milik user.
 */
router.get('/history/summary', async (req, res) => {
  try {
    const userId = req.user.id;

    const [asCustomer, asDriver] = await Promise.all([
      // Sebagai customer
      prisma.order.groupBy({
        by:     ['status'],
        where:  { customerId: userId, status: { in: HISTORY_STATUSES } },
        _count: { _all: true },
        _sum:   { price: true },
      }),
      // Sebagai driver
      prisma.order.groupBy({
        by:     ['status'],
        where:  { driverId: userId, status: { in: HISTORY_STATUSES } },
        _count: { _all: true },
      }),
    ]);

    // Flatten customer stats
    const completedCustomer = asCustomer.find((r) => r.status === 'completed');
    const cancelledCustomer = asCustomer.find((r) => r.status === 'cancelled');
    const completedDriver   = asDriver.find((r) => r.status === 'completed');
    const cancelledDriver   = asDriver.find((r) => r.status === 'cancelled');

    const totalCompleted = (completedCustomer?._count._all || 0) + (completedDriver?._count._all || 0);
    const totalCancelled = (cancelledCustomer?._count._all || 0) + (cancelledDriver?._count._all || 0);

    return res.json({
      success: true,
      summary: {
        totalOrders:    totalCompleted + totalCancelled,
        totalCompleted,
        totalCancelled,
        totalSpent:     completedCustomer?._sum.price || 0,
        asCustomer:     asCustomer.reduce((s, r) => s + r._count._all, 0),
        asDriver:       asDriver.reduce((s, r) => s + r._count._all, 0),
      },
    });

  } catch (err) {
    console.error('[GET /orders/history/summary]', err);
    return res.status(500).json({ error: 'Gagal mengambil ringkasan histori.' });
  }
});

export default router;