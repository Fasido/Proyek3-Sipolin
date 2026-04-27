import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.js'; 
import historyRouter from './orders.history.js';

const router = express.Router();
const prisma = new PrismaClient();

// 0. JEMBATAN HISTORI (Sudah dipasang Satpam & Penyelaras ID)
router.use('/', verifyToken, (req, res, next) => {
  // Claude pakai req.user.id, tapi sistem lama lo pakai req.userId. 
  // Kita selaraskan otomatis di sini biar gak error!
  if (req.userId && !req.user) {
    req.user = { id: req.userId };
  }
  next();
}, historyRouter);

// 1. Buat Pesanan (TEBENGAN / JASTIP)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { type, title, description, pickup, destination, price } = req.body;
    const userId = req.userId;

    if (!type || !title || !pickup || !destination || !price) {
      return res.status(400).json({ error: 'Data jemput, tujuan, dan harga wajib diisi' });
    }

    const order = await prisma.order.create({
      data: {
        type,
        title,
        description,
        pickup,
        destination,
        price: parseFloat(price),
        customerId: userId,
        status: 'pending',
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('[Orders] Create error:', error);
    res.status(500).json({ error: 'Gagal membuat pesanan' });
  }
});

// 2. Ambil Orderan yang Tersedia (Khusus buat Driver)
router.get('/available', verifyToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: 'pending',
        driverId: null,
      },
      include: {
        customer: { select: { name: true, phone: true, nim: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil orderan tersedia' });
  }
});

// 3. Driver Ambil Orderan
router.post('/:id/accept', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.userId;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        driverId,
        status: 'accepted',
      },
      include: {
        customer: { select: { name: true, phone: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil pesanan ini' });
  }
});

// 4. Selesaikan Orderan
router.post('/:id/complete', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Gagal menyelesaikan pesanan' });
  }
});

// 5. Ambil semua orderan milik user (History Default)
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: req.userId },
          { driverId: req.userId }
        ]
      },
      include: {
        customer: { select: { name: true } },
        driver: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil riwayat' });
  }
});

export default router;