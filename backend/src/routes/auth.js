import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const normalizeRoleToDb = (role) => {
  const value = String(role || 'user').toLowerCase();

  if (value === 'driver' || value === 'mitra' || value === 'DRIVER') {
    return 'DRIVER';
  }

  return 'USER';
};

const normalizeRoleToClient = (role) => {
  return String(role || 'USER').toLowerCase();
};

const buildUserResponse = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  nim: user.nim,
  phone: user.phone,
  role: normalizeRoleToClient(user.role),
  plateNumber: user.plateNumber,
  vehicleDetail: user.vehicleDetail,
});

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

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();
    const cleanName = String(name || '').trim();
    const cleanNim = String(nim || '').trim();
    const cleanPhone = phone ? String(phone).trim() : null;
    const dbRole = normalizeRoleToDb(role);

    const cleanPlateNumber = plateNumber ? String(plateNumber).trim() : null;
    const cleanVehicleDetail = vehicleDetail ? String(vehicleDetail).trim() : null;

    if (!cleanEmail || !cleanPassword || !cleanName || !cleanNim) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, and NIM are required',
      });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password minimal 6 karakter',
      });
    }

    if (dbRole === 'DRIVER' && (!cleanPlateNumber || !cleanVehicleDetail)) {
      return res.status(400).json({
        success: false,
        error: 'Plat nomor dan info kendaraan wajib diisi untuk driver',
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { nim: cleanNim },
        ],
      },
    });

    if (existingUser) {
      const field = existingUser.email === cleanEmail ? 'Email' : 'NIM';

      return res.status(409).json({
        success: false,
        error: `${field} sudah terdaftar`,
      });
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: cleanName,
        nim: cleanNim,
        phone: cleanPhone,
        role: dbRole,
        plateNumber: dbRole === 'DRIVER' ? cleanPlateNumber : null,
        vehicleDetail: dbRole === 'DRIVER' ? cleanVehicleDetail : null,
      },
    });

    const clientUser = buildUserResponse(user);

    const token = jwt.sign(
      {
        userId: user.id,
        role: clientUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: clientUser,
    });
  } catch (error) {
    console.error('[Register Error]:', error);

    return res.status(500).json({
      success: false,
      error: error?.message || 'Registration failed',
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const clientUser = buildUserResponse(user);

    const token = jwt.sign(
      {
        userId: user.id,
        role: clientUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: clientUser,
    });
  } catch (error) {
    console.error('[Login Error]:', error);

    return res.status(500).json({
      success: false,
      error: error?.message || 'Login failed',
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    const clientUser = buildUserResponse(user);

    const newToken = jwt.sign(
      {
        userId: user.id,
        role: clientUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token: newToken,
      user: clientUser,
    });
  } catch (error) {
    console.error('[Refresh Error]:', error);

    return res.status(401).json({
      success: false,
      error: 'Token refresh failed',
    });
  }
});

export default router;