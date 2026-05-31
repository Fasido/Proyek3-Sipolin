import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
  User,
  RotateCcw,
  Bike,
  Package,
  ShoppingBag,
} from 'lucide-react-native';
import { aiAPI } from '../../../services/api';

const PRIMARY = '#00AA5B';
const PRIMARY_DK = '#007A3E';
const PRIMARY_LT = '#E6F7EE';
const INK = '#0f172a';
const INK_MID = '#334155';
const MUTED = '#94a3b8';
const BORDER = '#e2e8f0';
const PAGE_BG = '#f4f6f8';
const WHITE = '#ffffff';
const RED = '#ef4444';

const INITIAL_MESSAGES = [
  {
    id: 'welcome',
    role: 'bot',
    text:
      'Halo, aku AI Sipolin 👋\n\nAku bisa bantu jelasin Pol-Ride, Pol-Send, Nitip, cara pesan, dan fitur-fitur di aplikasi Sipolin.',
  },
];

const QUICK_PROMPTS = [
  {
    id: 'ride',
    label: 'Pol-Ride',
    prompt: 'Pol-Ride itu apa dan cara pakainya gimana?',
    icon: Bike,
  },
  {
    id: 'send',
    label: 'Pol-Send',
    prompt: 'Pol-Send itu buat apa?',
    icon: Package,
  },
  {
    id: 'nitip',
    label: 'Nitip',
    prompt: 'Fitur Nitip di Sipolin itu apa?',
    icon: ShoppingBag,
  },
];


const getAIAnswerText = (result) => {
  const data = result?.data ?? result;
  const core = data?.data ?? data;

  const geminiText =
    core?.candidates?.[0]?.content?.parts?.[0]?.text ||
    core?.candidates?.[0]?.content?.text ||
    core?.candidates?.[0]?.text ||
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.candidates?.[0]?.content?.text ||
    data?.candidates?.[0]?.text;

  const answer =
    result?.response ||
    result?.answer ||
    result?.reply ||
    result?.message ||
    result?.text ||
    core?.response ||
    core?.answer ||
    core?.reply ||
    core?.message ||
    core?.text ||
    data?.response ||
    data?.answer ||
    data?.reply ||
    data?.message ||
    data?.text ||
    geminiText;

  if (typeof answer === 'string' && answer.trim().length > 0) {
    return answer.trim();
  }

  return 'Maaf, aku belum bisa menjawab pertanyaan itu.';
};

const MessageBubble = ({ item }) => {
  const isUser = item.role === 'user';

  return (
    <View style={[S.messageRow, isUser ? S.messageRowUser : S.messageRowBot]}>
      {!isUser && (
        <View style={S.botAvatar}>
          <Bot size={17} color={WHITE} strokeWidth={2.4} />
        </View>
      )}

      <View style={[S.bubble, isUser ? S.userBubble : S.botBubble]}>
        <Text style={[S.bubbleText, isUser ? S.userBubbleText : S.botBubbleText]}>
          {item.text}
        </Text>
      </View>

      {isUser && (
        <View style={S.userAvatar}>
          <User size={16} color={PRIMARY} strokeWidth={2.4} />
        </View>
      )}
    </View>
  );
};

const QuickPrompt = ({ item, onPress }) => {
  const Icon = item.icon;

  return (
    <TouchableOpacity activeOpacity={0.85} style={S.quickChip} onPress={() => onPress(item.prompt)}>
      <Icon size={15} color={PRIMARY} strokeWidth={2.3} />
      <Text style={S.quickChipText}>{item.label}</Text>
    </TouchableOpacity>
  );
};

