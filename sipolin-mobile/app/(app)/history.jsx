/**
 * app/(app)/history.jsx — SIPOLIN Order History Screen
 * ─────────────────────────────────────────────────────
 * Clean Flat Design · White + #f9fafb Background
 * Matching visual language with index.jsx (Dashboard)
 *
 * UI Features:
 * • Light, clean header dengan counter badge
 * • Pill tab filter: Semua · Selesai · Dibatalkan
 * • Date-grouped sections dengan divider label elegan
 * • Order cards dengan route, status badge, harga, & tombol "Pesan Lagi"
 * • Skeleton shimmer loading (tanpa library tambahan)
 * • Pull-to-refresh dengan RefreshControl
 * • FadeInDown stagger animasi per card (no .easing())
 * • Empty state illustration per tab
 * • Error banner
 *
 * ⚠ SEMUA LOGIKA API & STATE TIDAK DIUBAH ⚠
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
}                        from 'react-native';
import { SafeAreaView }  from 'react-native-safe-area-context';
import { useRouter }     from 'expo-router';
import * as Haptics      from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
}                        from 'react-native-reanimated';
import {
  Car,
  Package,
  ShoppingBag,
  ClipboardList,
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  CalendarDays,
  Inbox,
  AlertCircle,
  ArrowLeft,
}                        from 'lucide-react-native';
import { ordersAPI }     from '../../services/api';

const { width: W } = Dimensions.get('window');

// ─── Design Tokens (selaras dengan index.jsx) ────────────────────────────────
const C = {
  // Page & surface
  page:        '#f9fafb',
  white:       '#ffffff',
  surface:     '#f8fafc',
  border:      '#f1f5f9',
  borderMid:   '#e2e8f0',

  // Brand blue
  blue:        '#2563eb',
  blueDk:      '#1d4ed8',
  blueBg:      '#eff6ff',
  blueMid:     '#bfdbfe',
  blueLight:   '#dbeafe',

  // Semantics
  green:       '#059669',
  greenBg:     '#f0fdf4',
  greenBdr:    '#bbf7d0',

  red:         '#dc2626',
  redBg:       '#fef2f2',
  redBdr:      '#fecaca',

  amber:       '#d97706',
  amberBg:     '#fffbeb',

  // Typography
  ink:         '#0f172a',
  inkMid:      '#334155',
  muted:       '#94a3b8',
  faint:       '#cbd5e1',

  // Skeleton
  skelBase:    '#f1f5f9',
  skelShine:   '#e2e8f0',
};

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_MAP = {
  completed: {
    label:  'Selesai',
    color:  C.green,
    bg:     C.greenBg,
    border: C.greenBdr,
    Icon:   CheckCircle2,
  },
  cancelled: {
    label:  'Dibatalkan',
    color:  C.red,
    bg:     C.redBg,
    border: C.redBdr,
    Icon:   XCircle,
  },
  pending: {
    label:  'Menunggu',
    color:  C.amber,
    bg:     C.amberBg,
    border: '#fde68a',
    Icon:   Clock,
  },
  accepted: {
    label:  'Diproses',
    color:  C.blue,
    bg:     C.blueBg,
    border: C.blueMid,
    Icon:   Navigation,
  },
};

// ─── Order Type Icon Map ──────────────────────────────────────────────────────
const typeIcon = (type) => {
  if (!type) return { Icon: ClipboardList, color: C.muted,    bg: C.surface  };
  if (type.includes('ride') || type === 'pol_ride')
    return { Icon: Car,           color: C.blue,    bg: C.blueBg  };
  if (type.includes('send') || type === 'pol_send')
    return { Icon: Package,       color: C.green,   bg: C.greenBg };
  if (type.includes('food') || type.includes('jastip'))
    return { Icon: ShoppingBag,   color: C.amber,   bg: C.amberBg };
  return { Icon: ClipboardList,   color: C.muted,   bg: C.surface  };
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',       label: 'Semua'      },
  { key: 'completed', label: 'Selesai'    },
  { key: 'cancelled', label: 'Dibatalkan' },
];

// ─── Helpers (TIDAK DIUBAH) ───────────────────────────────────────────────────
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
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
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

// ── Shimmer skeleton bar ──────────────────────────────────────────────────────
const SkeletonBar = ({ width = '100%', height = 14, radius = 7, style }) => {
  const shine = useSharedValue(0);
  useEffect(() => {
    shine.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolate(shine.value, [0, 1], [0, 1]) > 0.5
      ? C.skelShine
      : C.skelBase,
    opacity: interpolate(shine.value, [0, 1], [0.7, 1]),
  }));
  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius }, animStyle, style]}
    />
  );
};

// ── Skeleton order card ───────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(350)} style={s.skeletonCard}>
    {/* Header strip */}
    <View style={s.skeletonHeader}>
      <SkeletonBar width={36} height={36} radius={12} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBar width="55%" height={13} />
        <SkeletonBar width="38%" height={10} />
      </View>
      <SkeletonBar width={60} height={22} radius={11} />
    </View>
    <View style={s.skeletonDivider} />
    <View style={{ gap: 10 }}>
      <SkeletonBar width="80%" height={11} />
      <SkeletonBar width="65%" height={11} />
    </View>
    <View style={s.skeletonDivider} />
    <View style={s.skeletonFooter}>
      <SkeletonBar width={90}  height={24} radius={12} />
      <SkeletonBar width={80}  height={32} radius={10} />
    </View>
  </Animated.View>
);

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.pending;
  const { Icon } = cfg;
  return (
    <View style={[s.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Icon size={11} color={cfg.color} strokeWidth={2.5} />
      <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

// ── Order card ────────────────────────────────────────────────────────────────
const OrderCard = ({ order, index, onPress, onReorder }) => {
  const { Icon: TypeIcon, color: typeColor, bg: typeBg } = typeIcon(order.type);
  const statusCfg = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
  const isFinished = order.status === 'completed' || order.status === 'cancelled';

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <TouchableOpacity
        onPress={() => onPress(order)}
        activeOpacity={0.75}
        style={s.card}
      >
        {/* ── Card header: icon + title + status ── */}
        <View style={s.cardHeader}>
          {/* Type icon */}
          <View style={[s.cardTypeIcon, { backgroundColor: typeBg }]}>
            <TypeIcon size={20} color={typeColor} strokeWidth={2} />
          </View>

          {/* Title + time */}
          <View style={s.cardTitleGroup}>
            <Text style={s.cardTitle} numberOfLines={1}>
              {order.title || 'Pesanan'}
            </Text>
            <View style={s.cardTimeMeta}>
              <Clock size={10} color={C.muted} strokeWidth={2} />
              <Text style={s.cardTime}>{formatDateTime(order.createdAt)}</Text>
            </View>
          </View>

          {/* Status badge — right-aligned */}
          <StatusBadge status={order.status} />
        </View>

        {/* ── Divider ── */}
        <View style={s.cardDivider} />

        {/* ── Route info ── */}
        <View style={s.routeBlock}>
          {/* Pickup */}
          <View style={s.routeRow}>
            <View style={s.routeIconWrap}>
              <View style={[s.routeDotFill, { backgroundColor: C.blue }]} />
            </View>
            <Text style={s.routeLabel}>Jemput</Text>
            <Text style={s.routeValue} numberOfLines={1}>
              {order.pickup || '—'}
            </Text>
          </View>

          {/* Connector */}
          <View style={s.routeConnector}>
            <View style={s.routeConnectorLine} />
          </View>

          {/* Destination */}
          <View style={s.routeRow}>
            <View style={s.routeIconWrap}>
              <MapPin size={10} color={statusCfg.color} strokeWidth={2.5} />
            </View>
            <Text style={s.routeLabel}>Tujuan</Text>
            <Text style={s.routeValue} numberOfLines={1}>
              {order.destination || '—'}
            </Text>
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={s.cardDivider} />

        {/* ── Footer: price + Pesan Lagi button ── */}
        <View style={s.cardFooter}>
          {/* Price */}
          <View>
            <Text style={s.priceLabel}>Total Bayar</Text>
            <Text style={s.priceValue}>{formatRp(order.price)}</Text>
          </View>

          {/* Pesan Lagi button — only for finished orders */}
          {isFinished && (
            <TouchableOpacity
              onPress={() => onReorder(order)}
              activeOpacity={0.8}
              style={s.reorderBtn}
            >
              <RotateCcw size={13} color={C.blue} strokeWidth={2.5} />
              <Text style={s.reorderBtnText}>Pesan Lagi</Text>
            </TouchableOpacity>
          )}

          {/* Chevron for active/pending orders */}
          {!isFinished && (
            <View style={s.detailBtn}>
              <Text style={s.detailBtnText}>Detail</Text>
              <ChevronRight size={13} color={C.blue} strokeWidth={2.5} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Section date header ───────────────────────────────────────────────────────
const SectionDateHeader = ({ title }) => (
  <Animated.View entering={FadeInDown.duration(300)} style={s.sectionHeader}>
    <CalendarDays size={13} color={C.blue} strokeWidth={2} />
    <Text style={s.sectionText}>{title}</Text>
    <View style={s.sectionLine} />
  </Animated.View>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ tab }) => {
  const configs = {
    all:       { emoji: Inbox,    title: 'Belum Ada Histori',       sub: 'Pesanan yang sudah selesai atau dibatalkan akan tampil di sini.' },
    completed: { emoji: Package,  title: 'Belum Ada Pesanan Selesai', sub: 'Pesanan yang telah selesai akan muncul di tab ini.' },
    cancelled: { emoji: XCircle,  title: 'Tidak Ada Yang Dibatalkan', sub: 'Pesanan yang dibatalkan akan ditampilkan di sini.' },
  };
  const cfg = configs[tab] ?? configs.all;
  const IconComp = cfg.emoji;

  return (
    <Animated.View entering={FadeInDown.delay(150).duration(450)} style={s.emptyBox}>
      <View style={s.emptyIconOuter}>
        <View style={s.emptyIconMid}>
          <IconComp size={28} color={C.blue} strokeWidth={1.6} />
        </View>
      </View>
      <Text style={s.emptyTitle}>{cfg.title}</Text>
      <Text style={s.emptyDesc}>{cfg.sub}</Text>
    </Animated.View>
  );
};

// ── Error banner ──────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }) => (
  <Animated.View entering={FadeInDown.duration(350)} style={s.errorBanner}>
    <AlertCircle size={16} color={C.red} strokeWidth={2} />
    <Text style={s.errorText}>{message}</Text>
  </Animated.View>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const router = useRouter();

  // ── STATE (TIDAK DIUBAH) ──────────────────────────────────────────────────
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');
  const [activeTab,  setActiveTab]  = useState('all');

  // ── Derived (TIDAK DIUBAH) ────────────────────────────────────────────────
  const filtered = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab);
  const grouped = groupByDate(filtered);

  // ── Fetch (TIDAK DIUBAH) ──────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const res = await ordersAPI.getHistory();
      const data = res.data;
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

  // ── Tab change (TIDAK DIUBAH) ─────────────────────────────────────────────
  const handleTab = (key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(key);
  };

  // ── Navigate to detail (TIDAK DIUBAH) ────────────────────────────────────
  const handleCardPress = (order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/orders/${order.id}`);
  };

  // ── Pesan Lagi ────────────────────────────────────────────────────────────
  const handleReorder = (order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/orders/create');
  };

  // ── Count per tab ─────────────────────────────────────────────────────────
  const countForTab = (key) => {
    if (key === 'all') return orders.length;
    return orders.filter((o) => o.status === key).length;
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.duration(400)} style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerSub}>SIPOLIN · Polindra</Text>
          <Text style={s.headerTitle}>Riwayat Pesanan</Text>
        </View>

        {/* Order count badge */}
        <View style={s.headerBadge}>
          <CalendarDays size={13} color={C.blue} strokeWidth={2.5} />
          <Text style={s.headerBadgeText}>{orders.length} pesanan</Text>
        </View>
      </Animated.View>

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(80).duration(380)} style={s.tabRow}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          const count  = countForTab(tab.key);
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTab(tab.key)}
              activeOpacity={0.75}
              style={[s.tabItem, active && s.tabItemActive]}
            >
              <Text style={[s.tabText, active && s.tabTextActive]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[s.tabCount, active && s.tabCountActive]}>
                  <Text style={[s.tabCountText, active && s.tabCountTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* ── Scroll body ─────────────────────────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.blue}
            colors={[C.blue]}
          />
        }
      >
        {/* Skeleton loading */}
        {loading && [0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} delay={i * 70} />
        ))}

        {/* Error banner */}
        {!loading && !!error && <ErrorBanner message={error} />}

        {/* Empty state */}
        {!loading && !error && grouped.length === 0 && (
          <EmptyState tab={activeTab} />
        )}

        {/* Grouped order list */}
        {!loading && !error && grouped.map(({ date, orders: dayOrders }) => (
          <View key={date}>
            <SectionDateHeader title={date} />
            {dayOrders.map((order, idx) => (
              <OrderCard
                key={order.id}
                order={order}
                index={idx}
                onPress={handleCardPress}
                onReorder={handleReorder}
              />
            ))}
          </View>
        ))}

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: C.page,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    backgroundColor:   C.white,
    paddingHorizontal: 20,
    paddingTop:        Platform.OS === 'android' ? 10 : 4,
    paddingBottom:     18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    shadowColor:       '#0f172a',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.04,
    shadowRadius:      8,
    elevation:         3,
  },
  headerLeft: { gap: 3 },
  headerSub: {
    fontSize:      11,
    color:         C.muted,
    fontWeight:    '700',
    letterSpacing: 1.0,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize:      24,
    fontWeight:    '900',
    color:         '#0f172a',
    letterSpacing: -0.6,
  },
  headerBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    backgroundColor:   C.blueBg,
    paddingHorizontal: 12,
    paddingVertical:   8,
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       C.blueMid,
  },
  headerBadgeText: {
    fontSize:   12,
    fontWeight: '700',
    color:      C.blue,
  },

  // ── Tab Bar ──────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection:     'row',
    backgroundColor:   C.white,
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap:               8,
  },
  tabItem: {
    flex:              1,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               6,
    paddingVertical:   9,
    borderRadius:      22,
    backgroundColor:   C.surface,
    borderWidth:       1,
    borderColor:       C.border,
  },
  tabItemActive: {
    backgroundColor: C.blue,
    borderColor:     C.blue,
    shadowColor:     C.blue,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.28,
    shadowRadius:    10,
    elevation:       6,
  },
  tabText: {
    fontSize:   12.5,
    fontWeight: '700',
    color:      C.muted,
    letterSpacing: 0.1,
  },
  tabTextActive: {
    color: C.white,
  },
  tabCount: {
    minWidth:          18,
    height:            18,
    borderRadius:      9,
    backgroundColor:   C.blueBg,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 4,
  },
  tabCountActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabCountText: {
    fontSize:   10,
    fontWeight: '800',
    color:      C.blue,
  },
  tabCountTextActive: {
    color: C.white,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scroll:        { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     32,
  },

  // ── Section date header ───────────────────────────────────────────────────
  sectionHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
    marginBottom:   12,
    marginTop:      4,
  },
  sectionText: {
    fontSize:      11,
    fontWeight:    '800',
    color:         C.blue,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flexShrink:    0,
  },
  sectionLine: {
    flex:            1,
    height:          1,
    backgroundColor: C.blueLight,
  },

  // ── Order Card ────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.white,
    borderRadius:    18,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     C.border,
    shadowColor:     '#0f172a',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.05,
    shadowRadius:    10,
    elevation:       3,
    overflow:        'hidden',
  },
  cardHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    padding:        16,
    paddingBottom:  14,
  },
  cardTypeIcon: {
    width:         44,
    height:        44,
    borderRadius:  14,
    alignItems:    'center',
    justifyContent:'center',
    flexShrink:    0,
  },
  cardTitleGroup: {
    flex: 1,
    gap:  4,
  },
  cardTitle: {
    fontSize:      14,
    fontWeight:    '800',
    color:         '#0f172a',
    letterSpacing: -0.2,
  },
  cardTimeMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  cardTime: {
    fontSize:   11.5,
    color:      C.muted,
    fontWeight: '500',
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  cardDivider: {
    height:          1,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },

  // ── Route block ───────────────────────────────────────────────────────────
  routeBlock: {
    paddingHorizontal: 16,
    paddingVertical:   14,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  routeIconWrap: {
    width:         16,
    alignItems:    'center',
    flexShrink:    0,
  },
  routeDotFill: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  routeConnector: {
    paddingLeft:   7,
    paddingVertical: 3,
  },
  routeConnectorLine: {
    width:           1.5,
    height:          14,
    backgroundColor: C.blueMid,
  },
  routeLabel: {
    width:         42,
    fontSize:      10,
    fontWeight:    '700',
    color:         C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flexShrink:    0,
  },
  routeValue: {
    flex:       1,
    fontSize:   13,
    fontWeight: '600',
    color:      '#334155',
  },

  // ── Card footer ───────────────────────────────────────────────────────────
  cardFooter: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    padding:           16,
    paddingTop:        14,
  },
  priceLabel: {
    fontSize:   10,
    fontWeight: '600',
    color:      C.muted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  priceValue: {
    fontSize:      18,
    fontWeight:    '900',
    color:         '#0f172a',
    letterSpacing: -0.5,
  },

  // "Pesan Lagi" button
  reorderBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    backgroundColor:   C.blueBg,
    paddingHorizontal: 16,
    paddingVertical:   10,
    borderRadius:      12,
    borderWidth:       1,
    borderColor:       C.blueMid,
  },
  reorderBtnText: {
    fontSize:   13,
    fontWeight: '800',
    color:      C.blue,
    letterSpacing: 0.1,
  },

  // "Detail" link for active orders
  detailBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           2,
  },
  detailBtnText: {
    fontSize:   13,
    fontWeight: '700',
    color:      C.blue,
  },

  // ── Status Badge ──────────────────────────────────────────────────────────
  badge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    paddingHorizontal: 9,
    paddingVertical:   5,
    borderRadius:      20,
    borderWidth:       1,
    flexShrink:        0,
  },
  badgeText: {
    fontSize:   11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Skeleton Card ─────────────────────────────────────────────────────────
  skeletonCard: {
    backgroundColor: C.white,
    borderRadius:    18,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     C.border,
    padding:         16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    marginBottom:  14,
  },
  skeletonDivider: {
    height:          1,
    backgroundColor: C.border,
    marginVertical:  14,
  },
  skeletonFooter: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },

  // ── Empty State ───────────────────────────────────────────────────────────
  emptyBox: {
    alignItems:  'center',
    paddingTop:  60,
    paddingBottom: 20,
    gap:         14,
  },
  emptyIconOuter: {
    width:           96,
    height:          96,
    borderRadius:    48,
    backgroundColor: C.blueBg,
    alignItems:      'center',
    justifyContent:  'center',
  },
  emptyIconMid: {
    width:           64,
    height:          64,
    borderRadius:    32,
    backgroundColor: C.blueLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  emptyTitle: {
    fontSize:      18,
    fontWeight:    '800',
    color:         '#0f172a',
    letterSpacing: -0.4,
  },
  emptyDesc: {
    fontSize:   13,
    color:      C.muted,
    textAlign:  'center',
    lineHeight: 20,
    maxWidth:   260,
  },

  // ── Error Banner ──────────────────────────────────────────────────────────
  errorBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             10,
    backgroundColor: '#fef2f2',
    borderRadius:    14,
    padding:         14,
    borderWidth:     1,
    borderColor:     '#fecaca',
    marginBottom:    14,
  },
  errorText: {
    flex:       1,
    color:      C.red,
    fontSize:   13,
    fontWeight: '500',
    lineHeight: 18,
  },
});