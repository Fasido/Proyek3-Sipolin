import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ==================== ORDER UMUM ====================
// Ambil semua pesanan user (History)
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
        customer: { select: { name: true, phone: true, nim: true } },
        driver: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil riwayat' });
  }
});

// Ambil detail pesanan by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: {
        id: id,
        OR: [
          { customerId: req.userId },
          { driverId: req.userId }
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
    res.status(500).json({ error: 'Gagal mengambil detail pesanan' });
  }
});

// Ambil pesanan berdasarkan tipe (pol_ride / pol_send)
router.get('/type/:type', verifyToken, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['pol_ride', 'pol_send'].includes(type)) {
      return res.status(400).json({ error: 'Tipe pesanan harus pol_ride atau pol_send' });
    }

    const orders = await prisma.order.findMany({
      where: {
        type: type,
        OR: [
          { customerId: req.userId },
          { driverId: req.userId }
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
    res.status(500).json({ error: 'Gagal mengambil pesanan' });
  }
});

// ==================== POL_RIDE (Antar Jemput) ====================
router.post('/pol_ride', verifyToken, async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, scheduledTime, note } = req.body;
    const userId = req.userId;

    if (!pickupLocation || !dropoffLocation) {
      return res.status(400).json({ error: 'Lokasi jemput dan tujuan wajib diisi' });
    }

    const estimatedDistance = 3; // TODO: Google Maps API
    const price = estimatedDistance * 5000;

    const order = await prisma.order.create({
      data: {
        type: 'pol_ride',
        title: 'Pol_Ride (Antar Jemput)',
        description: note || '',
        pickup: pickupLocation,
        destination: dropoffLocation,
        price: price,
        customerId: userId,
        status: 'pending',
      },
    });

    res.status(201).json({ 
      success: true, 
      data: order,
      message: `Pesanan Pol_Ride berhasil dibuat. Harga: Rp ${price.toLocaleString()}`
    });
  } catch (error) {
    console.error('[Pol_Ride] Error:', error);
    res.status(500).json({ error: 'Gagal membuat pesanan Pol_Ride' });
  }
});

// ==================== POL_SEND (Jastip Makanan) ====================
router.post('/pol_send', verifyToken, async (req, res) => {
  try {
    const { foodName, restaurantName, foodPrice, photoUrl, note } = req.body;
    const userId = req.userId;

    if (!foodName || !restaurantName) {
      return res.status(400).json({ error: 'Nama makanan dan restoran wajib diisi' });
    }

    const hargaMakanan = foodPrice || 20000;
    const jastipFee = 5000 + (hargaMakanan * 0.1);
    const totalPrice = hargaMakanan + jastipFee;

    const order = await prisma.order.create({
      data: {
        type: 'pol_send',
        title: `Jastip: ${foodName}`,
        description: `Restoran: ${restaurantName}\nCatatan: ${note || '-'}`,
        pickup: restaurantName,
        destination: foodName,
        price: totalPrice,
        customerId: userId,
        status: 'pending',
      },
    });

    res.status(201).json({ 
      success: true, 
      data: order,
      message: `Pesanan Pol_Send berhasil dibuat. Total: Rp ${totalPrice.toLocaleString()}`
    });
  } catch (error) {
    console.error('[Pol_Send] Error:', error);
    res.status(500).json({ error: 'Gagal membuat pesanan Pol_Send' });
  }
});

// ==================== DRIVER FEATURES ====================
// Ambil orderan yang tersedia (pending & belum ada driver)
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
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil orderan tersedia' });
  }
});

// Driver ambil orderan
router.post('/:id/accept', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.userId;

    const order = await prisma.order.findFirst({
      where: { id, status: 'pending', driverId: null }
    });

    if (!order) {
      return res.status(400).json({ error: 'Pesanan sudah diambil atau tidak tersedia' });
    }

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

    res.json({ success: true, data: updated, message: 'Berhasil mengambil pesanan' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil pesanan ini' });
  }
});

// Driver selesaikan orderan
router.post('/:id/complete', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.userId;

    const order = await prisma.order.findFirst({
      where: { id, driverId, status: 'accepted' }
    });

    if (!order) {
      return res.status(400).json({ error: 'Pesanan tidak ditemukan atau bukan pesanan Anda' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
    
    res.json({ success: true, data: updated, message: 'Pesanan selesai' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menyelesaikan pesanan' });
  }
});

// Batalkan orderan (hanya customer yang bisa batalkan sebelum diambil driver)
router.delete('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await prisma.order.findFirst({
      where: { 
        id, 
        customerId: userId,
        status: { in: ['pending'] }
      }
    });

    if (!order) {
      return res.status(400).json({ error: 'Pesanan tidak dapat dibatalkan' });
    }

    await prisma.order.delete({ where: { id } });
    
    res.json({ success: true, message: 'Pesanan berhasil dibatalkan' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membatalkan pesanan' });
  }
});

export default router;