import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, ordersAPI } from '../../services/api';
import {
  Car,
  ShoppingBag,
  Bell,
  ChevronRight,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  Package,
  RefreshCw,
  ThumbsUp,
  XCircle,
  Loader,
} from 'lucide-react-native';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const formatTimeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
};

// ─── Design Tokens ────────────────────────────────────────────────────────────

const BLUE      = '#2563eb';
const BLUE_DARK = '#1d4ed8';
const BLUE_BG   = '#eff6ff';
const BLUE_MID  = '#bfdbfe';
const INK       = '#0f172a';
const INK_MID   = '#334155';
const MUTED     = '#94a3b8';
const BORDER    = '#f1f5f9';
const WHITE     = '#ffffff';
const GREEN     = '#059669';
const AMBER     = '#d97706';
const RED       = '#dc2626';

// ─── Animated Service Card ────────────────────────────────────────────────────

const ServiceCard = ({ icon: Icon, title, subtitle, color, bgColor, onPress, style }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const shadow = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: false, speed: 40, bounciness: 0 }),
      Animated.timing(shadow, { toValue: 1, duration: 100, useNativeDriver: false }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: false, speed: 30, bounciness: 6 }),
      Animated.timing(shadow, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const shadowElevation = shadow.interpolate({ inputRange: [0, 1], outputRange: [8, 16] });
  const shadowOpacity   = shadow.interpolate({ inputRange: [0, 1], outputRange: [0.07, 0.16] });

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} style={{ flex: 1 }}>
      <Animated.View
        style={[
          {
            backgroundColor: WHITE,
            borderRadius: 20,
            padding: 20,
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity,
            shadowRadius: shadowElevation,
            elevation: 8,
            transform: [{ scale }],
          },
          style,
        ]}
      >
        {/* Icon pill */}
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            backgroundColor: bgColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Icon size={26} color={color} strokeWidth={2} />
        </View>

        <Text style={{ fontSize: 18, fontWeight: '800', color: INK, letterSpacing: -0.5, marginBottom: 4 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 12.5, color: MUTED, lineHeight: 18, fontWeight: '500' }}>
          {subtitle}
        </Text>

        {/* Arrow */}
        <View style={{ marginTop: 20, alignSelf: 'flex-start' }}>
          <ChevronRight size={16} color={color} strokeWidth={2.5} />
        </View>
      </Animated.View>
    </Pressable>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    pending:   { label: 'Menunggu', color: AMBER, bg: '#fffbeb' },
    accepted:  { label: 'Diproses', color: BLUE,  bg: BLUE_BG   },
    completed: { label: 'Selesai',  color: GREEN, bg: '#ecfdf5'  },
    cancelled: { label: 'Dibatal',  color: RED,   bg: '#fef2f2'  },
  };
  const s = map[status] ?? map.pending;
  return (
    <View style={{ backgroundColor: s.bg, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ color: s.color, fontSize: 11, fontWeight: '700', letterSpacing: 0.2 }}>
        {s.label}
      </Text>
    </View>
  );
};

// ─── Order Row (Customer) ─────────────────────────────────────────────────────

const OrderRow = ({ order, onPress, isLast }) => {
  const isRide = order.type === 'TEBENGAN';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: BORDER,
      }}
    >
      {/* Type icon */}
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          backgroundColor: isRide ? BLUE_BG : '#f0fdf4',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        {isRide
          ? <Car size={20} color={BLUE} strokeWidth={2} />
          : <ShoppingBag size={20} color={GREEN} strokeWidth={2} />}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: INK, marginBottom: 3 }} numberOfLines={1}>
          {order.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Clock size={11} color={MUTED} strokeWidth={2} style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 12, color: MUTED, fontWeight: '500' }}>
            {formatTimeAgo(order.createdAt)}
          </Text>
          <Text style={{ color: BORDER, marginHorizontal: 6, fontSize: 12 }}>•</Text>
          <Text style={{ fontSize: 12, color: BLUE, fontWeight: '700' }}>
            {formatIDR(order.price)}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <StatusBadge status={order.status} />
        <ChevronRight size={14} color={MUTED} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
};

// ─── Driver Order Card ────────────────────────────────────────────────────────

