import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// 1. Ambil Profil User
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        nim: true,
        phone: true,
        avatar: true,
        role: true,
        ktmImage: true,
        isVerified: true,
        vehicleInfo: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('[Users API Error]:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// 2. Update Profil User (Tanpa Department)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, avatar, nim } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name: name || undefined,
        nim: nim || undefined,
        phone: phone || undefined,
        avatar: avatar || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        nim: true,
        phone: true,
        avatar: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('[Update API Error]:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 3. Statistik (Tetap sama)
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const totalOrders = await prisma.order.count({
      where: { customerId: req.userId },
    });

    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: { customerId: req.userId },
      _count: true,
    });

    const unreadNotifications = await prisma.notification.count({
      where: { userId: req.userId, isRead: false },
    });

    res.json({
      totalOrders, 
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      unreadNotifications,
    });
  } catch (error) {
    console.error('[Stats API Error]:', error);
    res.json({ totalOrders: 0, ordersByStatus: {}, unreadNotifications: 0 });
  }
});

export default router;