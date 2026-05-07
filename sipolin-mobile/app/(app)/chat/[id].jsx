// frontend/app/(app)/chat/[id].jsx
// WhatsApp-like chat room — real-time messages via Socket.io

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  StatusBar, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons }     from '@expo/vector-icons';
// ✅ 1. Sesuaikan folder 'hook' (tanpa s) sesuai screenshot lo
import { useChatRoom }  from '../../../hook/useChatRoom'; 

// ✅ 2. Import Auth tetap sama
import { useAuth }      from '../../../context/AuthContext';

// ✅ 3. Ganti chat.api jadi api (karena sudah digabung) dan panggil chatAPI (huruf gede)
import { chatAPI }      from '../../../services/api';

// ─── colour tokens ───────────────────────────────────────────────────────────
const C = {
  primary:    '#25D366',
  secondary:  '#128C7E',
  background: '#ECE5DD',   // classic WhatsApp wallpaper beige
  surface:    '#FFFFFF',
  header:     '#128C7E',
  sentBubble: '#D9FDD3',
  recvBubble: '#FFFFFF',
  text:       '#111B21',
  textMuted:  '#8696A0',
  border:     '#E9EDEF',
  inputBg:    '#FFFFFF',
  tick:       '#53BDEB',
};

// ─── helpers ─────────────────────────────────────────────────────────────────
function formatMsgTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt).toDateString();
    if (d !== currentDate) {
      groups.push({ type: 'date', id: `date-${d}`, date: d });
      currentDate = d;
    }
    groups.push({ type: 'message', ...msg });
  });
  return groups;
}

function DateDivider({ date }) {
  const label = (() => {
    const d   = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
  })();
  return (
    <View style={styles.dateDivider}>
      <Text style={styles.dateDividerText}>{label}</Text>
    </View>
  );
}

// ─── MessageBubble ───────────────────────────────────────────────────────────
const MessageBubble = React.memo(({ message, isMine }) => (
  <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
    <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs, message.pending && styles.bubblePending]}>
      <Text style={styles.bubbleText}>{message.text}</Text>
      <View style={styles.bubbleMeta}>
        <Text style={styles.bubbleTime}>{formatMsgTime(message.createdAt)}</Text>
        {isMine && (
          <Ionicons
            name={message.isRead ? 'checkmark-done' : 'checkmark'}
            size={14}
            color={message.isRead ? C.tick : C.textMuted}
            style={{ marginLeft: 3 }}
          />
        )}
      </View>
    </View>
  </View>
));

