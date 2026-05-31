// sipolin-mobile/app/(app)/chat/index.jsx
// Inbox chat Sipolin — pembeli dan driver.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { chatAPI, extractApiList } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const C = {
  primary: "#00AA5B",
  primaryLt: "#E6F7EE",
  background: "#F4F6F8",
  surface: "#FFFFFF",
  text: "#0f172a",
  muted: "#94a3b8",
  border: "#e5e7eb",
  danger: "#ef4444",
};

function formatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diff = now - date;

  if (diff < 60_000) return "Baru";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (diff < 7 * 86_400_000) {
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
    });
  }
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function getOtherUser(room, userId) {
  if (room?.customer?.id && room.customer.id !== userId) return room.customer;
  if (room?.driver?.id && room.driver.id !== userId) return room.driver;

  const member = room?.members?.find?.((m) => m.user?.id !== userId);
  return member?.user || null;
}

function Avatar({ uri, name, size = 52 }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  const initials =
    name
      ?.split(" ")
      .map((item) => item[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
}

function RoomItem({ room, userId, onPress }) {
  const other = getOtherUser(room, userId);
  const unread = room.unreadCount || room._count?.messages || 0;
  const lastMsg = room.messages?.[0];
  const isLastMine = lastMsg?.senderId === userId;

  const roleLabel =
    String(other?.role || "").toLowerCase() === "driver"
      ? "Driver"
      : "Pembeli";

  return (
    <TouchableOpacity style={styles.roomItem} onPress={onPress} activeOpacity={0.76}>
      <View style={styles.avatarWrapper}>
        <Avatar uri={other?.profilePicture || other?.avatar} name={other?.name} />
        <View style={styles.onlineDot} />
      </View>

      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomName} numberOfLines={1}>
            {other?.name || "User Sipolin"}
          </Text>
          <Text style={styles.roomTime}>{formatTime(room.lastMessageAt || room.updatedAt)}</Text>
        </View>

        <View style={styles.roomPreview}>
          <Text
            style={[styles.roomLastMsg, unread > 0 && styles.roomLastMsgUnread]}
            numberOfLines={1}
          >
            {isLastMine ? "Kamu: " : ""}
            {room.lastMessage || "Belum ada pesan"}
          </Text>

          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 99 ? "99+" : unread}</Text>
            </View>
          )}
        </View>

        <Text style={styles.orderStatus} numberOfLines={1}>
          {roleLabel} · {room.order?.title || room.order?.type || "Pesanan"} · {room.order?.status || "-"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatInboxScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const aTime = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [rooms]);

  const loadRooms = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);

    try {
      const res = await chatAPI.getRooms();
      const list = extractApiList(res);
      setRooms(list);
    } catch (err) {
      console.log("[ChatInbox] loadRooms:", err?.response?.data || err?.message || err);
      setError("Gagal memuat chat. Tarik ke bawah untuk coba lagi.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Memuat chat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Chat</Text>
          <Text style={styles.headerSub}>Obrolan pembeli dan driver</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon} onPress={() => loadRooms(true)}>
          <Ionicons name="refresh" size={22} color={C.text} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#fff" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={sortedRooms}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <RoomItem
            room={item}
            userId={user?.id}
            onPress={() => router.push(`/chat/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              loadRooms(true);
            }}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={C.border} />
            <Text style={styles.emptyTitle}>Belum ada chat</Text>
            <Text style={styles.emptySubtitle}>
              Chat akan muncul setelah driver mengambil pesanan.
            </Text>
          </View>
        }
        contentContainerStyle={sortedRooms.length === 0 ? styles.emptyContainer : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.background },
  loadingText: { color: C.muted, fontSize: 13, fontWeight: "700", marginTop: 10 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 16 },
  headerTitle: { fontSize: 28, fontWeight: "900", color: C.text, letterSpacing: -0.6 },
  headerSub: { fontSize: 13, color: C.muted, fontWeight: "700", marginTop: 2 },
  headerIcon: { width: 42, height: 42, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.danger, paddingHorizontal: 16, paddingVertical: 10 },
  errorText: { color: "#fff", fontSize: 13, flex: 1 },
  roomItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, backgroundColor: C.surface },
  avatarWrapper: { position: "relative", marginRight: 14 },
  avatar: { backgroundColor: C.border },
  avatarFallback: { backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  avatarInitials: { color: "#fff", fontWeight: "900", fontSize: 18 },
  onlineDot: { position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: C.primary, borderWidth: 2, borderColor: C.surface },
  roomInfo: { flex: 1 },
  roomHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  roomName: { fontSize: 16, fontWeight: "900", color: C.text, flex: 1, marginRight: 8 },
  roomTime: { fontSize: 12, color: C.muted, fontWeight: "700" },
  roomPreview: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  roomLastMsg: { fontSize: 14, color: C.muted, flex: 1, marginRight: 8, fontWeight: "600" },
  roomLastMsgUnread: { color: C.text, fontWeight: "900" },
  orderStatus: { fontSize: 11.5, color: C.muted, marginTop: 3, fontWeight: "700" },
  badge: { backgroundColor: C.primary, borderRadius: 12, minWidth: 22, height: 22, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  separator: { height: 1, backgroundColor: C.border, marginLeft: 82 },
  emptyContainer: { flex: 1 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 34 },
  emptyTitle: { fontSize: 20, fontWeight: "900", color: C.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: C.muted, marginTop: 8, textAlign: "center", lineHeight: 21 },
});
