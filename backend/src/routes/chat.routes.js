import express from 'express';
import { 
  getMyRooms, 
  createRoom, 
  getRoom, 
  getRoomMessages, 
  markRoomAsRead 
} from '../controllers/chat.controllers.js'; 

// ✅ INI YANG BENER: Pakai verifyToken, BUKAN authenticateToken
import { verifyToken } from '../middleware/auth.js'; 

const router = express.Router();

// ✅ Semua rutenya pakai verifyToken
router.get('/rooms', verifyToken, getMyRooms); 
router.post('/rooms', verifyToken, createRoom); 
router.get('/rooms/:roomId', verifyToken, getRoom); 
router.get('/rooms/:roomId/messages', verifyToken, getRoomMessages); 
router.post('/rooms/:roomId/read', verifyToken, markRoomAsRead); 

export default router;