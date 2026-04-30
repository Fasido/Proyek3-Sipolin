import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.js';
import historyRouter from './orders.history.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 🔧 BRIDGE: Samakan req.userId & req.user.id
 */
router.use(verifyToken, (req, res, next) => {
  if (req.userId && !req.user) {
    req.user = { id: req.userId };
  }
  next();
});

/**
 * 📊 HISTORY ROUTES
 * Endpoint:
 * /orders/history
 * /orders/history/summary
 */
router.use('/', historyRouter);

// ==================== ORDER UMUM ====================

// GET semua order milik user (active + history ringan)
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: userId },
          { driverId: userId }
        ]
      },
      include: {
        customer: { select: { name: true, phone: true, nim: true } },
        driver: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('[GET ORDERS]', error);
    res.status(500).json({ error: 'Gagal mengambil pesanan' });
  }
});

// ==================== DETAIL ====================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          { customerId: userId },
          { driverId: userId }
        ]
      },
      include: {
        customer: { select: { name: true, phone: true, nim: true } },
        driver: { select: { name: true, phone: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('[GET DETAIL]', error);
    res.status(500).json({ error: 'Gagal mengambil detail' });
  }
});

// ==================== FILTER TYPE ====================
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.userId;

    if (!['pol_ride', 'pol_send'].includes(type)) {
      return res.status(400).json({ error: 'Tipe tidak valid' });
    }

    const orders = await prisma.order.findMany({
      where: {
        type,
        OR: [
          { customerId: userId },
          { driverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('[FILTER TYPE]', error);
    res.status(500).json({ error: 'Gagal mengambil data' });
  }
});

// ==================== CREATE POL_RIDE ====================
router.post('/pol_ride', async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, note } = req.body;
    const userId = req.userId;

    if (!pickupLocation || !dropoffLocation) {
      return res.status(400).json({ error: 'Lokasi wajib diisi' });
    }

    const price = 3 * 5000;

    const order = await prisma.order.create({
      data: {
        type: 'pol_ride',
        title: 'Pol_Ride',
        description: note || '',
        pickup: pickupLocation,
        destination: dropoffLocation,
        price,
        customerId: userId,
        status: 'pending',
      },
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('[POL_RIDE]', error);
    res.status(500).json({ error: 'Gagal membuat order' });
  }
});

// ==================== CREATE POL_SEND ====================
router.post('/pol_send', async (req, res) => {
  try {
    const { foodName, restaurantName, foodPrice, note } = req.body;
    const userId = req.userId;

    if (!foodName || !restaurantName) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const harga = foodPrice || 20000;
    const fee = 5000 + harga * 0.1;
    const total = harga + fee;

    const order = await prisma.order.create({
      data: {
        type: 'pol_send',
        title: `Jastip: ${foodName}`,
        description: note || '',
        pickup: restaurantName,
        destination: foodName,
        price: total,
        customerId: userId,
        status: 'pending',
      },
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('[POL_SEND]', error);
    res.status(500).json({ error: 'Gagal membuat order' });
  }
});

// ==================== DRIVER ====================

// GET available
router.get('/available', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'pending', driverId: null },
      include: {
        customer: { select: { name: true, phone: true } },
      },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data' });
  }
});

// ACCEPT
router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.userId;

    const order = await prisma.order.findFirst({
      where: { id, status: 'pending', driverId: null }
    });

    if (!order) {
      return res.status(400).json({ error: 'Order tidak tersedia' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { driverId, status: 'accepted' },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Gagal accept' });
  }
});

// COMPLETE
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.userId;

    const order = await prisma.order.findFirst({
      where: { id, driverId, status: 'accepted' }
    });

    if (!order) {
      return res.status(400).json({ error: 'Order tidak valid' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Gagal complete' });
  }
});

// ==================== CANCEL ====================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await prisma.order.findFirst({
      where: {
        id,
        customerId: userId,
        status: 'pending',
      }
    });

    if (!order) {
      return res.status(400).json({ error: 'Tidak bisa dibatalkan' });
    }

    await prisma.order.delete({ where: { id } });

    res.json({ success: true, message: 'Pesanan dibatalkan' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal cancel' });
  }
});

export default router;