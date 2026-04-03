import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// 1. Buat Pesanan Baru (Tebengan/Jastip)
router.post('/', verifyToken, async (req, res) => {
  try {
    // Sesuaikan dengan data dari HP (Create Screen)
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Lokasi, detail, dan jenis layanan wajib diisi' });
    }

    // UPDATE: Pakai prisma.order dan customerId
    const order = await prisma.order.create({
      data: {
        title,
        description,
        type: category.toUpperCase(), // Kita simpan ke field 'type' di schema
        customerId: req.userId,       // Di schema kamu namanya customerId
        status: 'pending',
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('[Create Order Error]:', error);
    res.status(500).json({ error: 'Gagal membuat pesanan' });
  }
});

// 2. Ambil Daftar Pesanan Saya
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, type, search } = req.query;

    let where = { customerId: req.userId }; // Filter berdasarkan ID penumpang
    
    if (status) where.status = status;
    if (type) where.type = type;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: { // Tampilkan info driver kalau sudah ada yang ambil
          select: { name: true, phone: true, vehicleInfo: true }
        }
      }
    });

    res.json(orders);
  } catch (error) {
    console.error('[Fetch Orders Error]:', error);
    res.status(500).json({ error: 'Gagal mengambil data pesanan' });
  }
});

// 3. Ambil Detail Satu Pesanan
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { 
        customer: { select: { name: true, nim: true, phone: true } },
        driver: { select: { name: true, phone: true, vehicleInfo: true } }
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }

    // Cek akses (hanya pemilik, driver, atau admin)
    if (order.customerId !== req.userId && order.driverId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Kamu tidak punya akses ke pesanan ini' });
    }

    res.json(order);
  } catch (error) {
    console.error('[Fetch Order Detail Error]:', error);
    res.status(500).json({ error: 'Gagal mengambil detail pesanan' });
  }
});

// 4. Update Pesanan (Bisa buat Driver ambil orderan)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });

    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: req.body, // Di sini nanti bisa update status atau driverId
    });

    res.json(updated);
  } catch (error) {
    console.error('[Update Order Error]:', error);
    res.status(500).json({ error: 'Gagal memperbarui pesanan' });
  }
});

// 5. Hapus Pesanan (Cancel)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });

    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }

    if (order.customerId !== req.userId) {
      return res.status(403).json({ error: 'Hanya pemesan yang bisa membatalkan' });
    }

    await prisma.order.delete({ where: { id: req.params.id } });

    res.json({ message: 'Pesanan berhasil dibatalkan' });
  } catch (error) {
    console.error('[Delete Order Error]:', error);
    res.status(500).json({ error: 'Gagal menghapus pesanan' });
  }
});

export default router;