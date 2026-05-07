import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// ✅ Cukup import HTTP aja, Socket.io udah diurus di folder sockets/
import http from 'http';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// ✅ Bungkus Express pakai HTTP Server 
const server = http.createServer(app);

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
import chatRoutes from './routes/chat.routes.js'; 

app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// Legacy reports endpoint (for backward compatibility)
app.use('/api/reports', ordersRoutes);

// ✅ INI YANG BIKIN ERROR TADI: Sekarang udah diganti jadi initSocketIO
import { initSocketIO } from './sockets/index.js'; 
initSocketIO(server); 

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

// ✅ Server nyala bareng Socket.io
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Sipolin Backend] Server + Socket.io running on port ${PORT} (Terbuka untuk WiFi/Semua IP)`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});