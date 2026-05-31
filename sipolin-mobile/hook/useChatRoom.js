// sipolin-mobile/hook/useChatRoom.js
// Versi stabil dulu: REST + polling, tanpa websocket.
// Tujuan: chat jalan normal dulu, tidak spam connect_error.
// Nanti websocket realtime kita aktifkan lagi setelah server socket backend bersih.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chatAPI, extractApiItem } from "../services/api";

const POLLING_MS = 2500;

const makeTempId = () =>
  `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getTimeValue = (message) => {
  const time = new Date(message?.createdAt || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const sortMessages = (items = []) => {
  return [...items].sort((a, b) => getTimeValue(a) - getTimeValue(b));
};

const normalizeMessagesPayload = (payload) => {
  const data = payload?.data?.data || payload?.data || payload;

  if (Array.isArray(data)) {
    return {
      items: sortMessages(data),
      nextCursor: null,
      hasNextPage: false,
    };
  }

  const items =
    data?.items ||
    data?.messages ||
    data?.data?.items ||
    data?.data?.messages ||
    [];

  return {
    items: sortMessages(items),
    nextCursor: data?.nextCursor || data?.data?.nextCursor || null,
    hasNextPage: Boolean(
      data?.hasNextPage ||
        data?.data?.hasNextPage ||
        data?.nextCursor ||
        data?.data?.nextCursor
    ),
  };
};

const mergeMessages = (oldMessages = [], newMessages = []) => {
  const map = new Map();

  [...oldMessages, ...newMessages].forEach((message) => {
    if (!message) return;

    const key = message.id || message.tempId;
    if (!key) return;

    map.set(key, {
      ...(map.get(key) || {}),
      ...message,
      pending: message.pending || false,
      failed: message.failed || false,
    });
  });

  return sortMessages([...map.values()]);
};

const markRoomReadSafe = async (roomId) => {
  try {
    if (!roomId) return;

    if (typeof chatAPI.markAsRead === "function") {
      await chatAPI.markAsRead(roomId);
      return;
    }

    if (typeof chatAPI.read === "function") {
      await chatAPI.read(roomId);
      return;
    }

    if (typeof chatAPI.markRead === "function") {
      await chatAPI.markRead(roomId);
    }
  } catch {
    // read receipt bukan fitur fatal, jadi jangan bikin chat error
  }
};

export function useChatRoom(roomId, user) {
  const mountedRef = useRef(true);
  const pollingRef = useRef(null);
  const isFetchingRef = useRef(false);
  const nextCursorRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState(null);

  // Untuk kompatibel dengan UI lama
  const [isTyping] = useState(false);
  const [typingUser] = useState("");

  const userId = user?.id || user?.userId;

  const loadRoomMeta = useCallback(async () => {
    if (!roomId) return;

    try {
      if (typeof chatAPI.getRoomById === "function") {
        const roomData = await chatAPI.getRoomById(roomId);
        if (mountedRef.current) {
          setRoom(extractApiItem(roomData));
        }
        return;
      }

      if (typeof chatAPI.getById === "function") {
        const roomData = await chatAPI.getById(roomId);
        if (mountedRef.current) {
          setRoom(extractApiItem(roomData));
        }
      }
    } catch (err) {
      console.log("[useChatRoom] loadRoomMeta:", err?.message || err);
    }
  }, [roomId]);

  const fetchMessages = useCallback(
    async ({ silent = false } = {}) => {
      if (!roomId || isFetchingRef.current) return;

      isFetchingRef.current = true;

      if (!silent) {
        setError(null);
      }

      try {
        const response = await chatAPI.getMessages(roomId);
        const parsed = normalizeMessagesPayload(response);

        if (!mountedRef.current) return;

        setMessages((prev) => mergeMessages(prev, parsed.items));
        nextCursorRef.current = parsed.nextCursor || null;
        setHasNextPage(Boolean(parsed.hasNextPage));

        await markRoomReadSafe(roomId);
      } catch (err) {
        console.log(
          "[useChatRoom] fetchMessages:",
          err?.response?.data || err?.message || err
        );

        if (mountedRef.current && !silent) {
          setError("Gagal memuat pesan.");
        }
      } finally {
        isFetchingRef.current = false;

        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [roomId]
  );

  const loadInitial = useCallback(async () => {
    if (!roomId) return;

    setIsLoading(true);
    setError(null);

    await Promise.all([loadRoomMeta(), fetchMessages({ silent: true })]);

    if (mountedRef.current) {
      setIsLoading(false);
    }
  }, [roomId, loadRoomMeta, fetchMessages]);

  const loadMoreMessages = useCallback(async () => {
    if (!roomId || !hasNextPage || !nextCursorRef.current || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const response = await chatAPI.getMessages(roomId, nextCursorRef.current);
      const parsed = normalizeMessagesPayload(response);

      if (!mountedRef.current) return;

      setMessages((prev) => mergeMessages(parsed.items, prev));
      nextCursorRef.current = parsed.nextCursor || null;
      setHasNextPage(Boolean(parsed.hasNextPage));
    } catch (err) {
      console.log("[useChatRoom] loadMoreMessages:", err?.message || err);
    } finally {
      if (mountedRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [roomId, hasNextPage, isLoadingMore]);

  useEffect(() => {
    mountedRef.current = true;
    loadInitial();

    return () => {
      mountedRef.current = false;
    };
  }, [loadInitial]);

  useEffect(() => {
    if (!roomId) return;

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(() => {
      fetchMessages({ silent: true });
    }, POLLING_MS);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [roomId, fetchMessages]);

  const sendMessage = useCallback(
    async (text) => {
      const cleanText = String(text || "").trim();

      if (!cleanText || !roomId || !userId) return;

      const tempId = makeTempId();

      const optimisticMessage = {
        id: tempId,
        tempId,
        chatRoomId: roomId,
        senderId: userId,
        text: cleanText,
        createdAt: new Date().toISOString(),
        isRead: false,
        pending: true,
        failed: false,
      };

      setMessages((prev) => mergeMessages(prev, [optimisticMessage]));
      setIsSending(true);
      setError(null);

      try {
        if (typeof chatAPI.sendMessage !== "function") {
          throw new Error("chatAPI.sendMessage belum tersedia di services/api.js");
        }

        const response = await chatAPI.sendMessage(roomId, cleanText);
        const savedMessage = extractApiItem(response);

        setMessages((prev) =>
          prev.map((message) => {
            if (message.tempId !== tempId && message.id !== tempId) {
              return message;
            }

            return {
              ...message,
              ...savedMessage,
              id: savedMessage?.id || message.id,
              tempId,
              pending: false,
              failed: false,
            };
          })
        );

        setTimeout(() => {
          fetchMessages({ silent: true });
        }, 400);
      } catch (err) {
        console.log(
          "[useChatRoom] sendMessage:",
          err?.response?.data || err?.message || err
        );

        setMessages((prev) =>
          prev.map((message) => {
            if (message.tempId !== tempId && message.id !== tempId) {
              return message;
            }

            return {
              ...message,
              pending: false,
              failed: true,
            };
          })
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Pesan gagal dikirim."
        );
      } finally {
        if (mountedRef.current) {
          setIsSending(false);
        }
      }
    },
    [roomId, userId, fetchMessages]
  );

  // Dummy function biar ChatInput lama tetap aman.
  const emitTyping = useCallback(() => {}, []);
  const emitStopTyping = useCallback(() => {}, []);

  const otherUser = useMemo(() => {
    if (!room || !userId) return null;

    if (room.customer?.id && room.customer.id !== userId) return room.customer;
    if (room.driver?.id && room.driver.id !== userId) return room.driver;

    if (Array.isArray(room.members)) {
      const otherMember = room.members.find((member) => {
        const memberUser = member.user || member;
        return memberUser?.id && memberUser.id !== userId;
      });

      return otherMember?.user || otherMember || null;
    }

    return null;
  }, [room, userId]);

  return {
    room,
    otherUser,

    messages,
    isLoading,
    isSending,
    isLoadingMore,
    hasNextPage,
    error,

    isTyping,
    typingUser,

    sendMessage,
    emitTyping,
    emitStopTyping,
    loadMoreMessages,
    refresh: loadInitial,
  };
}

export default useChatRoom;