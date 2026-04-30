/**
 * app/(app)/history.jsx — SIPOLIN Premium Order History Screen
 * ─────────────────────────────────────────────────────────────
 * Dark Blue (#0f172a) Theme · Glassmorphism Cards · Reanimated v3
 *
 * Features:
 * • Fully dark premium UI — gradient mesh background + decorative blobs
 * • Glassmorphism order cards (expo-blur) with glow status accents
 * • Skeleton shimmer loading (tanpa library tambahan)
 * • Pull-to-refresh dengan RefreshControl
 * • FadeInDown stagger per card (react-native-reanimated)
 * • Tab filter: Semua · Selesai · Dibatalkan
 * • Date-grouped sections dengan floating separator
 * • Empty state illustration
 * • Tap card → detail pesanan
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
  StatusBar,
  Platform,
}                          from 'react-native';
import { SafeAreaView }    from 'react-native-safe-area-context';
import { LinearGradient }  from 'expo-linear-gradient';
import { BlurView }        from 'expo-blur';
import { useRouter }       from 'expo-router';
import * as Haptics        from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
}                          from 'react-native-reanimated';
import { ordersAPI }       from '../../services/api';

const { width: W } = Dimensions.get('window');

// ─── Design Tokens ───────────────────────────────────────────────────────────
const D = {
  // Backgrounds
  bg:          '#0a0f1e',         // deepest dark
  bgCard:      'rgba(255,255,255,0.055)',
  bgCardBorder:'rgba(255,255,255,0.10)',

  // Accent blues (same family as profile.jsx gradient)
  blue:        '#2563eb',
  blueDk:      '#1d4ed8',
  blueBright:  '#60a5fa',
  blueGlow:    'rgba(37,99,235,0.25)',

  // Semantics
  success:     '#22c55e',
  successGlow: 'rgba(34,197,94,0.18)',
  successBg:   'rgba(34,197,94,0.12)',
  successBdr:  'rgba(34,197,94,0.30)',

  danger:      '#f87171',
  dangerGlow:  'rgba(248,113,113,0.18)',
  dangerBg:    'rgba(248,113,113,0.12)',
  dangerBdr:   'rgba(248,113,113,0.30)',

  // Typography
  textHi:      '#f1f5f9',
  textMid:     '#94a3b8',
  textLow:     '#475569',

  // Skeleton
  skelBase:    'rgba(255,255,255,0.06)',
  skelShine:   'rgba(255,255,255,0.12)',
};

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS = {
  completed: {
    label: 'Selesai',
    icon:  '✓',
    color:  D.success,
    glow:   D.successGlow,
    bg:     D.successBg,
    border: D.successBdr,
    grad:  ['#052e16', '#14532d'],
  },
  cancelled: {
    label: 'Dibatalkan',
    icon:  '✕',
    color:  D.danger,
    glow:   D.dangerGlow,
    bg:     D.dangerBg,
    border: D.dangerBdr,
    grad:  ['#1c0000', '#3b0f0f'],
  },
};

// ─── Order Type Icons ─────────────────────────────────────────────────────────
const TYPE_ICON = {
  ride:    '🛵',
  food:    '🍜',
  package: '📦',
  default: '📋',
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',       label: 'Semua'      },
  { key: 'completed', label: 'Selesai'    },
  { key: 'cancelled', label: 'Dibatalkan' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatRp = (n) =>
  'Rp ' + Number(n || 0).toLocaleString('id-ID');

const formatDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day:    '2-digit', month: 'short', year: 'numeric',
    hour:   '2-digit', minute: '2-digit',
  });
};

const dateLabel = (iso) => {
  const d   = new Date(iso);
  const now = new Date();
  const t   = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = t(now) - t(d);

  if (diff === 0)          return 'Hari ini';
  if (diff === 86400000)   return 'Kemarin';
  return d.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
};

const groupByDate = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const key = dateLabel(item.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return [...map.entries()].map(([date, orders]) => ({ date, orders }));
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// Shimmer skeleton bar
const SkeletonBar = ({ width = '100%', height = 14, radius = 8, style }) => {
  const shine = useSharedValue(0);
  useEffect(() => {
    shine.value = withRepeat(
      withTiming(1, { duration: 1100 }),
      -1, true
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shine.value, [0, 1], [0.5, 1]),
  }));
  return (
    <Animated.View style={[
      { width, height, borderRadius: radius, backgroundColor: D.skelBase },
      animStyle, style,
    ]} />
  );
};

// Skeleton card
const SkeletonCard = ({ delay = 0 }) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(350)} style={styles.skeletonCard}>
    <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFill} />
    <View style={styles.skeletonInner}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
        <SkeletonBar width={80}  height={10} />
        <SkeletonBar width={60}  height={10} />
      </View>
      <SkeletonBar width="75%" height={16} radius={10} style={{ marginBottom: 10 }} />
      <SkeletonBar width="55%" height={12} style={{ marginBottom: 10 }} />
      <SkeletonBar width="65%" height={12} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBar width={90} height={28} radius={14} />
        <SkeletonBar width={70} height={18} radius={8} />
      </View>
    </View>
  </Animated.View>
);

// Status glow badge
const StatusBadge = ({ status }) => {
  const cfg = STATUS[status];
  if (!cfg) return null;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <View style={[styles.badgeDot, { backgroundColor: cfg.color, shadowColor: cfg.color }]} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>
        {cfg.icon}  {cfg.label}
      </Text>
    </View>
  );
};

// Glass order card
const OrderCard = ({ order, index, onPress }) => {
  const cfg     = STATUS[order.status] || STATUS.completed;
  const typeIcon = TYPE_ICON[order.type] || TYPE_ICON.default;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).duration(450).springify().damping(16)}
    >
      <TouchableOpacity
        onPress={() => onPress(order)}
        activeOpacity={0.82}
        style={styles.cardOuter}
      >
        {/* Glow accent behind card */}
        <View style={[styles.cardGlow, { shadowColor: cfg.color }]} />

        {/* Glass surface */}
        <BlurView intensity={16} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Top colored micro-stripe */}
        <LinearGradient
          colors={cfg.grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardStripe}
        />

        <View style={styles.cardContent}>

          {/* Row 1: date + type icon */}
          <View style={styles.cardRow}>
            <Text style={styles.cardDate}>{formatDateTime(order.createdAt)}</Text>
            <Text style={styles.cardTypeIcon}>{typeIcon}</Text>
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Row 2: route */}
          <View style={styles.routeBox}>
            {/* Pickup */}
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: D.blueBright }]} />
              <Text style={styles.routeLabel}>Jemput</Text>
              <Text style={styles.routeValue} numberOfLines={1}>{order.pickup}</Text>
            </View>

            {/* Connector line */}
            <View style={styles.routeLine} />

            {/* Dropoff */}
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: cfg.color }]} />
              <Text style={styles.routeLabel}>Tujuan</Text>
              <Text style={styles.routeValue} numberOfLines={1}>{order.destination}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Row 3: status + price */}
          <View style={[styles.cardRow, { alignItems: 'center' }]}>
            <StatusBadge status={order.status} />
            <Text style={styles.cardPrice}>{formatRp(order.price)}</Text>
          </View>

        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Floating date section header
