import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import http from 'http';

// Import routes
import authRoutes from './routes/auth.js';
import ordersRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';
import chatRoutes from './routes/chat.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Import Socket.io
import { initSocketIO } from './sockets/index.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Bungkus Express pakai HTTP Server
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Sipolin Backend is running',
  });
});

// Routes utama
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// Route AI Chatbot Sipolin
app.use('/api/ai', aiRoutes);

// Legacy reports endpoint
app.use('/api/reports', ordersRoutes);

// Jalankan Socket.io
initSocketIO(server);

// Route kalau endpoint tidak ditemukan
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Backend Error]', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

// Server nyala bareng Socket.io
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Sipolin Backend] Server + Socket.io running on port ${PORT}`);
  console.log(`[Sipolin Backend] Health check: http://localhost:${PORT}/health`);
  console.log(`[Sipolin Backend] AI Chatbot: http://localhost:${PORT}/api/ai/chat`);
});

// Disconnect Prisma saat server dimatikan
process.on('SIGINT', async () => {
  console.log('\n[Sipolin Backend] Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});