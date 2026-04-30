import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Hitung harga Pol-Ride
const calculateRidePrice = (distanceKm) => {
  return distanceKm * 5000; // Rp 5000 per km
};

// Hitung harga Pol-Send
const calculateSendPrice = (foodPrice = 20000) => {
  const jastipFee = 5000 + (foodPrice * 0.1);
  return foodPrice + jastipFee;
};

// Create Pol-Ride
export const createPolRide = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, scheduledTime, note } = req.body;
    const userId = req.userId;

    if (!pickupLocation || !dropoffLocation) {
      return res.status(400).json({ error: 'Lokasi jemput dan tujuan wajib diisi' });
    }

    const estimatedDistance = 3; // TODO: Google Maps API
    const price = calculateRidePrice(estimatedDistance);

    const order = await prisma.order.create({
      data: {
        type: 'pol_ride',
        title: 'Pol-Ride (Antar Jemput)',
        description: note || '',
        pickup: pickupLocation,
        destination: dropoffLocation,
        price: price,
        customerId: userId,
        status: 'pending',
      },
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat Pol-Ride' });
  }
};

// Create Pol-Send
export const createPolSend = async (req, res) => {
  try {
    const { foodName, restaurantName, foodPrice, photoUrl, note } = req.body;
    const userId = req.userId;

    if (!foodName || !restaurantName) {
      return res.status(400).json({ error: 'Nama makanan dan restoran wajib diisi' });
    }

    const totalPrice = calculateSendPrice(foodPrice);

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

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat Pol-Send' });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
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
};

// Get order by ID
export const getOrderById = async (req, res) => {
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
};

// Get orders by type
export const getOrdersByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['pol_ride', 'pol_send'].includes(type)) {
      return res.status(400).json({ error: 'Tipe pesanan tidak valid' });
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
};

// Get available orders (for drivers)
export const getAvailableOrders = async (req, res) => {
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
};

// Accept order (driver)
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.userId;

    const order = await prisma.order.findFirst({
      where: { id, status: 'pending', driverId: null }
    });

    if (!order) {
      return res.status(400).json({ error: 'Pesanan sudah diambil' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { driverId, status: 'accepted' },
      include: { customer: { select: { name: true, phone: true } } },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil pesanan' });
  }
};

// Complete order (driver)
export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.userId;

    const order = await prisma.order.findFirst({
      where: { id, driverId, status: 'accepted' }
    });

    if (!order) {
      return res.status(400).json({ error: 'Pesanan tidak ditemukan' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menyelesaikan pesanan' });
  }
};

// Cancel order (customer only)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await prisma.order.findFirst({
      where: { id, customerId: userId, status: 'pending' }
    });

    if (!order) {
      return res.status(400).json({ error: 'Pesanan tidak dapat dibatalkan' });
    }

    await prisma.order.delete({ where: { id } });
    
    res.json({ success: true, message: 'Pesanan dibatalkan' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membatalkan pesanan' });
  }
};