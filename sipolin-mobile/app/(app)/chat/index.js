// frontend/app/(app)/chat/index.jsx
// WhatsApp-style inbox — list of active chat rooms for the current user.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator,
  RefreshControl, StatusBar,
} from 'react-native';
import { useRouter }    from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons }     from '@expo/vector-icons';
import { chatApi }      from '../../../services/api';
import { useAuth }      from '../../../context/AuthContext';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = now - date;
  if (diff < 60_000)         return 'Just now';
  if (diff < 3_600_000)      return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000)     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 7 * 86_400_000) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function getOtherMember(room, userId) {
  return room.members?.find((m) => m.user.id !== userId)?.user;
}

function Avatar({ uri, name, size = 50 }) {
  if (uri) return <Image source={{ uri }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />;
  const initials = name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
}

function RoomItem({ room, userId, onPress }) {
  const other      = getOtherMember(room, userId);
  const lastMsg    = room.messages?.[0];
  const unread     = room._count?.messages || 0;
  const isLastMine = lastMsg?.senderId === userId;

  return (
    <TouchableOpacity style={styles.roomItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarWrapper}>
        <Avatar uri={other?.avatar} name={other?.name} />
        <View style={styles.onlineDot} />
      </View>
      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomName} numberOfLines={1}>{other?.name || 'Unknown'}</Text>
          <Text style={styles.roomTime}>{formatTime(room.lastMessageAt)}</Text>
        </View>
        <View style={styles.roomPreview}>
          <Text style={[styles.roomLastMsg, unread > 0 && styles.roomLastMsgUnread]} numberOfLines={1}>
            {isLastMine && <Text style={styles.youPrefix}>You: </Text>}
            {room.lastMessage || 'No messages yet'}
          </Text>
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </View>
        <Text style={styles.orderStatus}>
          Order #{room.order?.id?.slice(-6).toUpperCase()} · {room.order?.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatInboxScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [rooms,        setRooms]        = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error,        setError]        = useState(null);

  const loadRooms = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const data = await chatApi.getRooms();
      setRooms(data);
    } catch {
      setError('Failed to load chats. Pull down to retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="search" size={22} color={C.text} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#fff" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RoomItem room={item} userId={user.id} onPress={() => router.push(`/chat/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadRooms(true); }} tintColor={C.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={C.border} />
            <Text style={styles.emptyTitle}>No chats yet</Text>
            <Text style={styles.emptySubtitle}>Your conversations with drivers will appear here.</Text>
          </View>
        }
        contentContainerStyle={rooms.length === 0 && styles.emptyContainer}
      />
    </SafeAreaView>
  );
}

const C = {
  primary: '#25D366', secondary: '#128C7E',
  background: '#FFFFFF', surface: '#F0F2F5',
  text: '#1C1E21', textMuted: '#8696A0', border: '#E9EDEF',
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.background },
  centered:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle:  { fontSize: 22, fontWeight: '700', color: C.text },
  headerIcon:   { padding: 4 },
  errorBanner:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FF3B30', paddingHorizontal: 16, paddingVertical: 10 },
  errorText:    { color: '#fff', fontSize: 13, flex: 1 },
  roomItem:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  avatarWrapper:{ position: 'relative', marginRight: 14 },
  avatar:       { backgroundColor: C.border },
  avatarFallback: { backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#fff', fontWeight: '700', fontSize: 18 },
  onlineDot:    { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: C.primary, borderWidth: 2, borderColor: C.background },
  roomInfo:     { flex: 1 },
  roomHeader:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  roomName:     { fontSize: 16, fontWeight: '600', color: C.text, flex: 1, marginRight: 8 },
  roomTime:     { fontSize: 12, color: C.textMuted },
  roomPreview:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roomLastMsg:  { fontSize: 14, color: C.textMuted, flex: 1, marginRight: 8 },
  roomLastMsgUnread: { color: C.text, fontWeight: '500' },
  youPrefix:    { color: C.textMuted },
  orderStatus:  { fontSize: 11, color: C.textMuted, marginTop: 2 },
  badge:        { backgroundColor: C.primary, borderRadius: 12, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText:    { color: '#fff', fontSize: 11, fontWeight: '700' },
  separator:    { height: 1, backgroundColor: C.border, marginLeft: 80 },
  emptyContainer: { flex: 1 },
  emptyState:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle:   { fontSize: 20, fontWeight: '700', color: C.text, marginTop: 16 },
  emptySubtitle:{ fontSize: 14, color: C.textMuted, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
});