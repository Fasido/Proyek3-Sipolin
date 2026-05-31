// backend/src/routes/chat.routes.js

import express from "express";
import {
  getMyRooms,
  createRoom,
  getRoom,
  getRoomMessages,
  sendRoomMessage,
  markRoomAsRead,
} from "../controllers/chat.controllers.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken, (req, _res, next) => {
  if (req.userId && !req.user) req.user = { id: req.userId, role: req.userRole };
  if (req.user?.id && !req.userId) req.userId = req.user.id;
  next();
});

router.get("/rooms", getMyRooms);
router.post("/rooms", createRoom);
router.get("/rooms/:roomId", getRoom);
router.get("/rooms/:roomId/messages", getRoomMessages);
router.post("/rooms/:roomId/messages", sendRoomMessage);
router.post("/rooms/:roomId/read", markRoomAsRead);

export default router;