export default function AiChatbotScreen() {
  const router = useRouter();
  const listRef = useRef(null);

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const resetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setInput('');
  };

  const sendMessage = async (customPrompt) => {
    const prompt = (customPrompt || input).trim();

    if (!prompt || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const result = await aiAPI.chat(prompt);

      const botMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: getAIAnswerText(result),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.log('[AI Chatbot Error]', error?.response?.data || error?.message || error);

      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'bot',
        text:
          'Maaf, AI Sipolin sedang tidak bisa dihubungi. Pastikan backend Node dan backend-ai Python sedang berjalan ya.',
        error: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <SafeAreaView style={S.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_DK} />

      <KeyboardAvoidingView
        style={S.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <LinearGradient
          colors={[PRIMARY_DK, PRIMARY]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={S.header}
        >
          <View style={S.headerTop}>
            <TouchableOpacity activeOpacity={0.8} style={S.headerBtn} onPress={() => router.back()}>
              <ArrowLeft size={21} color={WHITE} strokeWidth={2.6} />
            </TouchableOpacity>

            <View style={S.headerTitleWrap}>
              <View style={S.headerBotIcon}>
                <Bot size={20} color={PRIMARY} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={S.headerTitle}>AI Sipolin</Text>
                <Text style={S.headerSubtitle}>Online · siap bantu kamu</Text>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.8} style={S.headerBtn} onPress={resetChat}>
              <RotateCcw size={19} color={WHITE} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={S.heroCard}>
            <View style={S.heroIcon}>
              <Sparkles size={18} color={PRIMARY} fill={PRIMARY} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.heroTitle}>Tanya apa saja tentang Sipolin</Text>
              <Text style={S.heroSubtitle}>
                Contoh: cara pakai Pol-Ride, kirim barang, atau fitur Nitip.
              </Text>
            </View>
          </View>
        </LinearGradient>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={S.chatContent}
          onContentSizeChange={scrollToBottom}
          ListFooterComponent={
            loading ? (
              <View style={S.typingRow}>
                <View style={S.botAvatar}>
                  <Bot size={17} color={WHITE} strokeWidth={2.4} />
                </View>
                <View style={S.typingBubble}>
                  <ActivityIndicator size="small" color={PRIMARY} />
                  <Text style={S.typingText}>AI Sipolin sedang mengetik...</Text>
                </View>
              </View>
            ) : null
          }
        />

        <View style={S.quickPromptWrap}>
          <FlatList
            horizontal
            data={QUICK_PROMPTS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <QuickPrompt item={item} onPress={sendMessage} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={S.quickPromptContent}
          />
        </View>

        <View style={S.inputArea}>
          <View style={S.inputBox}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Tanya AI Sipolin..."
              placeholderTextColor={MUTED}
              style={S.input}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                S.sendButton,
                (!input.trim() || loading) && S.sendButtonDisabled,
              ]}
              disabled={!input.trim() || loading}
              onPress={() => sendMessage()}
            >
              {loading ? (
                <ActivityIndicator size="small" color={WHITE} />
              ) : (
                <Send size={18} color={WHITE} strokeWidth={2.6} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PRIMARY_DK,
  },
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  headerBotIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },

  heroCard: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroTitle: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
    fontWeight: '500',
  },

  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: PRIMARY_LT,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#BFF4D8',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 20,
  },
  botBubble: {
    backgroundColor: WHITE,
    borderBottomLeftRadius: 7,
    borderWidth: 1,
    borderColor: BORDER,
  },
  userBubble: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 7,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  botBubbleText: {
    color: INK_MID,
    fontWeight: '500',
  },
  userBubbleText: {
    color: WHITE,
    fontWeight: '600',
  },

  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typingBubble: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderBottomLeftRadius: 7,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },

  quickPromptWrap: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: WHITE,
    paddingTop: 10,
  },
  quickPromptContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_LT,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#BFF4D8',
  },
  quickChipText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '800',
    color: PRIMARY,
  },

  inputArea: {
    backgroundColor: WHITE,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  inputBox: {
    minHeight: 52,
    maxHeight: 112,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    color: INK,
    fontSize: 14,
    fontWeight: '500',
    paddingTop: 8,
    paddingBottom: 8,
    maxHeight: 90,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
});