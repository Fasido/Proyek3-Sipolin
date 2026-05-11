// backend/index.js
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

// ─── Init ─────────────────────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

const SOCKET_CORS_ORIGINS = (process.env.SOCKET_CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());

// ─── JWT Middleware ───────────────────────────────────────────────────────────

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: no token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized: invalid token" });
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ─── Auth Routes ──────────────────────────────────────────────────────────────

app.post("/auth/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: "phone and password required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // NOTE: In production, compare hashed passwords (bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error("[auth/login]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, phone: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error("[auth/me]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Order Routes ─────────────────────────────────────────────────────────────

app.get("/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { driver: { select: { id: true, name: true, phone: true } } },
    });
    return res.json({ orders });
  } catch (err) {
    console.error("[GET /orders]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/orders/create", authMiddleware, async (req, res) => {
  const { type, pickupAddress, pickupLat, pickupLng, dropAddress, dropLat, dropLng, note } = req.body;

  if (!type || !pickupAddress || !dropAddress) {
    return res.status(400).json({ error: "type, pickupAddress, dropAddress required" });
  }

  try {
    const order = await prisma.order.create({
      data: {
        type,
        status: "PENDING",
        pickupAddress,
        pickupLat: pickupLat ? parseFloat(pickupLat) : null,
        pickupLng: pickupLng ? parseFloat(pickupLng) : null,
        dropAddress,
        dropLat: dropLat ? parseFloat(dropLat) : null,
        dropLng: dropLng ? parseFloat(dropLng) : null,
        note: note || null,
        userId: req.user.id,
      },
    });

    // Emit socket event
    io.emit("order:new", order);

    return res.status(201).json({ order });
  } catch (err) {
    console.error("[POST /orders/create]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/orders/:id/status", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status, driverId } = req.body;

  const VALID_STATUSES = ["PENDING", "ACCEPTED", "PICKED_UP", "ON_THE_WAY", "COMPLETED", "CANCELLED"];
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(driverId ? { driverId } : {}),
      },
      include: { driver: { select: { id: true, name: true, phone: true } } },
    });

    // Emit to order room
    io.to(`order:${id}`).emit("order:status:update", { orderId: id, status, order });

    // Emit to user room
    io.to(`user:${order.userId}`).emit("order:status:update", { orderId: id, status, order });

    return res.json({ order });
  } catch (err) {
    console.error("[PATCH /orders/:id/status]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────

const io = new SocketIOServer(server, {
  cors: {
    origin: SOCKET_CORS_ORIGINS,
    credentials: true,
  },
});

// Socket auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.data.user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user;
  console.log(`[socket] connected: ${user?.id} (${user?.role})`);

  // ─ Rooms ─────────────────────────────────

  socket.on("order:join", ({ orderId }) => {
    socket.join(`order:${orderId}`);
  });

  socket.on("driver:join", ({ driverId }) => {
    socket.join(`driver:${driverId}`);
    socket.join(`user:${user?.id}`);
  });

  // ─ Location Updates ───────────────────────

  socket.on("driver:location", ({ orderId, lat, lng }) => {
    io.to(`order:${orderId}`).emit("driver:location:update", { orderId, lat, lng });
    io.to(`user:${user?.id}`).emit("driver:location:update", { orderId, lat, lng });
  });

  socket.on("disconnect", () => {
    console.log(`[socket] disconnected: ${user?.id}`);
  });
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────

async function shutdown() {
  console.log("Shutting down...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// ─── Start ────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`[sipolin-backend] listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
});
