/**
 * routes/users.js  —  SIPOLIN User & Location Routes
 * ─────────────────────────────────────────────────────
 * New endpoints for real-time tracking:
 *   PUT  /api/users/location        — Driver pushes GPS coords
 *   GET  /api/users/:id/location    — Customer polls driver coords
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ─── Shared select: full public profile ───────────────────────────────────────
const USER_PUBLIC_SELECT = {
  id:             true,
  email:          true,
  name:           true,
  nim:            true,
  phone:          true,
  avatar:         true,
  profilePicture: true,
  role:           true,
  ktmImage:       true,
  isVerified:     true,
  isActive:       true,
  vehicleInfo:    true,
  plateNumber:    true,
  vehicleDetail:  true,
  createdAt:      true,
};

// ─── Stale threshold (ms) ─────────────────────────────────────────────────────
// If driver's location hasn't been updated in > 45s, treat as offline/stale.
const STALE_THRESHOLD_MS = 45_000;

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /profile — authenticated user's own profile
// ─────────────────────────────────────────────────────────────────────────────
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.userId },
      select: USER_PUBLIC_SELECT,
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('[GET /profile]', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. PUT /profile — update basic profile fields
// ─────────────────────────────────────────────────────────────────────────────
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, nim } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name  !== undefined && { name }),
        ...(nim   !== undefined && { nim }),
        ...(phone !== undefined && { phone }),
      },
      select: USER_PUBLIC_SELECT,
    });
    res.json(updated);
  } catch (err) {
    console.error('[PUT /profile]', err);
    if (err.code === 'P2002') return res.status(409).json({ error: 'NIM sudah digunakan akun lain.' });
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. PUT /profile-picture — upload profile photo URL / base64
// ─────────────────────────────────────────────────────────────────────────────
router.put('/profile-picture', verifyToken, async (req, res) => {
  try {
    const { profilePicture } = req.body;
    if (!profilePicture) return res.status(400).json({ error: 'profilePicture is required.' });

    const isValid =
      profilePicture.startsWith('https://') ||
      /^data:image\/(jpeg|png|webp|gif);base64,/.test(profilePicture);

    if (!isValid) return res.status(400).json({ error: 'Invalid image format.' });
    if (profilePicture.length > Math.ceil(5 * 1024 * 1024 * 1.34)) {
      return res.status(413).json({ error: 'Image too large (max 5 MB).' });
    }

    const updated = await prisma.user.update({
      where:  { id: req.userId },
      data:   { profilePicture },
      select: { id: true, profilePicture: true },
    });

    res.json({ message: 'Profile picture updated.', profilePicture: updated.profilePicture });
  } catch (err) {
    console.error('[PUT /profile-picture]', err);
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. PUT /location  ★ NEW  — Driver broadcasts GPS position
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Body: { latitude: number, longitude: number }
 * Auth: Driver JWT required.
 * Rate: Expect calls every 5 s from the mobile app.
 *
 * Returns the saved coordinates + timestamp so the client can confirm.
 */
router.put('/location', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'latitude and longitude are required.' });
    }
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      isNaN(lat) || isNaN(lng) ||
      lat < -90  || lat > 90  ||
      lng < -180 || lng > 180
    ) {
      return res.status(400).json({ error: 'Coordinates out of valid WGS-84 range.' });
    }

    // ── Guard: only drivers should broadcast location ───────────────────────
    const actor = await prisma.user.findUnique({
      where:  { id: req.userId },
      select: { role: true },
    });
    if (!actor) return res.status(404).json({ error: 'User not found.' });
    if (actor.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can broadcast location.' });
    }

    // ── Persist ─────────────────────────────────────────────────────────────
    const now = new Date();
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        latitude,
        longitude,
        locationUpdatedAt: now,
      },
    });

    res.json({
      success:   true,
      latitude:  lat,
      longitude: lng,
      updatedAt: now.toISOString(),
    });
  } catch (err) {
    console.error('[PUT /location]', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. GET /:id/location  ★ NEW — Customer polls a specific driver's position
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Params: id — the driver's userId (from Order.driverId)
 * Auth:   Any authenticated user.
 *
 * Returns driver's public info + latest coordinates + staleness flag.
 * The customer-side uses this to update the map marker every 5 s.
 */
router.get('/:id/location', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await prisma.user.findUnique({
      where:  { id },
      select: {
        id:               true,
        name:             true,
        phone:            true,
        vehicleDetail:    true,
        plateNumber:      true,
        profilePicture:   true,
        avatar:           true,
        isVerified:       true,
        latitude:         true,
        longitude:        true,
        locationUpdatedAt: true,
        role:             true,
      },
    });

    if (!driver) return res.status(404).json({ error: 'Driver not found.' });
    if (driver.role !== 'driver') {
      return res.status(400).json({ error: 'Requested user is not a driver.' });
    }

    // ── Staleness check ─────────────────────────────────────────────────────
    const isStale =
      !driver.locationUpdatedAt ||
      Date.now() - new Date(driver.locationUpdatedAt).getTime() > STALE_THRESHOLD_MS;

    res.json({
      driverId:         driver.id,
      name:             driver.name,
      phone:            driver.phone,
      vehicleDetail:    driver.vehicleDetail,
      plateNumber:      driver.plateNumber,
      profilePicture:   driver.profilePicture || driver.avatar,
      isVerified:       driver.isVerified,
      latitude:         driver.latitude,
      longitude:        driver.longitude,
      locationUpdatedAt: driver.locationUpdatedAt,
      isOnline:         !isStale && driver.latitude !== null,
    });
  } catch (err) {
    console.error('[GET /:id/location]', err);
    res.status(500).json({ error: 'Failed to fetch driver location' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET /stats — aggregated stats for the authenticated user
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const [totalOrders, ordersByStatus, unreadNotifications] = await Promise.all([
      prisma.order.count({ where: { customerId: req.userId } }),
      prisma.order.groupBy({
        by:    ['status'],
        where: { customerId: req.userId },
        _count: true,
      }),
      prisma.notification.count({ where: { userId: req.userId, isRead: false } }),
    ]);

    res.json({
      totalOrders,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      unreadNotifications,
    });
  } catch (err) {
    console.error('[GET /stats]', err);
    res.json({ totalOrders: 0, ordersByStatus: {}, unreadNotifications: 0 });
  }
});

export default router;