const DriverOrderCard = ({ order, onAccept, onComplete, loading, isLast }) => {
  const isAccepted = order.status === 'accepted';
  return (
    <View
      style={{
        backgroundColor: WHITE,
        borderRadius: 18,
        marginBottom: isLast ? 0 : 14,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
      }}
    >
      {/* Header stripe */}
      <View
        style={{
          backgroundColor: isAccepted ? BLUE_BG : '#f8fafc',
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: BORDER,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: isAccepted ? BLUE : AMBER, marginRight: 8 }} />
          <Text style={{ fontSize: 11, fontWeight: '800', color: isAccepted ? BLUE : AMBER, letterSpacing: 0.8 }}>
            {order.type?.toUpperCase() ?? 'ORDER'}
          </Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '900', color: INK }}>
          {formatIDR(order.price)}
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        {/* Title */}
        <Text style={{ fontSize: 15, fontWeight: '800', color: INK, marginBottom: 14 }} numberOfLines={1}>
          {order.title}
        </Text>

        {/* Route */}
        <View style={{ flexDirection: 'row', marginBottom: 18 }}>
          <View style={{ alignItems: 'center', marginRight: 14 }}>
            <Circle size={10} color={BLUE} fill={BLUE} strokeWidth={0} />
            <View style={{ width: 1.5, height: 28, backgroundColor: BLUE_MID, marginVertical: 4 }} />
            <MapPin size={12} color={RED} strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1, justifyContent: 'space-between', height: 54 }}>
            <Text style={{ fontSize: 13, color: INK_MID, fontWeight: '600' }} numberOfLines={1}>
              {order.pickup || '—'}
            </Text>
            <Text style={{ fontSize: 13, color: INK_MID, fontWeight: '600' }} numberOfLines={1}>
              {order.destination || '—'}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => isAccepted ? onComplete(order.id) : onAccept(order.id)}
          disabled={!!loading}
          activeOpacity={0.85}
          style={{
            backgroundColor: isAccepted ? GREEN : BLUE,
            borderRadius: 13,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={WHITE} />
          ) : isAccepted ? (
            <>
              <CheckCircle2 size={16} color={WHITE} strokeWidth={2.5} style={{ marginRight: 8 }} />
              <Text style={{ color: WHITE, fontSize: 14, fontWeight: '800' }}>Selesaikan</Text>
            </>
          ) : (
            <>
              <ThumbsUp size={16} color={WHITE} strokeWidth={2.5} style={{ marginRight: 8 }} />
              <Text style={{ color: WHITE, fontSize: 14, fontWeight: '800' }}>Ambil Order</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({ name, size = 44 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: BLUE,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: BLUE,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 8,
    }}
  >
    <Text style={{ color: WHITE, fontSize: size * 0.36, fontWeight: '800', letterSpacing: -0.5 }}>
      {getInitials(name)}
    </Text>
  </View>
);

// ─── Stat Pill ────────────────────────────────────────────────────────────────

const StatPill = ({ label, value, color = INK }) => (
  <View style={{ alignItems: 'center', flex: 1 }}>
    <Text style={{ fontSize: 26, fontWeight: '900', color, letterSpacing: -1, lineHeight: 30 }}>
      {value ?? 0}
    </Text>
    <Text style={{ fontSize: 11, color: MUTED, fontWeight: '600', marginTop: 4, letterSpacing: 0.2 }}>
      {label}
    </Text>
  </View>
);

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, action, onAction }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <Text style={{ fontSize: 18, fontWeight: '800', color: INK, letterSpacing: -0.4 }}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7}
        style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: BLUE, marginRight: 2 }}>{action}</Text>
        <ChevronRight size={14} color={BLUE} strokeWidth={2.5} />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <View style={{ alignItems: 'center', paddingVertical: 32 }}>
    <View style={{
      width: 60, height: 60, borderRadius: 18, backgroundColor: BLUE_BG,
      alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    }}>
      <Icon size={26} color={BLUE} strokeWidth={1.8} />
    </View>
    <Text style={{ fontSize: 15, fontWeight: '700', color: INK, marginBottom: 6 }}>{title}</Text>
    <Text style={{ fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 20, maxWidth: 240 }}>{subtitle}</Text>
  </View>
);

// ─── Loading Screen ───────────────────────────────────────────────────────────

const LoadingScreen = ({ message }) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' }}>
    <StatusBar barStyle="dark-content" />
    <View style={{
      width: 64, height: 64, borderRadius: 20, backgroundColor: BLUE,
      alignItems: 'center', justifyContent: 'center', marginBottom: 20,
      shadowColor: BLUE, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
    }}>
      <ActivityIndicator size="large" color={WHITE} />
    </View>
    <Text style={{ fontSize: 16, fontWeight: '700', color: INK }}>{message}</Text>
    <Text style={{ fontSize: 12, color: MUTED, marginTop: 6, letterSpacing: 0.5 }}>SIPOLIN • Polindra</Text>
  </SafeAreaView>
);

// ─── Customer Dashboard ───────────────────────────────────────────────────────

