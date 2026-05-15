/**
 * backend/src/routes/orders.js
 *
 * Thin router — all logic lives in orderController.js.
 *
 * IMPORTANT: literal/named routes (/available, /pol_ride, /pol_send, /history)
 * MUST be defined BEFORE the /:id wildcard, otherwise Express swallows them.
 */

import express from "express";
import { verifyToken } from "../middleware/auth.js";
import historyRouter from "./orders.history.js";

import {
  getUserOrders,
  getOrderById,
  getOrdersByType,
  getAvailableOrders,
  createPolRide,
  createPolSend,
  acceptOrder,
  completeOrder,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

// ─── Auth + userId bridge ────────────────────────────────────────────────────
router.use(verifyToken, (req, _res, next) => {
  // Some middleware sets req.userId; others set req.user.id — normalise both.
  if (req.userId && !req.user) req.user = { id: req.userId };
  if (req.user?.id && !req.userId) req.userId = req.user.id;
  next();
});

// ─── History sub-router (mounted before /:id) ────────────────────────────────
router.use("/", historyRouter);

// ─── Named routes (MUST come before /:id) ───────────────────────────────────

// GET  /orders/available  — list pending orders for drivers
router.get("/available", getAvailableOrders);

// GET  /orders/type/:type
router.get("/type/:type", getOrdersByType);

// POST /orders/pol_ride
router.post("/pol_ride", createPolRide);

// POST /orders/pol_send
router.post("/pol_send", createPolSend);

// ─── Collection routes ───────────────────────────────────────────────────────

// GET  /orders
router.get("/", getUserOrders);

// ─── Wildcard /:id routes (MUST come last) ───────────────────────────────────

// GET    /orders/:id
router.get("/:id", getOrderById);

// POST   /orders/:id/accept
router.post("/:id/accept", acceptOrder);

// POST   /orders/:id/complete
router.post("/:id/complete", completeOrder);

// DELETE /orders/:id  (cancel)
router.delete("/:id", cancelOrder);

export default router;
