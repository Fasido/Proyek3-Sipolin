import { io } from 'socket.io-client';
import { tokenManager } from './api'; // ✅ Ambil dari api.js lo

// ✅ PENTING: Pake IP yang sama kayak di api.js biar HP bisa konek lewat WiFi
const SOCKET_URL = "http://192.168.43.148:3000"; 

let socketInstance = null;

/**
 * Returns the existing socket or creates a new one.
 */
export async function getSocket() { // ✅ Jadiin async karena ambil token itu async
  if (socketInstance?.connected) return socketInstance;

  // ✅ Ambil token pake tokenManager lo
  const token = await tokenManager.getToken(); 

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socketInstance.on('connect', () => console.log('🟢 Socket connected'));
  socketInstance.on('disconnect', (reason) => console.log('🔴 Socket disconnected:', reason));
  socketInstance.on('connect_error', (err) => console.warn('⚠️ Socket error:', err.message));

  return socketInstance;
}

/** Call on logout to cleanly close the connection */
export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}