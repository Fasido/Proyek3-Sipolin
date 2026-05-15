/**
 * app/(app)/history.jsx — SIPOLIN Order History Screen
 * Clean, robust, and safe for pending / accepted / completed / cancelled orders.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";
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
  Search,
  Truck,
} from "lucide-react-native";

import { ordersAPI } from "../../services/api";

// ─── Design Tokens Sipolin ───────────────────────────────────────────────────
const C = {
  page: "#F8FAFC",
  white: "#FFFFFF",
  surface: "#F1F5F9",
  border: "#E2E8F0",
  borderSoft: "#F1F5F9",

  emerald: "#10B981",
  emeraldDark: "#059669",
  emeraldBg: "#ECFDF5",
  emeraldBorder: "#A7F3D0",

  blue: "#2563EB",
  blueBg: "#EFF6FF",
  blueBorder: "#BFDBFE",

  red: "#DC2626",
  redBg: "#FEF2F2",
  redBorder: "#FECACA",

  amber: "#D97706",
  amberBg: "#FFFBEB",
  amberBorder: "#FDE68A",

  purple: "#7C3AED",
  purpleBg: "#F5F3FF",
  purpleBorder: "#DDD6FE",

  ink: "#0F172A",
  inkMid: "#334155",
  muted: "#94A3B8",
  faint: "#CBD5E1",

  skelBase: "#F1F5F9",
  skelShine: "#E2E8F0",
};

// ─── Status Config ───────────────────────────────────────────────────────────
const STATUS_MAP = {
  pending: {
    label: "Menunggu",
    color: C.amber,
    bg: C.amberBg,
    border: C.amberBorder,
    Icon: Clock,
  },
  accepted: {
    label: "Diproses",
    color: C.blue,
    bg: C.blueBg,
    border: C.blueBorder,
    Icon: Navigation,
  },
  arrived: {
    label: "Driver Tiba",
    color: C.purple,
    bg: C.purpleBg,
    border: C.purpleBorder,
    Icon: MapPin,
  },
  picked_up: {
    label: "Diambil",
    color: C.purple,
    bg: C.purpleBg,
    border: C.purpleBorder,
    Icon: Package,
  },
  on_the_way: {
    label: "Dalam Jalan",
    color: C.blue,
    bg: C.blueBg,
    border: C.blueBorder,
    Icon: Truck,
  },
  completed: {
    label: "Selesai",
    color: C.emeraldDark,
    bg: C.emeraldBg,
    border: C.emeraldBorder,
    Icon: CheckCircle2,
  },
  cancelled: {
    label: "Dibatalkan",
    color: C.red,
    bg: C.redBg,
    border: C.redBorder,
    Icon: XCircle,
  },
};

const TABS = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "accepted", label: "Diproses" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Batal" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const safeLower = (value) => String(value || "").toLowerCase();

const formatRp = (value) => {
  const number = Number(value || 0);
  return "Rp " + number.toLocaleString("id-ID");
};

const formatDateTime = (iso) => {
  if (!iso) return "-";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDateOnly = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

const dateLabel = (iso) => {
  if (!iso) return "Tanggal tidak diketahui";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "Tanggal tidak diketahui";

  const now = new Date();
  const diff = getDateOnly(now) - getDateOnly(date);

  if (diff === 0) return "Hari ini";
  if (diff === 86400000) return "Kemarin";

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const normalizeOrder = (raw) => {
  if (!raw) return null;

  const status = safeLower(raw.status || "pending");
  const type = safeLower(raw.type || raw.orderType || "order");

  return {
    ...raw,
    id: raw.id,
    type,
    status,
    title:
      raw.title ||
      (type === "pol_ride"
        ? "Pol-Ride"
        : type === "pol_send"
        ? "Pol-Send"
        : "Pesanan"),
    pickup:
      raw.pickup ||
      raw.pickupLocation ||
      raw.pickupAddress ||
      raw.restaurantName ||
      "-",
    destination:
      raw.destination ||
      raw.dropoffLocation ||
      raw.dropoffAddress ||
      raw.to ||
      "-",
    price: raw.price || raw.totalPrice || raw.estimatedPrice || 0,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
  };
};

const extractOrders = (payload) => {
  const possible =
    Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.orders)
      ? payload.orders
      : Array.isArray(payload?.data?.orders)
      ? payload.data.orders
      : [];

  return possible
    .map(normalizeOrder)
    .filter((order) => order && order.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

const typeIcon = (type) => {
  const safeType = safeLower(type);

  if (safeType.includes("ride") || safeType === "pol_ride") {
    return {
      Icon: Car,
      color: C.blue,
      bg: C.blueBg,
      border: C.blueBorder,
    };
  }

  if (safeType.includes("send") || safeType === "pol_send") {
    return {
      Icon: Package,
      color: C.emeraldDark,
      bg: C.emeraldBg,
      border: C.emeraldBorder,
    };
  }

  if (safeType.includes("food") || safeType.includes("jastip")) {
    return {
      Icon: ShoppingBag,
      color: C.amber,
      bg: C.amberBg,
      border: C.amberBorder,
    };
  }

  return {
    Icon: ClipboardList,
    color: C.muted,
    bg: C.surface,
    border: C.border,
  };
};

const statusGroup = (status) => {
  const value = safeLower(status);

  if (["accepted", "arrived", "picked_up", "on_the_way"].includes(value)) {
    return "accepted";
  }

  return value;
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
const SkeletonBar = ({ width = "100%", height = 14, radius = 7, style }) => {
  const shine = useSharedValue(0);

  useEffect(() => {
    shine.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [shine]);

  const animStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        shine.value,
        [0, 1],
        [C.skelBase, C.skelShine]
      ),
      opacity: interpolate(shine.value, [0, 1], [0.7, 1]),
    };
  });

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius }, animStyle, style]}
    />
  );
};

const SkeletonCard = ({ delay = 0 }) => (
  <Animated.View
    entering={FadeInDown.delay(delay).duration(350)}
    style={s.skeletonCard}
  >
    <View style={s.skeletonHeader}>
      <SkeletonBar width={42} height={42} radius={14} />

      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBar width="60%" height={13} />
        <SkeletonBar width="42%" height={10} />
      </View>

      <SkeletonBar width={72} height={24} radius={12} />
    </View>

    <View style={s.skeletonDivider} />

    <View style={{ gap: 10 }}>
      <SkeletonBar width="85%" height={11} />
      <SkeletonBar width="70%" height={11} />
    </View>

    <View style={s.skeletonDivider} />

    <View style={s.skeletonFooter}>
      <SkeletonBar width={95} height={28} radius={12} />
      <SkeletonBar width={82} height={32} radius={10} />
    </View>
  </Animated.View>
);

// ─── Components ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[safeLower(status)] || STATUS_MAP.pending;
  const Icon = cfg.Icon;

  return (
    <View
      style={[
        s.badge,
        {
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
        },
      ]}
    >
      <Icon size={11} color={cfg.color} strokeWidth={2.6} />
      <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const OrderCard = ({ order, index, onPress, onReorder }) => {
  const { Icon: TypeIcon, color: typeColor, bg: typeBg, border } = typeIcon(
    order.type
  );

  const cfg = STATUS_MAP[safeLower(order.status)] || STATUS_MAP.pending;
  const isFinished =
    safeLower(order.status) === "completed" ||
    safeLower(order.status) === "cancelled";

  return (
    <Animated.View entering={FadeInDown.delay(index * 55).duration(360)}>
      <TouchableOpacity
        onPress={() => onPress(order)}
        activeOpacity={0.78}
        style={s.card}
      >
        <View style={s.cardHeader}>
          <View
            style={[
              s.cardTypeIcon,
              {
                backgroundColor: typeBg,
                borderColor: border,
              },
            ]}
          >
            <TypeIcon size={21} color={typeColor} strokeWidth={2.2} />
          </View>

          <View style={s.cardTitleGroup}>
            <Text style={s.cardTitle} numberOfLines={1}>
              {order.title}
            </Text>

            <View style={s.cardTimeMeta}>
              <Clock size={11} color={C.muted} strokeWidth={2} />
              <Text style={s.cardTime}>{formatDateTime(order.createdAt)}</Text>
            </View>
          </View>

          <StatusBadge status={order.status} />
        </View>

        <View style={s.cardDivider} />

        <View style={s.routeBlock}>
          <View style={s.routeRow}>
            <View style={s.routeIconWrap}>
              <View style={[s.routeDotFill, { backgroundColor: C.emerald }]} />
            </View>

            <Text style={s.routeLabel}>Jemput</Text>

            <Text style={s.routeValue} numberOfLines={1}>
              {order.pickup || "—"}
            </Text>
          </View>

          <View style={s.routeConnector}>
            <View style={s.routeConnectorLine} />
          </View>

          <View style={s.routeRow}>
            <View style={s.routeIconWrap}>
              <MapPin size={12} color={cfg.color} strokeWidth={2.6} />
            </View>

            <Text style={s.routeLabel}>Tujuan</Text>

            <Text style={s.routeValue} numberOfLines={1}>
              {order.destination || "—"}
            </Text>
          </View>
        </View>

        <View style={s.cardDivider} />

        <View style={s.cardFooter}>
          <View>
            <Text style={s.priceLabel}>Total Estimasi</Text>
            <Text style={s.priceValue}>{formatRp(order.price)}</Text>
          </View>

          {isFinished ? (
            <TouchableOpacity
              onPress={() => onReorder(order)}
              activeOpacity={0.82}
              style={s.reorderBtn}
            >
              <RotateCcw size={13} color={C.emeraldDark} strokeWidth={2.6} />
              <Text style={s.reorderBtnText}>Pesan Lagi</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.detailBtn}>
              <Text style={s.detailBtnText}>Detail</Text>
              <ChevronRight size={14} color={C.emeraldDark} strokeWidth={2.6} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SectionDateHeader = ({ title }) => (
  <Animated.View entering={FadeInDown.duration(300)} style={s.sectionHeader}>
    <CalendarDays size={14} color={C.emeraldDark} strokeWidth={2.2} />
    <Text style={s.sectionText}>{title}</Text>
    <View style={s.sectionLine} />
  </Animated.View>
);

const EmptyState = ({ tab }) => {
  const configs = {
    all: {
      Icon: Inbox,
      title: "Belum Ada Pesanan",
      sub: "Pesanan Pol-Ride dan Pol-Send yang berhasil dibuat akan tampil di sini.",
    },
    pending: {
      Icon: Search,
      title: "Belum Ada Pesanan Menunggu",
      sub: "Pesanan yang sedang mencari driver akan tampil di sini.",
    },
    accepted: {
      Icon: Navigation,
      title: "Belum Ada Pesanan Diproses",
      sub: "Pesanan yang sudah diterima driver akan tampil di sini.",
    },
    completed: {
      Icon: CheckCircle2,
      title: "Belum Ada Pesanan Selesai",
      sub: "Pesanan yang sudah selesai akan muncul di tab ini.",
    },
    cancelled: {
      Icon: XCircle,
      title: "Tidak Ada Yang Dibatalkan",
      sub: "Pesanan yang dibatalkan akan ditampilkan di sini.",
    },
  };

  const cfg = configs[tab] || configs.all;
  const Icon = cfg.Icon;

  return (
    <Animated.View
      entering={FadeInDown.delay(140).duration(420)}
      style={s.emptyBox}
    >
      <View style={s.emptyIconOuter}>
        <View style={s.emptyIconMid}>
          <Icon size={30} color={C.emeraldDark} strokeWidth={1.8} />
        </View>
      </View>

      <Text style={s.emptyTitle}>{cfg.title}</Text>
      <Text style={s.emptyDesc}>{cfg.sub}</Text>
    </Animated.View>
  );
};

const ErrorBanner = ({ message, onRetry }) => (
  <Animated.View entering={FadeInDown.duration(350)} style={s.errorBanner}>
    <AlertCircle size={18} color={C.red} strokeWidth={2.4} />

    <View style={{ flex: 1 }}>
      <Text style={s.errorText}>{message}</Text>

      <TouchableOpacity onPress={onRetry} activeOpacity={0.75}>
        <Text style={s.retryText}>Coba lagi</Text>
      </TouchableOpacity>
    </View>
  </Animated.View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? orders
      : orders.filter((order) => statusGroup(order.status) === activeTab);

  const grouped = groupByDate(filtered);

  const fetchHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const res = await ordersAPI.getHistory();
      const payload = res?.data;
      const list = extractOrders(payload);

      console.log("[History] orders loaded:", list.length, list);

      setOrders(list);
      setError("");
    } catch (err) {
      console.error("[History] fetch error:", err?.response?.data || err);

      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memuat riwayat pesanan.";

      if (
        String(message).toLowerCase().includes("token") ||
        err?.response?.status === 401
      ) {
        setError("Sesi login tidak ditemukan atau sudah habis. Silakan login ulang.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory({ silent: true });
    }, [fetchHistory])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory({ silent: true });
  }, [fetchHistory]);

  const handleTab = (key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(key);
  };

  const handleCardPress = (order) => {
    if (!order?.id) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    router.push({
      pathname: "/orders/[id]/track",
      params: { id: String(order.id) },
    });
  };

  const handleReorder = (order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    if (safeLower(order?.type) === "pol_send") {
      router.push("/orders/create/pol_send");
      return;
    }

    router.push("/orders/create/pol_ride");
  };

  const countForTab = (key) => {
    if (key === "all") return orders.length;
    return orders.filter((order) => statusGroup(order.status) === key).length;
  };

  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <Animated.View entering={FadeInUp.duration(380)} style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerSub}>SIPOLIN · POLINDRA</Text>
          <Text style={s.headerTitle}>Riwayat Pesanan</Text>
        </View>

        <View style={s.headerBadge}>
          <CalendarDays size={14} color={C.emeraldDark} strokeWidth={2.6} />
          <Text style={s.headerBadgeText}>{orders.length} pesanan</Text>
        </View>
      </Animated.View>

      <View style={s.tabOuter}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabRow}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            const count = countForTab(tab.key);

            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTab(tab.key)}
                activeOpacity={0.78}
                style={[s.tabItem, active && s.tabItemActive]}
              >
                <Text style={[s.tabText, active && s.tabTextActive]}>
                  {tab.label}
                </Text>

                {count > 0 && (
                  <View style={[s.tabCount, active && s.tabCountActive]}>
                    <Text
                      style={[
                        s.tabCountText,
                        active && s.tabCountTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.emerald}
            colors={[C.emerald]}
          />
        }
      >
        {loading &&
          [0, 1, 2, 3].map((item) => (
            <SkeletonCard key={item} delay={item * 70} />
          ))}

        {!loading && !!error && (
          <ErrorBanner
            message={error}
            onRetry={() => fetchHistory({ silent: false })}
          />
        )}

        {!loading && !error && grouped.length === 0 && (
          <EmptyState tab={activeTab} />
        )}

        {!loading &&
          !error &&
          grouped.map(({ date, orders: dayOrders }) => (
            <View key={date}>
              <SectionDateHeader title={date} />

              {dayOrders.map((order, index) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  index={index}
                  onPress={handleCardPress}
                  onReorder={handleReorder}
                />
              ))}
            </View>
          ))}

        <View style={{ height: 56 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.page,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.white,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 10 : 4,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  headerSub: {
    fontSize: 11,
    color: C.muted,
    fontWeight: "800",
    letterSpacing: 1,
  },
  headerTitle: {
    marginTop: 3,
    fontSize: 24,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.6,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.emeraldBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.emeraldBorder,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: C.emeraldDark,
  },

  tabOuter: {
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
  },
  tabRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.borderSoft,
    minWidth: 92,
  },
  tabItemActive: {
    backgroundColor: C.emerald,
    borderColor: C.emerald,
    shadowColor: C.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 5,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.1,
  },
  tabTextActive: {
    color: C.white,
  },
  tabCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.emeraldBg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabCountActive: {
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: "900",
    color: C.emeraldDark,
  },
  tabCountTextActive: {
    color: C.white,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.emeraldDark,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    flexShrink: 0,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.emeraldBorder,
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.borderSoft,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    paddingBottom: 14,
  },
  cardTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 1,
  },
  cardTitleGroup: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.2,
  },
  cardTimeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardTime: {
    fontSize: 11.5,
    color: C.muted,
    fontWeight: "600",
  },
  cardDivider: {
    height: 1,
    backgroundColor: C.borderSoft,
    marginHorizontal: 16,
  },

  routeBlock: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  routeIconWrap: {
    width: 16,
    alignItems: "center",
    flexShrink: 0,
  },
  routeDotFill: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeConnector: {
    paddingLeft: 7,
    paddingVertical: 3,
  },
  routeConnectorLine: {
    width: 1.5,
    height: 14,
    backgroundColor: C.emeraldBorder,
  },
  routeLabel: {
    width: 44,
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    flexShrink: 0,
  },
  routeValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: C.inkMid,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 14,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.5,
  },

  reorderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.emeraldBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.emeraldBorder,
  },
  reorderBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: C.emeraldDark,
    letterSpacing: 0.1,
  },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: C.emeraldDark,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  skeletonCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.borderSoft,
    padding: 16,
  },
  skeletonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  skeletonDivider: {
    height: 1,
    backgroundColor: C.borderSoft,
    marginVertical: 14,
  },
  skeletonFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  emptyBox: {
    alignItems: "center",
    paddingTop: 62,
    paddingBottom: 20,
    gap: 14,
  },
  emptyIconOuter: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: C.emeraldBg,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconMid: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.emeraldBorder,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.4,
  },
  emptyDesc: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
    fontWeight: "600",
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: C.redBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.redBorder,
    marginBottom: 14,
  },
  errorText: {
    color: C.red,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  retryText: {
    marginTop: 6,
    color: C.red,
    fontSize: 13,
    fontWeight: "900",
  },
});