// ─── TypingIndicator ─────────────────────────────────────────────────────────
function TypingIndicator({ name }) {
  return (
    <View style={[styles.bubbleRow, styles.bubbleRowTheirs]}>
      <View style={[styles.bubble, styles.bubbleTheirs, styles.typingBubble]}>
        <Text style={styles.typingText}>{name} is typing</Text>
        <View style={styles.typingDots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, { animationDelay: `${i * 0.3}s` }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── ChatInput ───────────────────────────────────────────────────────────────
function ChatInput({ onSend, onTyping, onStopTyping, isSending }) {
  const [text, setText]     = useState('');
  const typingDebounce      = useRef(null);
  const isCurrentlyTyping   = useRef(false);

  const handleChangeText = (val) => {
    setText(val);
    if (val.length > 0 && !isCurrentlyTyping.current) {
      isCurrentlyTyping.current = true;
      onTyping();
    }
    clearTimeout(typingDebounce.current);
    typingDebounce.current = setTimeout(() => {
      if (isCurrentlyTyping.current) {
        isCurrentlyTyping.current = false;
        onStopTyping();
      }
    }, 1500);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    setText('');
    clearTimeout(typingDebounce.current);
    isCurrentlyTyping.current = false;
    onStopTyping();
    onSend(trimmed);
  };

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <TouchableOpacity style={styles.inputIcon}>
          <Ionicons name="happy-outline" size={24} color={C.textMuted} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Message"
          placeholderTextColor={C.textMuted}
          value={text}
          onChangeText={handleChangeText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity style={styles.inputIcon}>
          <Ionicons name="attach" size={24} color={C.textMuted} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.sendButton, (!text.trim() || isSending) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || isSending}
      >
        {isSending
          ? <ActivityIndicator size="small" color="#fff" />
          : <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 2 }} />
        }
      </TouchableOpacity>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ChatRoomScreen() {
  const { id: roomId } = useLocalSearchParams();
  const router         = useRouter();
  const { user }       = useAuth();
  const flatListRef    = useRef(null);
  const [roomMeta, setRoomMeta] = useState(null);

  const {
    messages, isLoading, isSending, isLoadingMore,
    hasNextPage, error, isTyping, typingUser,
    sendMessage, emitTyping, emitStopTyping, loadMoreMessages,
  } = useChatRoom(roomId, user);

  // Fetch room metadata (other user's name / avatar) for the header
  useEffect(() => {
    chatApi.getRooms().then((rooms) => {
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        const other = room.members?.find((m) => m.user.id !== user.id)?.user;
        setRoomMeta({ ...room, otherUser: other });
      }
    }).catch(() => {});
  }, [roomId, user.id]);

  // Scroll to bottom whenever a new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const items = groupMessagesByDate(messages);

  const renderItem = useCallback(({ item }) => {
    if (item.type === 'date') return <DateDivider date={item.date} />;
    return <MessageBubble message={item} isMine={item.senderId === user.id} />;
  }, [user.id]);

  return (
    <>
      {/* Expo Router dynamic header */}
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <SafeAreaView style={styles.headerSafe} edges={['top']}>
              <StatusBar barStyle="light-content" backgroundColor={C.header} />
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                {roomMeta?.otherUser?.avatar
                  ? <Image source={{ uri: roomMeta.otherUser.avatar }} style={styles.headerAvatar} />
                  : (
                    <View style={styles.headerAvatarFallback}>
                      <Text style={styles.headerAvatarText}>
                        {roomMeta?.otherUser?.name?.[0]?.toUpperCase() || '?'}
                      </Text>
                    </View>
                  )
                }
                <View style={styles.headerInfo}>
                  <Text style={styles.headerName} numberOfLines={1}>
                    {roomMeta?.otherUser?.name || 'Loading…'}
                  </Text>
                  <Text style={styles.headerStatus}>
                    {isTyping ? `${typingUser} is typing…` : (roomMeta?.otherUser?.role?.toLowerCase() || '')}
                  </Text>
                </View>
                <TouchableOpacity style={styles.headerAction}>
                  <Ionicons name="call" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerAction}>
                  <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Background pattern */}
        <View style={styles.wallpaper} />

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={C.secondary} />
          </View>
        ) : (
          <>
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={14} color="#fff" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <FlatList
              ref={flatListRef}
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.messageList}
              onStartReached={loadMoreMessages}
              onStartReachedThreshold={0.2}
              ListHeaderComponent={
                isLoadingMore
                  ? <ActivityIndicator style={{ marginVertical: 12 }} color={C.secondary} />
                  : null
              }
              ListFooterComponent={
                isTyping
                  ? <TypingIndicator name={typingUser} />
                  : null
              }
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
              maxToRenderPerBatch={20}
            />
          </>
        )}

        <ChatInput
          onSend={sendMessage}
          onTyping={emitTyping}
          onStopTyping={emitStopTyping}
          isSending={isSending}
        />
      </KeyboardAvoidingView>
    </>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Header
  headerSafe:          { backgroundColor: C.header },
  header:              { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 10, gap: 8, backgroundColor: C.header },
  backBtn:             { padding: 4 },
  headerAvatar:        { width: 40, height: 40, borderRadius: 20 },
  headerAvatarFallback:{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  headerAvatarText:    { color: '#fff', fontWeight: '700', fontSize: 18 },
  headerInfo:          { flex: 1 },
  headerName:          { color: '#fff', fontWeight: '700', fontSize: 17 },
  headerStatus:        { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 1 },
  headerAction:        { padding: 6 },

  // Screen
  container:   { flex: 1, backgroundColor: C.background },
  wallpaper:   { ...StyleSheet.absoluteFillObject, backgroundColor: C.background, opacity: 0.97 },
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FF3B30', paddingHorizontal: 14, paddingVertical: 8 },
  errorText:   { color: '#fff', fontSize: 12 },

  // Messages
  messageList: { paddingHorizontal: 8, paddingVertical: 12, paddingBottom: 4 },
  bubbleRow:   { flexDirection: 'row', marginVertical: 2 },
  bubbleRowMine:   { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '78%', borderRadius: 8, paddingHorizontal: 10, paddingTop: 6, paddingBottom: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 1, elevation: 1,
  },
  bubbleMine:    { backgroundColor: C.sentBubble, borderTopRightRadius: 2 },
  bubbleTheirs:  { backgroundColor: C.recvBubble, borderTopLeftRadius: 2 },
  bubblePending: { opacity: 0.65 },

  bubbleText:  { fontSize: 15, color: C.text, lineHeight: 20 },
  bubbleMeta:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 3, gap: 2 },
  bubbleTime:  { fontSize: 11, color: C.textMuted },

  // Date divider
  dateDivider: { alignItems: 'center', marginVertical: 12 },
  dateDividerText: { backgroundColor: 'rgba(225,245,254,0.92)', color: '#52677B', fontSize: 12, fontWeight: '500', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },

  // Typing indicator
  typingBubble: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 6 },
  typingText:   { fontSize: 13, color: C.textMuted, fontStyle: 'italic' },
  typingDots:   { flexDirection: 'row', gap: 3 },
  dot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: C.textMuted },

  // Input
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 8,
    paddingVertical: 8, gap: 8, backgroundColor: C.background,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  inputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: C.inputBg, borderRadius: 24,
    paddingHorizontal: 4, paddingVertical: 4,
    minHeight: 44,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
  },
  inputIcon:  { padding: 8 },
  input:      { flex: 1, fontSize: 15, color: C.text, maxHeight: 120, paddingVertical: 6, paddingHorizontal: 4 },
  sendButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 3,
  },
  sendButtonDisabled: { backgroundColor: C.textMuted, shadowOpacity: 0 },
});