const CustomerDashboard = ({ user, stats, orders, refreshing, onRefresh, router }) => {
  const firstName = user?.name?.split(' ')[0] ?? 'Kamu';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={BLUE}
          colors={[BLUE]}
        />
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* ── Header ── */}
      <View style={{ backgroundColor: WHITE, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28 }}>
        {/* Top bar */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={{ fontSize: 13, color: MUTED, fontWeight: '600', marginBottom: 4 }}>
              {getGreeting()},
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: INK, letterSpacing: -0.8, lineHeight: 30 }}>
              {firstName} 👋
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Notif bell */}
            <TouchableOpacity
              onPress={() => router.push('/(app)/notifications')}
              activeOpacity={0.7}
              style={{
                width: 40, height: 40, borderRadius: 13,
                backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: BORDER,
              }}
            >
              <Bell size={18} color={INK_MID} strokeWidth={2} />
              {(stats?.unreadNotifications ?? 0) > 0 && (
                <View style={{
                  position: 'absolute', top: 6, right: 7,
                  width: 8, height: 8, borderRadius: 4,
                  backgroundColor: RED, borderWidth: 1.5, borderColor: WHITE,
                }} />
              )}
            </TouchableOpacity>

            {/* Avatar */}
            <Avatar name={user?.name} size={44} />
          </View>
        </View>

        {/* Stats strip */}
        <View style={{
          flexDirection: 'row', marginTop: 24,
          backgroundColor: '#f8fafc', borderRadius: 16,
          paddingVertical: 16, paddingHorizontal: 8,
          borderWidth: 1, borderColor: BORDER,
        }}>
          <StatPill label="Total Order"  value={stats?.totalOrders}                  color={BLUE}  />
          <View style={{ width: 1, backgroundColor: BORDER, marginVertical: 4 }} />
          <StatPill label="Diproses"     value={stats?.ordersByStatus?.accepted}      color={AMBER} />
          <View style={{ width: 1, backgroundColor: BORDER, marginVertical: 4 }} />
          <StatPill label="Selesai"      value={stats?.ordersByStatus?.completed}     color={GREEN} />
        </View>
      </View>

      {/* Thin rule */}
      <View style={{ height: 1, backgroundColor: BORDER }} />

      {/* ── Service Cards ── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 4 }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: MUTED, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16 }}>
          Layanan
        </Text>

        <View style={{ flexDirection: 'row', gap: 14 }}>
          <ServiceCard
            icon={Car}
            title="Pol-Ride"
            subtitle={'Tebengan kampus\ncepat & terjangkau'}
            color={BLUE}
            bgColor={BLUE_BG}
            onPress={() => router.push('/(app)/orders/create?type=TEBENGAN')}
            style={{ marginRight: 0 }}
          />
          <ServiceCard
            icon={ShoppingBag}
            title="Pol-Send"
            subtitle={'Kirim & pesan\nbarang/makanan'}
            color={GREEN}
            bgColor={'#f0fdf4'}
            onPress={() => router.push('/(app)/orders/create?type=JASTIP')}
          />
        </View>
      </View>

      {/* ── Order History ── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 32 }}>
        <SectionHeader
          title="Pesanan Terbaru"
          action="Lihat Semua"
          onAction={() => router.push('/(app)/orders')}
        />

        <View style={{
          backgroundColor: WHITE,
          borderRadius: 20,
          paddingHorizontal: 16,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 14,
          elevation: 5,
          borderWidth: 1,
          borderColor: BORDER,
        }}>
          {orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Belum ada pesanan"
              subtitle="Mulai dengan memesan Pol-Ride atau Pol-Send di atas."
            />
          ) : (
            orders.map((order, i) => (
              <OrderRow
                key={order.id}
                order={order}
                isLast={i === orders.length - 1}
                onPress={() => router.push(`/(app)/orders/${order.id}`)}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

// ─── Driver Dashboard ─────────────────────────────────────────────────────────

const DriverDashboard = ({
  user, stats, availableOrders,
  refreshing, onRefresh,
  actionLoading, onAccept, onComplete,
  router,
}) => {
  const firstName = user?.name?.split(' ')[0] ?? 'Driver';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BLUE} colors={[BLUE]} />
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* ── Driver Header ── */}
      <View style={{ backgroundColor: WHITE, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={{ fontSize: 13, color: MUTED, fontWeight: '600', marginBottom: 4 }}>
              Mode Driver •{' '}
              <Text style={{ color: GREEN, fontWeight: '700' }}>Online</Text>
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: INK, letterSpacing: -0.8, lineHeight: 30 }}>
              {getGreeting()}, {firstName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push('/(app)/notifications')}
              activeOpacity={0.7}
              style={{
                width: 40, height: 40, borderRadius: 13,
                backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: BORDER,
              }}
            >
              <Bell size={18} color={INK_MID} strokeWidth={2} />
            </TouchableOpacity>
            <Avatar name={user?.name} size={44} />
          </View>
        </View>

        {/* Driver stats */}
        <View style={{
          flexDirection: 'row', marginTop: 24,
          backgroundColor: '#f8fafc', borderRadius: 16,
          paddingVertical: 16, paddingHorizontal: 8,
          borderWidth: 1, borderColor: BORDER,
        }}>
          <StatPill label="Total Trip"   value={stats?.totalTrips ?? stats?.totalOrders}      color={BLUE}  />
          <View style={{ width: 1, backgroundColor: BORDER, marginVertical: 4 }} />
          <StatPill label="Berjalan"     value={stats?.ordersByStatus?.accepted}               color={AMBER} />
          <View style={{ width: 1, backgroundColor: BORDER, marginVertical: 4 }} />
          <StatPill label="Selesai"      value={stats?.ordersByStatus?.completed}              color={GREEN} />
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: BORDER }} />

      {/* ── Available Orders ── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <SectionHeader title="Order Tersedia" />
          <TouchableOpacity
            onPress={onRefresh}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: BLUE_BG, paddingHorizontal: 12, paddingVertical: 8,
              borderRadius: 12, marginBottom: 16,
            }}
          >
            <RefreshCw size={13} color={BLUE} strokeWidth={2.5} />
            <Text style={{ color: BLUE, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>Perbarui</Text>
          </TouchableOpacity>
        </View>

        {availableOrders.length === 0 ? (
          <View style={{
            backgroundColor: WHITE, borderRadius: 20, borderWidth: 1, borderColor: BORDER,
            shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06, shadowRadius: 14, elevation: 4,
          }}>
            <EmptyState
              icon={MapPin}
              title="Belum ada order"
              subtitle="Order baru akan muncul otomatis. Tarik ke bawah untuk memperbarui."
            />
          </View>
        ) : (
          availableOrders.map((order, i) => (
            <DriverOrderCard
              key={order.id}
              order={order}
              onAccept={onAccept}
              onComplete={onComplete}
              loading={actionLoading[order.id]}
              isLast={i === availableOrders.length - 1}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

// ─── Root Component ───────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [stats, setStats]                   = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [userOrders, setUserOrders]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [actionLoading, setActionLoading]   = useState({});

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!user?.role) {
      setLoading(false);
      return;
    }
    try {
      const isDriver = user.role === 'driver';
      const [statsRes, ordersRes] = await Promise.all([
        isDriver ? usersAPI.getDriverStats() : usersAPI.getStats(),
        isDriver
          ? ordersAPI.getAvailableOrders()
          : ordersAPI.getAll({ limit: 5 }),        // ← fixed: was ordersAPI.list()
      ]);
      setStats(statsRes.data);
      if (isDriver) {
        setAvailableOrders(ordersRes.data ?? []);
      } else {
        setUserOrders(ordersRes.data ?? []);
      }
    } catch (err) {
      console.error('[Dashboard] fetchData error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleAccept = async (orderId) => {
    setActionLoading((p) => ({ ...p, [orderId]: 'accepting' }));
    try { await ordersAPI.acceptOrder(orderId); await fetchData(); }
    catch (e) { console.error('[Dashboard] accept failed:', e); }
    finally { setActionLoading((p) => ({ ...p, [orderId]: null })); }
  };

  const handleComplete = async (orderId) => {
    setActionLoading((p) => ({ ...p, [orderId]: 'completing' }));
    try { await ordersAPI.completeOrder(orderId); await fetchData(); }
    catch (e) { console.error('[Dashboard] complete failed:', e); }
    finally { setActionLoading((p) => ({ ...p, [orderId]: null })); }
  };

  // ── Guards ───────────────────────────────────────────────────────────────────

  if (loading || !user?.role) {
    return <LoadingScreen message={!user?.role ? 'Memeriksa akun…' : 'Memuat dashboard…'} />;
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {user.role === 'driver' ? (
        <DriverDashboard
          user={user}
          stats={stats}
          availableOrders={availableOrders}
          refreshing={refreshing}
          onRefresh={onRefresh}
          actionLoading={actionLoading}
          onAccept={handleAccept}
          onComplete={handleComplete}
          router={router}
        />
      ) : (
        <CustomerDashboard
          user={user}
          stats={stats}
          orders={userOrders}
          refreshing={refreshing}
          onRefresh={onRefresh}
          router={router}
        />
      )}
    </SafeAreaView>
  );
}