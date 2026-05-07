import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket }  from '../services/socket.service';
import { chatAPI }    from '../services/api'; // ✅ Sesuaikan nama import

export function useChatRoom(roomId, user) {
  const [messages,      setMessages]      = useState([]);
  const [isTyping,      setIsTyping]      = useState(false);
  const [typingUser,    setTypingUser]    = useState(null);
  const [isLoading,     setIsLoading]     = useState(true);
  const [isSending,     setIsSending]     = useState(false);
  const [error,         setError]         = useState(null);
  const [hasNextPage,   setHasNextPage]   = useState(false);
  const [nextCursor,    setNextCursor]    = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const optimisticIds = useRef(new Set());
  const typingTimer   = useRef(null);
  const socketRef     = useRef(null);

  // ── 1. Load initial history via REST ────
  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      try {
        setIsLoading(true);
        const response = await chatAPI.getMessages(roomId); // ✅ Pake chatAPI
        
        // Sesuaikan dengan struktur response data lo (biasanya response.data.data)
        const result = response.data?.data || response.data;

        if (!cancelled && result) {
          setMessages(result.messages || []);
          setHasNextPage(result.hasNextPage || false);
          setNextCursor(result.nextCursor || null);
        }
      } catch (err) { 
        if (!cancelled) {
          console.error("Load Chat Error:", err);
          setError('Failed to load messages'); 
        }
      }
      finally  { if (!cancelled) setIsLoading(false); }
    }
    loadHistory();
    return () => { cancelled = true; };
  }, [roomId]);

  // ── 2. Socket.io setup ──────────────────
  useEffect(() => {
    let isMounted = true;

    async function setupSocket() {
      // ✅ getSocket sekarang async, jadi wajib di-await
      const socket = await getSocket();
      if (!isMounted) return;
      
      socketRef.current = socket;

      socket.emit('join_room', { roomId }, (res) => {
        if (res?.error && isMounted) setError(res.error);
      });

      const handleReceiveMessage = (message) => {
        setMessages((prev) => {
          if (message.tempId && optimisticIds.current.has(message.tempId)) {
            optimisticIds.current.delete(message.tempId);
            return prev.map((m) => m.id === message.tempId ? { ...message, pending: false } : m);
          }
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      };

      const handleTyping = ({ userId: tid, name }) => {
        if (tid !== user?.id) {
          setIsTyping(true);
          setTypingUser(name);
          clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setIsTyping(false), 3000);
        }
      };

      const handleStopTyping = ({ userId: sid }) => {
        if (sid !== user?.id) {
          clearTimeout(typingTimer.current);
          setIsTyping(false);
          setTypingUser(null);
        }
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('typing',          handleTyping);
      socket.on('stop_typing',     handleStopTyping);

      // Cleanup listener saat room berubah atau unmount
      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('typing',          handleTyping);
        socket.off('stop_typing',     handleStopTyping);
      };
    }

    const cleanupPromise = setupSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.emit('leave_room', { roomId });
      }
      clearTimeout(typingTimer.current);
    };
  }, [roomId, user?.id]);

  // ── 3. Send message (optimistic UI) ─────
  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || isSending || !socketRef.current) return;
    
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    optimisticIds.current.add(tempId);

    const optimisticMsg = {
      id: tempId, tempId, chatRoomId: roomId,
      senderId: user.id,
      sender: { id: user.id, name: user.name, avatar: user.avatar },
      text: text.trim(), isRead: false,
      createdAt: new Date().toISOString(), pending: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setIsSending(true);

    socketRef.current.emit('send_message', { roomId, text: text.trim(), tempId }, (res) => {
      if (res?.error) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        optimisticIds.current.delete(tempId);
        setError('Failed to send message');
      }
      setIsSending(false);
    });
  }, [roomId, user, isSending]);

  const emitTyping     = useCallback(() => socketRef.current?.emit('typing',      { roomId }), [roomId]);
  const emitStopTyping = useCallback(() => socketRef.current?.emit('stop_typing', { roomId }), [roomId]);

  const loadMoreMessages = useCallback(async () => {
    if (!hasNextPage || isLoadingMore || !nextCursor) return;
    try {
      setIsLoadingMore(true);
      const response = await chatAPI.getMessages(roomId, nextCursor);
      const result = response.data?.data || response.data;
      
      setMessages((prev) => [...(result.messages || []), ...prev]);
      setHasNextPage(result.hasNextPage || false);
      setNextCursor(result.nextCursor || null);
    } catch { setError('Failed to load more messages'); }
    finally  { setIsLoadingMore(false); }
  }, [roomId, hasNextPage, isLoadingMore, nextCursor]);

  return {
    messages, isLoading, isSending, isLoadingMore,
    hasNextPage, error, isTyping, typingUser,
    sendMessage, emitTyping, emitStopTyping, loadMoreMessages,
  };
}