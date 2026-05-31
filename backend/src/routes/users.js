/**
 * routes/users.js — SIPOLIN User & Location Routes
 *
 * Fix utama:
 * - Role Prisma memakai enum uppercase: USER / DRIVER / ADMIN
 * - Response ke mobile tetap aman dengan role lowercase
 * - Tracking tidak error 400 hanya karena role DRIVER uppercase
 * - Kalau driver belum kirim lokasi, endpoint tetap success dan frontend bisa tampilkan info driver
 * - Stats customer dan driver dipisahkan
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  nim: true,
  phone: true,
  avatar: true,
  profilePicture: true,
  role: true,
  ktmImage: true,
  isVerified: true,
  isActive: true,
  vehicleInfo: true,
  plateNumber: true,
  vehicleDetail: true,
  createdAt: true,
};

const STALE_THRESHOLD_MS = 45_000;

const normalizeRole = (role) => String(role || '').toUpperCase();

const isDriverRole = (role) => normalizeRole(role) === 'DRIVER';

const roleToClient = (role) => String(role || '').toLowerCase();

const normalizeUserForClient = (user) => {
  if (!user) return user;

  return {
    ...user,
    role: roleToClient(user.role),
  };
};

const getCurrentUserId = (req) => req.userId || req.user?.id;

const getCurrentUser = async (req) => {
  const userId = getCurrentUserId(req);

  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      name: true,
      isActive: true,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/profile
// ─────────────────────────────────────────────────────────────────────────────
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_PUBLIC_SELECT,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const clientUser = normalizeUserForClient(user);

    return res.json({
      success: true,
      data: clientUser,
      user: clientUser,
      ...clientUser,
    });
  } catch (err) {
    console.error('[GET /profile]', err);

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/profile
// ─────────────────────────────────────────────────────────────────────────────
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const { name, phone, nim } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(nim !== undefined && { nim }),
        ...(phone !== undefined && { phone }),
      },
      select: USER_PUBLIC_SELECT,
    });

    const clientUser = normalizeUserForClient(updated);

    return res.json({
      success: true,
      data: clientUser,
      user: clientUser,
      ...clientUser,
    });
  } catch (err) {
    console.error('[PUT /profile]', err);

    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'NIM sudah digunakan akun lain.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/profile-picture
// ─────────────────────────────────────────────────────────────────────────────
router.put('/profile-picture', verifyToken, async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({
        success: false,
        error: 'profilePicture is required.',
      });
    }

    const isValid =
      profilePicture.startsWith('https://') ||
      /^data:image\/(jpeg|png|webp|gif);base64,/.test(profilePicture);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format.',
      });
    }

    if (profilePicture.length > Math.ceil(5 * 1024 * 1024 * 1.34)) {
      return res.status(413).json({
        success: false,
        error: 'Image too large (max 5 MB).',
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture },
      select: {
        id: true,
        profilePicture: true,
      },
    });

    return res.json({
      success: true,
      message: 'Profile picture updated.',
      profilePicture: updated.profilePicture,
      data: updated,
    });
  } catch (err) {
    console.error('[PUT /profile-picture]', err);

    return res.status(500).json({
      success: false,
      error: 'Failed to update profile picture',
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/users/profile-picture
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/profile-picture', verifyToken, async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: null,
        avatar: null,
      },
    });

    return res.json({
      success: true,
      message: 'Profile picture removed.',
    });
  } catch (err) {
    console.error('[DELETE /profile-picture]', err);

    return res.status(500).json({
      success: false,
      error: 'Failed to remove profile picture',
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/location
// Driver update lokasi GPS
// ─────────────────────────────────────────────────────────────────────────────
router.put('/location', verifyToken, async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'latitude and longitude are required.',
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        error: 'Coordinates out of valid WGS-84 range.',
      });
    }

    const actor = await getCurrentUser(req);

    if (!actor) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    if (!isDriverRole(actor.role)) {
      return res.status(403).json({
        success: false,
        error: 'Only drivers can broadcast location.',
      });
    }

    const now = new Date();

    await prisma.user.update({
      where: { id: userId },
      data: {
        latitude: lat,
        longitude: lng,
        locationUpdatedAt: now,
      },
    });

    return res.json({
      success: true,
      latitude: lat,
      longitude: lng,
      updatedAt: now.toISOString(),
    });
  } catch (err) {
    console.error('[PUT /location]', err);

    return res.status(500).json({
      success: false,
      error: 'Failed to update location',
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/:id/location
// Customer/driver ambil lokasi driver
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/location', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        vehicleDetail: true,
        plateNumber: true,
        profilePicture: true,
        avatar: true,
        isVerified: true,
        latitude: true,
        longitude: true,
        locationUpdatedAt: true,
        role: true,
        isActive: true,
      },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found.',
      });
    }

    // FIX: role di DB adalah enum DRIVER, bukan string lowercase driver
    if (!isDriverRole(driver.role)) {
      return res.status(400).json({
        success: false,
        error: 'Requested user is not a driver.',
        role: roleToClient(driver.role),
      });
    }

    const hasLocation =
      driver.latitude !== null &&
      driver.latitude !== undefined &&
      driver.longitude !== null &&
      driver.longitude !== undefined;

    const isStale =
      !driver.locationUpdatedAt ||
      Date.now() - new Date(driver.locationUpdatedAt).getTime() > STALE_THRESHOLD_MS;

    return res.json({
      success: true,
      driverId: driver.id,
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      vehicleDetail: driver.vehicleDetail,
      plateNumber: driver.plateNumber,
      profilePicture: driver.profilePicture || driver.avatar,
      isVerified: driver.isVerified,
      latitude: hasLocation ? driver.latitude : null,
      longitude: hasLocation ? driver.longitude : null,
      locationUpdatedAt: driver.locationUpdatedAt,
      hasLocation,
      isOnline: Boolean(hasLocation && !isStale && driver.isActive),
      role: roleToClient(driver.role),
    });
  } catch (err) {
    console.error('[GET /:id/location]', err);

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch driver location',
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/stats
// Customer: hitung order miliknya
// Driver: hitung order yang dia ambil
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    const actor = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!actor) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const isDriver = isDriverRole(actor.role);

    const orderWhere = isDriver
      ? { driverId: userId }
      : { customerId: userId };

    const activeWhere = isDriver
      ? {
          driverId: userId,
          status: 'accepted',
        }
      : {
          customerId: userId,
          status: {
            in: ['pending', 'accepted'],
          },
        };

    const [totalOrders, activeOrders, completedOrders, ordersByStatus, unreadNotifications] =
      await Promise.all([
        prisma.order.count({
          where: orderWhere,
        }),

        prisma.order.count({
          where: activeWhere,
        }),

        prisma.order.count({
          where: {
            ...orderWhere,
            status: 'completed',
          },
        }),

        prisma.order.groupBy({
          by: ['status'],
          where: orderWhere,
          _count: true,
        }),

        prisma.notification.count({
          where: {
            userId,
            isRead: false,
          },
        }),
      ]);

    const statusMap = ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {});

    return res.json({
      success: true,
      role: roleToClient(actor.role),
      totalOrders,
      totalTrips: totalOrders,
      activeOrders,
      completedOrders,
      ordersByStatus: statusMap,
      unreadNotifications,
    });
  } catch (err) {
    console.error('[GET /stats]', err);

    return res.json({
      success: false,
      totalOrders: 0,
      totalTrips: 0,
      activeOrders: 0,
      completedOrders: 0,
      ordersByStatus: {},
      unreadNotifications: 0,
    });
  }
});

export default router;
