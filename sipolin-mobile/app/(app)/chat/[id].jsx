// sipolin-mobile/app/(app)/chat/[id].jsx
// WhatsApp-like room chat untuk Sipolin.

import React, { useMemo, useRef, useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Image,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useChatRoom } from "../../../hook/useChatRoom";
import { useAuth } from "../../../context/AuthContext";

const C = {
  primary: "#00AA5B",
  secondary: "#007A3E",
  background: "#ECE5DD",
  surface: "#FFFFFF",
  header: "#00AA5B",
  sentBubble: "#D9FDD3",
  recvBubble: "#FFFFFF",
  text: "#111B21",
  textMuted: "#8696A0",
  border: "#E9EDEF",
  inputBg: "#FFFFFF",
  tick: "#53BDEB",
  danger: "#ef4444",
};

function formatMsgTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;

  messages.forEach((msg) => {
    const d = new Date(msg.createdAt).toDateString();

    if (d !== currentDate) {
      groups.push({
        type: "date",
        id: `date-${d}`,
        date: d,
      });
      currentDate = d;
    }

    groups.push({
      type: "message",
      ...msg,
    });
  });

  return groups;
}

function DateDivider({ date }) {
  const label = (() => {
    const d = new Date(date);
    const now = new Date();

    if (d.toDateString() === now.toDateString()) return "Hari ini";

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (d.toDateString() === yesterday.toDateString()) return "Kemarin";

    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  })();

  return (
    <View style={styles.dateDivider}>
      <Text style={styles.dateDividerText}>{label}</Text>
    </View>
  );
}

const MessageBubble = React.memo(({ message, isMine }) => (
  <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
    <View
      style={[
        styles.bubble,
        isMine ? styles.bubbleMine : styles.bubbleTheirs,
        message.pending && styles.bubblePending,
        message.failed && styles.bubbleFailed,
      ]}
    >
      <Text style={styles.bubbleText}>{message.text}</Text>

      <View style={styles.bubbleMeta}>
        {message.failed && <Text style={styles.failedText}>gagal</Text>}
        <Text style={styles.bubbleTime}>{formatMsgTime(message.createdAt)}</Text>
        {isMine && (
          <Ionicons
            name={message.isRead ? "checkmark-done" : "checkmark"}
            size={14}
            color={message.isRead ? C.tick : C.textMuted}
            style={{ marginLeft: 3 }}
          />
        )}
      </View>
    </View>
  </View>
));

function TypingIndicator({ name }) {
  return (
    <View style={[styles.bubbleRow, styles.bubbleRowTheirs]}>
      <View style={[styles.bubble, styles.bubbleTheirs, styles.typingBubble]}>
        <Text style={styles.typingText}>{name || "User"} sedang mengetik...</Text>
      </View>
    </View>
  );
}

