  import express from 'express';
  import cors from 'cors';
  import dotenv from 'dotenv';
  import { PrismaClient } from '@prisma/client';

  dotenv.config();

  const app = express();
  const prisma = new PrismaClient();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Import routes
  import authRoutes from './routes/auth.js';
  import ordersRoutes from './routes/orders.js';
  import userRoutes from './routes/users.js';
  import notificationRoutes from './routes/notifications.js';

  app.use('/api/auth', authRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Legacy reports endpoint (for backward compatibility)
  app.use('/api/reports', ordersRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      status: err.status || 500,
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`[Sipolin Backend] Server running on http://localhost:${PORT}`);
  });

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