const SectionHeader = ({ title }) => (
  <Animated.View
    entering={FadeInDown.duration(300)}
    style={styles.sectionHeader}
  >
    <LinearGradient
      colors={['rgba(37,99,235,0.25)', 'rgba(37,99,235,0.08)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.sectionPill}
    >
      <View style={styles.sectionDot} />
      <Text style={styles.sectionText}>{title}</Text>
    </LinearGradient>
  </Animated.View>
);

// Empty state
const EmptyState = ({ tab }) => (
  <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.emptyBox}>
    <Text style={styles.emptyEmoji}>
      {tab === 'cancelled' ? '🚫' : tab === 'completed' ? '📦' : '🗂️'}
    </Text>
    <Text style={styles.emptyTitle}>Belum Ada Histori</Text>
    <Text style={styles.emptyDesc}>
      {tab === 'cancelled'
        ? 'Tidak ada pesanan yang dibatalkan.'
        : tab === 'completed'
        ? 'Belum ada pesanan yang selesai.'
        : 'Histori perjalananmu akan muncul di sini.'}
    </Text>
  </Animated.View>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const router = useRouter();

  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');
  const [activeTab,  setActiveTab]  = useState('all');

  // ── Derived ─────────────────────────────────────────────────────────────────
  const filtered = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab);
  const grouped = groupByDate(filtered);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const res = await ordersAPI.getHistory();
      const data = res.data;
      // Backend returns { orders: [...] } or array directly
      setOrders(Array.isArray(data) ? data : data?.orders || []);
      setError('');
    } catch (err) {
      console.error('[History] fetch error:', err);
      setError('Gagal memuat histori. Tarik untuk mencoba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
  }, [fetchHistory]);

  // ── Tab change ───────────────────────────────────────────────────────────────
  const handleTab = (key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(key);
  };

  // ── Navigate to detail ───────────────────────────────────────────────────────
  const handleCardPress = (order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/orders/${order.id}`);
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={D.bg} />

      {/* ── Multi-layer dark background ─────────────────────────────────────── */}
      <LinearGradient
        colors={['#0a0f1e', '#0f172a', '#0d1b3e']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative blobs (matching profile.jsx aesthetic) */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.duration(450)} style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Riwayat Perjalanan</Text>
            <Text style={styles.headerTitle}>Histori Pesanan</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{orders.length}</Text>
          </View>
        </Animated.View>

        {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.tabRow}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTab(tab.key)}
                style={styles.tabWrap}
                activeOpacity={0.7}
              >
                {active ? (
                  <LinearGradient
                    colors={[D.blue, D.blueDk]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabActive}
                  >
                    <Text style={styles.tabTextActive}>{tab.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.tabInactive}>
                    <Text style={styles.tabTextInactive}>{tab.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={D.blue}
              colors={[D.blue]}
            />
          }
        >
          {/* Loading skeletons */}
          {loading && (
            <>
              {[0, 1, 2, 3].map((i) => (
                <SkeletonCard key={i} delay={i * 80} />
              ))}
            </>
          )}

          {/* Error banner */}
          {!loading && error ? (
            <Animated.View entering={FadeInDown.duration(350)} style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* Empty state */}
          {!loading && !error && grouped.length === 0 && (
            <EmptyState tab={activeTab} />
          )}

          {/* Grouped order list */}
          {!loading && grouped.map(({ date, orders: dayOrders }) => (
            <View key={date}>
              <SectionHeader title={date} />
              {dayOrders.map((order, idx) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  index={idx}
                  onPress={handleCardPress}
                />
              ))}
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: D.bg },
  safe: { flex: 1 },

  // ── Blobs ─────────────────────────────────────────────────────────────────
  blob1: {
    position:        'absolute',
    width:            300,
    height:           300,
    borderRadius:     150,
    backgroundColor: 'rgba(37,99,235,0.12)',
    top:             -60,
    right:           -80,
    transform:       [{ scaleX: 1.4 }],
  },
  blob2: {
    position:        'absolute',
    width:            220,
    height:           220,
    borderRadius:     110,
    backgroundColor: 'rgba(139,92,246,0.08)',
    bottom:           80,
    left:            -60,
  },
  blob3: {
    position:        'absolute',
    width:            160,
    height:           160,
    borderRadius:     80,
    backgroundColor: 'rgba(37,99,235,0.07)',
    top:              '40%',
    right:           -40,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'flex-end',
    paddingHorizontal: 22,
    paddingTop:      Platform.OS === 'android' ? 12 : 6,
    paddingBottom:   18,
  },
  headerSub: {
    fontSize:   11,
    color:      D.textMid,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize:      28,
    fontWeight:    '800',
    color:         D.textHi,
    letterSpacing: -0.8,
  },
  headerBadge: {
    backgroundColor: 'rgba(37,99,235,0.20)',
    borderRadius:    20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth:     1,
    borderColor:     'rgba(37,99,235,0.35)',
  },
  headerBadgeText: {
    color:      D.blueBright,
    fontSize:   16,
    fontWeight: '800',
  },

  // ── Tab Bar ───────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection:     'row',
    paddingHorizontal: 16,
    marginBottom:      18,
    gap:               8,
  },
  tabWrap:  { flex: 1 },
  tabActive: {
    borderRadius:    22,
    paddingVertical: 10,
    alignItems:      'center',
    shadowColor:     D.blue,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.45,
    shadowRadius:    10,
    elevation:       8,
  },
  tabInactive: {
    borderRadius:    22,
    paddingVertical: 10,
    alignItems:      'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.10)',
  },
  tabTextActive: {
    color:      '#fff',
    fontSize:   13,
    fontWeight: '700',
  },
  tabTextInactive: {
    color:      D.textMid,
    fontSize:   13,
    fontWeight: '600',
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },

  // ── Section Header ─────────────────────────────────────────────────────────
  sectionHeader: { marginVertical: 12 },
  sectionPill: {
    flexDirection:   'row',
    alignItems:      'center',
    alignSelf:       'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius:    20,
    gap:             7,
  },
  sectionDot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: D.blueBright,
  },
  sectionText: {
    color:      D.blueBright,
    fontSize:   11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // ── Order Card ─────────────────────────────────────────────────────────────
  cardOuter: {
    borderRadius:    22,
    marginBottom:    14,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     D.bgCardBorder,
    backgroundColor: D.bgCard,
    // Glow via shadow
    shadowColor:     D.blue,
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.15,
    shadowRadius:    18,
    elevation:       8,
  },
  cardGlow: {
    position:       'absolute',
    bottom:          0,
    left:            20,
    right:           20,
    height:          40,
    shadowOffset:   { width: 0, height: 12 },
    shadowOpacity:  0.3,
    shadowRadius:   20,
  },
  cardStripe: {
    height: 3,
    width:  '100%',
  },
  cardContent: { padding: 18 },

  cardRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  cardDate: {
    fontSize:   11,
    color:      D.textMid,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  cardTypeIcon: { fontSize: 20 },

  cardDivider: {
    height:          1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical:  14,
  },

  // Route
  routeBox: { gap: 0 },
  routeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    paddingVertical: 4,
  },
  routeDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
    flexShrink:   0,
  },
  routeLine: {
    width:           1,
    height:          14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginLeft:      3.5,
    marginVertical:  2,
  },
  routeLabel: {
    width:      42,
    fontSize:   10,
    color:      D.textLow,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  routeValue: {
    flex:       1,
    fontSize:   13,
    color:      D.textHi,
    fontWeight: '600',
  },

  // Price
  cardPrice: {
    fontSize:   18,
    fontWeight: '800',
    color:      D.textHi,
    letterSpacing: -0.5,
  },

  // ── Status Badge ──────────────────────────────────────────────────────────
  badge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius:    20,
    borderWidth:     1,
  },
  badgeDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  badgeText: {
    fontSize:   12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Skeleton Card ─────────────────────────────────────────────────────────
  skeletonCard: {
    borderRadius:    22,
    marginBottom:    14,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.06)',
    height:          160,
  },
  skeletonInner: { padding: 20, paddingTop: 18, flex: 1 },

  // ── Empty State ───────────────────────────────────────────────────────────
  emptyBox: {
    alignItems:  'center',
    paddingTop:  80,
    gap:         14,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: {
    fontSize:   20,
    fontWeight: '800',
    color:      D.textHi,
    letterSpacing: -0.5,
  },
  emptyDesc: {
    fontSize:   13,
    color:      D.textMid,
    textAlign:  'center',
    lineHeight: 20,
    maxWidth:   260,
  },

  // ── Error Banner ──────────────────────────────────────────────────────────
  errorBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             10,
    backgroundColor: 'rgba(248,113,113,0.10)',
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     'rgba(248,113,113,0.25)',
    marginBottom:    16,
  },
  errorIcon:  { fontSize: 18 },
  errorText: {
    flex:       1,
    color:      D.danger,
    fontSize:   13,
    fontWeight: '500',
    lineHeight: 18,
  },
});