function ChatInput({ onSend, onTyping, onStopTyping, isSending }) {
  const [text, setText] = useState("");
  const typingDebounce = useRef(null);
  const isCurrentlyTyping = useRef(false);

  const handleChangeText = (value) => {
    setText(value);

    if (value.length > 0 && !isCurrentlyTyping.current) {
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

    setText("");
    clearTimeout(typingDebounce.current);
    isCurrentlyTyping.current = false;
    onStopTyping();
    onSend(trimmed);
  };

  useEffect(() => {
    return () => clearTimeout(typingDebounce.current);
  }, []);

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <TouchableOpacity style={styles.inputIcon}>
          <Ionicons name="happy-outline" size={24} color={C.textMuted} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Tulis pesan..."
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
        {isSending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 2 }} />
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function ChatRoomScreen() {
  const { id: roomId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const flatListRef = useRef(null);

  const {
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
  } = useChatRoom(roomId, user);

  const items = useMemo(() => groupMessagesByDate(messages), [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [messages.length]);

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === "date") return <DateDivider date={item.date} />;
      return <MessageBubble message={item} isMine={item.senderId === user?.id} />;
    },
    [user?.id]
  );

  const handleCall = () => {
    const phone = otherUser?.phone;

    if (!phone) return;

    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const displayName = otherUser?.name || "Chat Sipolin";
  const displayRole =
    String(otherUser?.role || "").toLowerCase() === "driver"
      ? "Driver"
      : "Pembeli";

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <SafeAreaView style={styles.headerSafe} edges={["top"]}>
              <StatusBar barStyle="light-content" backgroundColor={C.header} />

              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                {otherUser?.profilePicture || otherUser?.avatar ? (
                  <Image
                    source={{ uri: otherUser.profilePicture || otherUser.avatar }}
                    style={styles.headerAvatar}
                  />
                ) : (
                  <View style={styles.headerAvatarFallback}>
                    <Text style={styles.headerAvatarText}>
                      {displayName?.[0]?.toUpperCase() || "?"}
                    </Text>
                  </View>
                )}

                <View style={styles.headerInfo}>
                  <Text style={styles.headerName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.headerStatus}>
                    {isTyping ? `${typingUser || displayName} mengetik...` : `${displayRole} · ${room?.order?.status || ""}`}
                  </Text>
                </View>

                <TouchableOpacity style={styles.headerAction} onPress={handleCall}>
                  <Ionicons name="call" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={styles.wallpaper} />

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={C.secondary} />
            <Text style={styles.loadingText}>Memuat chat...</Text>
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
              keyExtractor={(item) => String(item.id || item.tempId)}
              renderItem={renderItem}
              contentContainerStyle={styles.messageList}
              onStartReached={hasNextPage ? loadMoreMessages : undefined}
              onStartReachedThreshold={0.2}
              ListHeaderComponent={
                isLoadingMore ? (
                  <ActivityIndicator style={{ marginVertical: 12 }} color={C.secondary} />
                ) : null
              }
              ListFooterComponent={isTyping ? <TypingIndicator name={typingUser} /> : null}
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

const styles = StyleSheet.create({
  headerSafe: { backgroundColor: C.header },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingBottom: 10, gap: 8, backgroundColor: C.header },
  backBtn: { padding: 4 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerAvatarFallback: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  headerAvatarText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  headerInfo: { flex: 1 },
  headerName: { color: "#fff", fontWeight: "900", fontSize: 17 },
  headerStatus: { color: "rgba(255,255,255,0.82)", fontSize: 12, marginTop: 1, fontWeight: "600" },
  headerAction: { padding: 6 },
  container: { flex: 1, backgroundColor: C.background },
  wallpaper: { ...StyleSheet.absoluteFillObject, backgroundColor: C.background, opacity: 0.97 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 8, color: C.textMuted, fontWeight: "700" },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.danger, paddingHorizontal: 14, paddingVertical: 8 },
  errorText: { color: "#fff", fontSize: 12 },
  messageList: { paddingHorizontal: 8, paddingVertical: 12, paddingBottom: 4 },
  bubbleRow: { flexDirection: "row", marginVertical: 2 },
  bubbleRowMine: { justifyContent: "flex-end" },
  bubbleRowTheirs: { justifyContent: "flex-start" },
  bubble: { maxWidth: "78%", borderRadius: 10, paddingHorizontal: 10, paddingTop: 7, paddingBottom: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 1, elevation: 1 },
  bubbleMine: { backgroundColor: C.sentBubble, borderTopRightRadius: 2 },
  bubbleTheirs: { backgroundColor: C.recvBubble, borderTopLeftRadius: 2 },
  bubblePending: { opacity: 0.65 },
  bubbleFailed: { borderWidth: 1, borderColor: C.danger },
  bubbleText: { fontSize: 15, color: C.text, lineHeight: 20 },
  bubbleMeta: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 3, gap: 2 },
  bubbleTime: { fontSize: 11, color: C.textMuted },
  failedText: { color: C.danger, fontSize: 10, marginRight: 4 },
  dateDivider: { alignItems: "center", marginVertical: 12 },
  dateDividerText: { backgroundColor: "rgba(225,245,254,0.92)", color: "#52677B", fontSize: 12, fontWeight: "600", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  typingBubble: { paddingVertical: 10 },
  typingText: { fontSize: 13, color: C.textMuted, fontStyle: "italic" },
  inputContainer: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 8, paddingVertical: 8, gap: 8, backgroundColor: C.background, borderTopWidth: 1, borderTopColor: C.border },
  inputWrapper: { flex: 1, flexDirection: "row", alignItems: "flex-end", backgroundColor: C.inputBg, borderRadius: 24, paddingHorizontal: 4, paddingVertical: 4, minHeight: 44, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  inputIcon: { padding: 8 },
  input: { flex: 1, fontSize: 15, color: C.text, maxHeight: 120, paddingVertical: 6, paddingHorizontal: 4 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 3 },
  sendButtonDisabled: { backgroundColor: C.textMuted, shadowOpacity: 0 },
});
