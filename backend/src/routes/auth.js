import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      nim,
      phone,
      role,
      plateNumber,
      vehicleDetail,
    } = req.body;

    // Validasi field wajib
    if (!email || !password || !name || !nim) {
      return res
        .status(400)
        .json({ error: 'Email, password, name, and NIM are required' });
    }

    // Validasi tambahan untuk Mitra Driver
    if (role === 'driver' && (!plateNumber || !vehicleDetail)) {
      return res
        .status(400)
        .json({ error: 'plateNumber and vehicleDetail are required for drivers' });
    }

    // Cek apakah email atau NIM sudah terdaftar
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { nim }] },
    });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'NIM';
      return res.status(409).json({ error: `${field} sudah terdaftar` });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        nim,
        phone:         phone         ?? null,
        role:          role          ?? 'user',
        plateNumber:   role === 'driver' ? (plateNumber ?? null)   : null,
        vehicleDetail: role === 'driver' ? (vehicleDetail ?? null) : null,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id:            user.id,
        email:         user.email,
        name:          user.name,
        nim:           user.nim,
        role:          user.role,
        plateNumber:   user.plateNumber,
        vehicleDetail: user.vehicleDetail,
      },
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id:    user.id,
        email: user.email,
        name:  user.name,
        role:  user.role,
      },
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token: newToken });
  } catch (error) {
    console.error('[Refresh Error]:', error);
    return res.status(401).json({ error: 'Token refresh failed' });
  }
});

export default router;