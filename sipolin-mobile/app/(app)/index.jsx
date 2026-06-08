import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, ordersAPI, extractApiList } from '../../services/api';
import { POLSEND_SEARCH_ITEMS, getPolsendRouteParams, matchesPolsendSearch, scorePolsendSearch } from '../../data/polsendCatalog';
import {
  Bell,
  ChevronRight,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  RefreshCw,
  ThumbsUp,
  Search,
  MoreHorizontal,
  Inbox,
  Smile,
  Star,
  TrendingUp,
  Zap,
  Car,
  Package,
} from 'lucide-react-native';

const { width: SW } = Dimensions.get('window');

// ─── Design Tokens ────────────────────────────────────────────────────────────
const PRIMARY = '#00AA5B';
const PRIMARY_DK = '#007A3E';
const PRIMARY_LT = '#E6F7EE';
const INK = '#0f172a';
const INK_MID = '#334155';
const MUTED = '#94a3b8';
const BORDER = '#f1f5f9';
const SURFACE = '#f8fafc';
const PAGE_BG = '#f4f6f8';
const WHITE = '#ffffff';
const GREEN = '#059669';
const AMBER = '#d97706';
const RED = '#dc2626';
const BLUE = '#1A73E8';
const ORANGE = '#F97316';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatIDR = (v) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(v ?? 0);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const formatTimeAgo = (d) => {
  if (!d) return 'Baru saja';

  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return 'Baru saja';

  const s = (Date.now() - date.getTime()) / 1000;
  if (s < 60) return 'Baru saja';
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
};

const normalizeRole = (role) => String(role || '').toLowerCase();

const extractStats = (payload) => {
  const data = payload?.data?.data || payload?.data || payload || {};
  const ordersByStatus = data.ordersByStatus || {};

  return {
    ...data,
    totalOrders: data.totalOrders ?? data.totalTrips ?? 0,
    totalTrips: data.totalTrips ?? data.totalOrders ?? 0,
    activeOrders: data.activeOrders ?? ordersByStatus.accepted ?? 0,
    completedOrders: data.completedOrders ?? ordersByStatus.completed ?? 0,
    ordersByStatus,
    unreadNotifications: data.unreadNotifications ?? 0,
  };
};

const getOrderStatus = (order) => String(order?.status || '').toLowerCase();

// ─── Assets ───────────────────────────────────────────────────────────────────
const ICON_POLRIDE = require('../../assets/icons/polride-rider-mini.png');
const ICON_POLSEND = require('../../assets/icons/polsend-packaging.png');
const ICON_NITIP = require('../../assets/icons/nitip-bowl.png');

// ─── Static Data ──────────────────────────────────────────────────────────────
const PROMO_BANNERS = [
  {
    id: '1',
    title: 'Pol-Ride Cepat\nBuat Aktivitas Harian',
    subtitle: 'Pesan antar jemput lebih praktis',
    badge: 'POL-RIDE',
    badgeColor: '#B9FF66',
    gradient: ['#00C46A', '#007A3E'],
    image: require('../../assets/images/banner-polride.jpg'),
    route: '/orders/create/pol_ride',
    cta: 'Pesan Sekarang',
  },
  {
    id: '2',
    title: 'Pol-Send Siap\nKirim Barang Kamu',
    subtitle: 'Kirim paket, dokumen, dan kebutuhan kecil',
    badge: 'POL-SEND',
    badgeColor: '#93C5FD',
    gradient: ['#1A73E8', '#0D47A1'],
    image: require('../../assets/images/banner-polsend.jpg'),
    route: '/orders/create/pol_send',
    cta: 'Kirim Sekarang',
  },
  {
    id: '3',
    title: 'Tanya AI Sipolin\nBiar Gak Bingung',
    subtitle: 'Bantu jelasin layanan dan cara pakai aplikasi',
    badge: 'AI ASSISTANT',
    badgeColor: '#FFD700',
    gradient: ['#111827', '#00AA5B'],
    image: require('../../assets/images/banner-ai.jpg'),
  route: '/chatbot',
    cta: 'Mulai Chat',
  },
  {
    id: '4',
    title: 'Pesanan Aktif\nLebih Mudah Dipantau',
    subtitle: 'Cek status order kamu secara real-time',
    badge: 'REALTIME',
    badgeColor: '#FF4D6D',
    gradient: ['#F59E0B', '#B45309'],
    image: require('../../assets/images/banner-orders.jpg'),
    route: '/orders',
    cta: 'Lihat Order',
  },
];

const SERVICE_MENU = [
  {
    id: 'polride',
    label: 'Pol-Ride',
    subtitle: 'Antar jemput',
    promo: '-1RB!',
    promoColor: PRIMARY,
    bg: '#E8FFF4',
    border: '#BFF4D8',
    icon: ICON_POLRIDE,
    fallback: Car,
    fallbackColor: PRIMARY,
    route: '/orders/create/pol_ride',
  },
  {
    id: 'polsend',
    label: 'Pol-Send',
    subtitle: 'Makanan & barang',
    promo: 'Food',
    promoColor: BLUE,
    bg: '#EEF6FF',
    border: '#C9E0FF',
    icon: ICON_POLSEND,
    fallback: Package,
    fallbackColor: BLUE,
    route: '/orders/create/pol_send',
  },
];

const FOODS_DATASET = POLSEND_SEARCH_ITEMS;

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 44 }) => {
  if (user?.profilePicture) {
    return (
      <Image
        source={{ uri: user.profilePicture }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: PRIMARY_LT,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
      }}
    >
      <Text style={{ color: WHITE, fontSize: size * 0.36, fontWeight: '800' }}>
        {getInitials(user?.name)}
      </Text>
    </View>
  );
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending: { label: 'Menunggu', color: AMBER, bg: '#fffbeb' },
    accepted: { label: 'Diproses', color: PRIMARY, bg: PRIMARY_LT },
    completed: { label: 'Selesai', color: GREEN, bg: '#ecfdf5' },
    cancelled: { label: 'Dibatalkan', color: RED, bg: '#fef2f2' },
  };

  const s = map[status] ?? map.pending;

  return (
    <View style={{ backgroundColor: s.bg, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ color: s.color, fontSize: 11, fontWeight: '700' }}>{s.label}</Text>
    </View>
  );
};

// ─── StatPill ────────────────────────────────────────────────────────────────
const StatPill = ({ label, value, color = INK }) => (
  <View style={{ alignItems: 'center', flex: 1 }}>
    <Text style={{ fontSize: 26, fontWeight: '900', color, letterSpacing: -1, lineHeight: 30 }}>
      {value ?? 0}
    </Text>
    <Text style={{ fontSize: 11, color: MUTED, fontWeight: '600', marginTop: 4 }}>{label}</Text>
  </View>
);

// ─── SectionHeader ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, action, onAction }) => (
  <View style={S.sectionHeader}>
    <Text style={S.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7} style={S.sectionAction}>
        <Text style={S.sectionActionText}>{action}</Text>
        <ChevronRight size={14} color={PRIMARY} strokeWidth={2.5} />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Promo Banner Card ────────────────────────────────────────────────────────
const PromoBannerVisual = ({ item }) => {
  const visual = item.id === '1' ? '🏍️' : item.id === '2' ? '📦' : item.id === '3' ? '🤖' : '📍';

  return (
    <View style={S.promoVisualWrap}>
      <View style={S.promoVisualGlow} />
      <Text style={S.promoVisualEmoji}>{visual}</Text>
    </View>
  );
};

const PromoBannerCard = ({ item, router }) => (
  <TouchableOpacity
    activeOpacity={0.92}
    onPress={() => item.route && router.push(item.route)}
    style={[S.promoBannerCard, { width: SW - 40 }]}
  >
    <LinearGradient
      colors={item.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />

    <Image source={item.image} style={S.promoBannerBgImage} resizeMode="cover" />
    <LinearGradient
      colors={["rgba(0,0,0,0.06)", "rgba(0,0,0,0.72)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={S.promoBannerOverlay}
    />
    <LinearGradient
      colors={[`${item.gradient[0]}E6`, "rgba(15,23,42,0.05)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={S.promoBannerSideGlow}
    />

    <View style={S.promoBannerCircle1} />
    <View style={S.promoBannerCircle2} />

    <View style={S.promoBannerInner}>
      <View style={[S.promoBannerBadge, { backgroundColor: item.badgeColor }]}> 
        <Text style={S.promoBannerBadgeText}>{item.badge}</Text>
      </View>

      <Text style={S.promoBannerTitle}>{item.title}</Text>
      <Text style={S.promoBannerSubtitle}>{item.subtitle}</Text>

      <TouchableOpacity
        activeOpacity={0.85}
        style={S.promoBannerBtn}
        onPress={() => item.route && router.push(item.route)}
      >
        <Text style={S.promoBannerBtnText}>{item.cta}</Text>
        <ChevronRight size={12} color={INK} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// ─── Service Menu Item ────────────────────────────────────────────────────────
// ─── Service Menu Item ────────────────────────────────────────────────────────
const ServiceMenuItem = ({ item, onPress }) => {
  const FallbackIcon = item.fallback;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={S.serviceMenuItem}>
      <View style={[S.serviceMenuCard, { backgroundColor: item.bg, borderColor: item.border }]}>
        {item.promo && (
          <View style={[S.serviceMenuBadge, { backgroundColor: item.promoColor }]}>
            <Text style={S.serviceMenuBadgeText}>{item.promo}</Text>
          </View>
        )}

        {item.icon ? (
          <Image source={item.icon} style={S.serviceMenuImage} resizeMode="contain" />
        ) : (
          <FallbackIcon size={32} color={item.fallbackColor} strokeWidth={2.2} />
        )}
      </View>

      <Text style={S.serviceMenuLabel}>{item.label}</Text>
      <Text style={S.serviceMenuSubtitle}>{item.subtitle}</Text>
    </TouchableOpacity>
  );
};

// ─── AI Assistant Card ────────────────────────────────────────────────────────
const AiAssistantCard = ({ router }) => (
  <TouchableOpacity activeOpacity={0.9} style={S.aiCard} onPress={() => router.push('/chatbot')}>
    <LinearGradient
      colors={['#0f172a', '#00AA5B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={S.aiGradient}
    >
      <View style={S.aiIconWrap}>
        <Zap size={20} color={WHITE} fill={WHITE} strokeWidth={2} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={S.aiTitle}>Tanya AI Sipolin</Text>
        <Text style={S.aiSubtitle}>Bingung layanan? Tanya asisten biar cepat paham.</Text>
      </View>

      <View style={S.aiArrow}>
        <ChevronRight size={18} color={PRIMARY} strokeWidth={2.8} />
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// ─── Active Order Card ────────────────────────────────────────────────────────
const ActiveOrderCard = ({ order, onPress, isLast }) => {
  const isRide = order.type === 'pol_ride';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[S.activeOrderCard, isLast && { borderBottomWidth: 0 }]}>
      <View style={[S.activeOrderIcon, { backgroundColor: isRide ? PRIMARY_LT : '#EBF3FD' }]}>
        {isRide ? (
          <Car size={18} color={PRIMARY} strokeWidth={2} />
        ) : (
          <Package size={18} color={BLUE} strokeWidth={2} />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={S.activeOrderTitle} numberOfLines={1}>
          {order.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
          <Clock size={10} color={MUTED} strokeWidth={2} />
          <Text style={S.activeOrderTime}>{formatTimeAgo(order.createdAt)}</Text>
          <Text style={{ color: MUTED }}>·</Text>
          <Text style={S.activeOrderPrice}>{formatIDR(order.price)}</Text>
        </View>
      </View>

      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <StatusBadge status={order.status} />
        <ChevronRight size={13} color={MUTED} strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
};

// ─── Empty Orders ─────────────────────────────────────────────────────────────
const EmptyOrders = () => (
  <View style={S.emptyOrders}>
    <View style={S.emptyCircleOuter}>
      <View style={S.emptyCircleMid}>
        <View style={[S.emptyCircleInner, { backgroundColor: PRIMARY_LT }]}>
          <Inbox size={28} color={PRIMARY} strokeWidth={1.8} />
        </View>
      </View>
    </View>
    <Text style={S.emptyTitle}>Belum ada pesanan aktif</Text>
    <Text style={S.emptySubtitle}>
      Yuk buat pesanan pertamamu!{'\n'}Pol-Ride atau Pol-Send siap bantu 🚀
    </Text>
    <View style={[S.emptyTipRow, { backgroundColor: PRIMARY_LT }]}>
      <Smile size={14} color={PRIMARY} strokeWidth={2} />
      <Text style={[S.emptyTip, { color: PRIMARY }]}>Pesanan baru muncul di sini real-time</Text>
    </View>
  </View>
);

// ─── Loading Screen ───────────────────────────────────────────────────────────
const LoadingScreen = ({ message }) => (
  <SafeAreaView style={S.loadingScreen}>
    <StatusBar barStyle="dark-content" />
    <View style={S.loadingIcon}>
      <ActivityIndicator size="large" color={WHITE} />
    </View>
    <Text style={S.loadingTitle}>{message}</Text>
    <Text style={S.loadingSubtitle}>SIPOLIN • Polindra</Text>
  </SafeAreaView>
);

// ─── Driver Order Card ────────────────────────────────────────────────────────
const DriverOrderCard = ({ order, onAccept, onComplete, onOpenDetail, loading, isLast }) => {
  const status = getOrderStatus(order);
  const isPending = status === 'pending';
  const isAccepted = status === 'accepted';
  const isActiveProgress = ['accepted', 'arrived', 'picked_up', 'on_the_way'].includes(status);
  const isCompleted = status === 'completed';
  const isCancelled = status === 'cancelled';

  const statusMeta = {
    pending: {
      label: 'Menunggu',
      color: AMBER,
      bg: '#fff7ed',
      buttonText: 'Ambil Order',
      buttonColor: PRIMARY,
    },
    accepted: {
      label: 'Menuju',
      color: PRIMARY,
      bg: PRIMARY_LT,
      buttonText: 'Lihat Detail',
      buttonColor: PRIMARY,
    },
    arrived: {
      label: 'Sampai',
      color: BLUE,
      bg: '#eff6ff',
      buttonText: 'Lihat Detail',
      buttonColor: PRIMARY,
    },
    picked_up: {
      label: 'Diambil',
      color: '#7c3aed',
      bg: '#f5f3ff',
      buttonText: 'Lihat Detail',
      buttonColor: PRIMARY,
    },
    on_the_way: {
      label: 'Di Jalan',
      color: BLUE,
      bg: '#eff6ff',
      buttonText: 'Lihat Detail',
      buttonColor: PRIMARY,
    },
    completed: {
      label: 'Selesai',
      color: GREEN,
      bg: '#ecfdf5',
      buttonText: 'Selesai',
      buttonColor: GREEN,
    },
    cancelled: {
      label: 'Dibatalkan',
      color: RED,
      bg: '#fef2f2',
      buttonText: 'Dibatalkan',
      buttonColor: RED,
    },
  };

  const meta = statusMeta[status] || statusMeta.pending;
  const isActionDisabled = !!loading || isCompleted || isCancelled;
  const customerName = order?.customer?.name || 'Pemesan';
  const customerSub = order?.customer?.nim || order?.customer?.phone || 'Mahasiswa Sipolin';

  const handleAction = () => {
    if (isPending) return onAccept(order.id);
    if (isActiveProgress) return handleOpenDetail();
    return null;
  };

  const handleOpenDetail = () => {
    if (order?.id && onOpenDetail) onOpenDetail(order.id);
  };

  return (
    <View style={[S.driverOrderCard, { marginBottom: isLast ? 0 : 14 }]}>
      <View style={[S.driverOrderTop, { backgroundColor: meta.bg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={[S.driverStatusDot, { backgroundColor: meta.color }]} />
          <Text style={[S.driverOrderType, { color: meta.color }]}>
            {order.type === 'pol_ride' ? 'POL-RIDE' : 'POL-SEND'}
          </Text>

          <View style={[S.driverStatusChip, { backgroundColor: WHITE }]}>
            <Text style={[S.driverStatusChipText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        </View>

        <Text style={S.driverOrderPrice}>{formatIDR(order.price)}</Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={S.driverOrderTitle} numberOfLines={1}>
          {order.title || (order.type === 'pol_ride' ? 'Pol-Ride' : 'Pol-Send')}
        </Text>

        <TouchableOpacity activeOpacity={0.82} onPress={handleOpenDetail} style={S.driverCustomerBox}>
          <View style={S.driverCustomerAvatar}>
            <Text style={S.driverCustomerInitial}>{customerName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={S.driverCustomerLabel}>Pemesan</Text>
            <Text style={S.driverCustomerName} numberOfLines={1}>{customerName}</Text>
            <Text style={S.driverCustomerSub} numberOfLines={1}>{customerSub}</Text>
          </View>
          <ChevronRight size={17} color={MUTED} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', marginBottom: 18 }}>
          <View style={{ alignItems: 'center', marginRight: 14 }}>
            <Circle size={10} color={PRIMARY} fill={PRIMARY} strokeWidth={0} />
            <View style={S.driverRouteLine} />
            <MapPin size={12} color={RED} strokeWidth={2.5} />
          </View>

          <View style={{ flex: 1, justifyContent: 'space-between', minHeight: 54 }}>
            <Text style={S.driverLocation} numberOfLines={2}>
              {order.pickup || 'Lokasi jemput belum tersedia'}
            </Text>
            <Text style={S.driverLocation} numberOfLines={2}>
              {order.destination || 'Tujuan belum tersedia'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAction}
          disabled={isActionDisabled}
          activeOpacity={0.85}
          style={[
            S.driverActionBtn,
            {
              backgroundColor: meta.buttonColor,
              opacity: isActionDisabled && !loading ? 0.65 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={WHITE} />
          ) : (
            <>
              {isPending ? (
                <ThumbsUp size={16} color={WHITE} strokeWidth={2.5} style={{ marginRight: 8 }} />
              ) : (
                <CheckCircle2 size={16} color={WHITE} strokeWidth={2.5} style={{ marginRight: 8 }} />
              )}
              <Text style={S.driverActionText}>{meta.buttonText}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.85} onPress={handleOpenDetail} style={S.driverDetailBtn}>
          <Text style={S.driverDetailBtnText}>Lihat Detail Transaksi</Text>
          <ChevronRight size={15} color={PRIMARY} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Customer Dashboard ───────────────────────────────────────────────────────
const CustomerDashboard = ({ user, stats, orders, refreshing, onRefresh, router }) => {
  const firstName = user?.name?.split(' ')[0] ?? 'Mahasiswa';

  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);

  const onCarouselViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveSlide(viewableItems[0].index ?? 0);
  }, []);

  const carouselViewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);

    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    const results = FOODS_DATASET
      .map((item) => ({
        ...item,
        _searchScore: scorePolsendSearch(item, text),
      }))
      .filter((item) => item._searchScore > 0)
      .sort((a, b) => {
        if (b._searchScore !== a._searchScore) return b._searchScore - a._searchScore;

        const aService = a.type === 'service' ? 0 : 1;
        const bService = b.type === 'service' ? 0 : 1;
        if (aService !== bService) return aService - bService;

        const aPopular = a.isPopular ? 0 : 1;
        const bPopular = b.isPopular ? 0 : 1;
        if (aPopular !== bPopular) return aPopular - bPopular;

        return String(a.name || '').localeCompare(String(b.name || ''));
      })
      .slice(0, 12);

    setSearchResults(results);
  }, []);

  const showSearchPanel = searchQuery.trim().length > 0;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} colors={[PRIMARY]} />}
      contentContainerStyle={{ paddingBottom: 110, backgroundColor: PAGE_BG }}
    >
      <View style={S.header}>
        <View style={S.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={S.headerGreeting}>{getGreeting()}, 👋</Text>
            <Text style={S.headerName}>Mau apa nih, {firstName}!</Text>
          </View>

          <View style={S.headerActions}>
            <TouchableOpacity onPress={() => router.push('/notifications')} activeOpacity={0.7} style={S.headerIconBtn}>
              <Bell size={18} color={INK_MID} strokeWidth={2} />
              {(stats?.unreadNotifications ?? 0) > 0 && <View style={S.notifDot} />}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.85}>
              <Avatar user={user} size={44} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[S.searchBar, searchFocused && S.searchBarFocused]}>
          <Search size={16} color={searchFocused ? PRIMARY : MUTED} strokeWidth={2} />
          <TextInput
            style={S.searchInput}
            placeholder="Cari makanan, resto, layanan..."
            placeholderTextColor={MUTED}
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => {}}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            blurOnSubmit={false}
          />

          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => handleSearch('')} activeOpacity={0.7}>
              <Text style={S.clearSearch}>×</Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={S.searchDivider} />
              <TouchableOpacity activeOpacity={0.7} style={S.searchFilterBtn}>
                <Text style={S.searchFilterText}>Filter</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {showSearchPanel && searchResults.length > 0 && (
          <View style={S.searchDropdown}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={S.searchDropdownItem}
                onPress={() => {
                  handleSearch('');
                  setSearchFocused(false);

                  if (item.type === 'service' && item.route) {
                    router.push(item.route);
                    return;
                  }

                  router.push({
                    pathname: '/orders/create/pol_send',
                    params: getPolsendRouteParams(item),
                  });
                }}
              >
                <View style={S.searchResultLeft}>
                  <View style={S.searchResultThumb}>
                    <Text style={S.searchResultEmoji}>{item.emoji || item.merchantEmoji || '🍽️'}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={S.searchResultTitle}>{item.name}</Text>
                    <Text style={S.searchResultSubtitle}>
                      {item.type === 'service'
                        ? item.resto
                        : item.type === 'merchant'
                          ? `${item.resto} · ${item.distanceLabel || 'Dekat'}`
                          : `${item.resto} · ${formatIDR(item.price)}`}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={14} color={MUTED} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showSearchPanel && searchResults.length === 0 && (
          <View style={[S.searchDropdown, S.searchEmpty]}>
            <Text style={S.searchEmptyText}>Hasil tidak ditemukan untuk "{searchQuery}"</Text>
          </View>
        )}
      </View>

      <View style={{ marginBottom: 4 }}>
        <FlatList
          ref={carouselRef}
          data={PROMO_BANNERS}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          decelerationRate="fast"
          onViewableItemsChanged={onCarouselViewableItemsChanged}
          viewabilityConfig={carouselViewabilityConfig.current}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          getItemLayout={(_, index) => ({
            length: SW - 40,
            offset: (SW - 40 + 12) * index,
            index,
          })}
          renderItem={({ item }) => <PromoBannerCard item={item} router={router} />}
        />

        <View style={S.promoDots}>
          {PROMO_BANNERS.map((item, i) => (
            <View key={item.id} style={[S.promoDot, i === activeSlide && S.promoDotActive]} />
          ))}
        </View>
      </View>

      <View style={S.card}>
        <SectionHeader title="Layanan" />
        <View style={S.serviceMenuRow}>
          {SERVICE_MENU.map((item) => (
            <ServiceMenuItem
              key={item.id}
              item={item}
              onPress={() => {
                if (item.route) router.push(item.route);
              }}
            />
          ))}
        </View>
      </View>

      <AiAssistantCard router={router} />

      <View style={[S.card, { marginTop: 0 }]}>
        <SectionHeader title="Pesanan Aktif" action="Lihat Semua" onAction={() => router.push('/orders')} />

        {orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          orders.map((order, i) => (
            <ActiveOrderCard
              key={order.id}
              order={order}
              isLast={i === orders.length - 1}
              onPress={() => router.push(`/orders/${order.id}/track`)}
            />
          ))
        )}
      </View>

      <View style={S.statsStrip}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Star size={14} color={AMBER} fill={AMBER} strokeWidth={0} />
            <Text style={S.ratingValue}>{stats?.avgRating ? Number(stats.avgRating).toFixed(1) : '5.0'}</Text>
          </View>
          <Text style={S.statsLabel}>Rating Kamu</Text>
        </View>

        <View style={S.statsDivider} />

        <View style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Zap size={14} color={PRIMARY} fill={PRIMARY} strokeWidth={0} />
            <Text style={S.totalOrderValue}>{stats?.totalOrders ?? 0}</Text>
          </View>
          <Text style={S.statsLabel}>Total Pesanan</Text>
        </View>

        <View style={S.statsDivider} />

        <View style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <TrendingUp size={13} color={GREEN} strokeWidth={2.5} />
            <Text style={S.savingValue}>{stats?.totalSavings ? `${Math.round(stats.totalSavings / 1000)}rb` : '0'}</Text>
          </View>
          <Text style={S.statsLabel}>Total Hemat</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// ─── Driver Dashboard ─────────────────────────────────────────────────────────
const DriverDashboard = ({
  user,
  stats,
  availableOrders,
  driverOrders,
  refreshing,
  onRefresh,
  actionLoading,
  onAccept,
  onComplete,
  router,
}) => {
  const firstName = user?.name?.split(' ')[0] ?? 'Driver';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} colors={[PRIMARY]} />}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      <View style={S.driverHeader}>
        <View style={S.driverHeaderTop}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={S.driverMode}>
              Mode Driver · <Text style={{ color: PRIMARY, fontWeight: '700' }}>Online</Text>
            </Text>
            <Text style={S.driverGreeting}>
              {getGreeting()}, {firstName}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.push('/notifications')} activeOpacity={0.7} style={S.driverBell}>
              <Bell size={18} color={INK_MID} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.85}>
              <Avatar user={user} size={44} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={S.driverStats}>
          <StatPill label="Total Trip" value={stats?.totalTrips ?? stats?.totalOrders ?? 0} color={PRIMARY} />
          <View style={S.driverStatsDivider} />
          <StatPill label="Berjalan" value={stats?.activeOrders ?? stats?.ordersByStatus?.accepted ?? 0} color={AMBER} />
          <View style={S.driverStatsDivider} />
          <StatPill label="Selesai" value={stats?.completedOrders ?? stats?.ordersByStatus?.completed ?? 0} color={GREEN} />
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: BORDER }} />

      <View style={{ paddingHorizontal: 24, paddingTop: 28 }}>
        <View style={S.driverOrderHeader}>
          <SectionHeader title="Order Tersedia" />
          <TouchableOpacity onPress={onRefresh} activeOpacity={0.7} style={S.refreshButton}>
            <RefreshCw size={13} color={PRIMARY} strokeWidth={2.5} />
            <Text style={S.refreshText}>Perbarui</Text>
          </TouchableOpacity>
        </View>

        {availableOrders.length === 0 ? (
          <View style={S.driverEmptyCard}>
            <View style={S.driverEmptyInner}>
              <View style={S.driverEmptyIcon}>
                <MapPin size={26} color={PRIMARY} strokeWidth={1.8} />
              </View>
              <Text style={S.driverEmptyTitle}>Belum ada order</Text>
              <Text style={S.driverEmptySubtitle}>
                Order baru akan muncul otomatis. Tarik ke bawah untuk memperbarui.
              </Text>
            </View>
          </View>
        ) : (
          availableOrders.map((order, i) => (
            <DriverOrderCard
              key={order.id}
              order={order}
              onAccept={onAccept}
              onComplete={onComplete}
              onOpenDetail={(orderId) => router.push(`/orders/${orderId}`)}
              loading={actionLoading[order.id]}
              isLast={i === availableOrders.length - 1}
            />
          ))
        )}
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <View style={S.driverOrderHeader}>
          <SectionHeader title="Order Saya" />
        </View>

        {driverOrders.length === 0 ? (
          <View style={S.driverEmptyMiniCard}>
            <Text style={S.driverEmptyMiniText}>Belum ada order yang kamu ambil.</Text>
          </View>
        ) : (
          driverOrders.map((order, i) => (
            <DriverOrderCard
              key={order.id}
              order={order}
              onAccept={onAccept}
              onComplete={onComplete}
              onOpenDetail={(orderId) => router.push(`/orders/${orderId}`)}
              loading={actionLoading[order.id]}
              isLast={i === driverOrders.length - 1}
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

  const [stats, setStats] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [driverOrders, setDriverOrders] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const fetchData = useCallback(async () => {
    const role = normalizeRole(user?.role);

    if (!role) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const isDriver = role === 'driver';

      if (isDriver) {
        const [statsRes, availableRes, myOrdersRes] = await Promise.all([
          usersAPI.getStats(),
          ordersAPI.getAvailable(),
          ordersAPI.getAll(),
        ]);

        const statsData = extractStats(statsRes);
        const available = extractApiList(availableRes).filter((order) => getOrderStatus(order) === 'pending');
        const myOrdersAll = extractApiList(myOrdersRes);
        const mine = myOrdersAll.filter((order) => {
          const status = getOrderStatus(order);
          return ['accepted', 'arrived', 'picked_up', 'on_the_way', 'completed'].includes(status);
        });

        const acceptedCount = myOrdersAll.filter((order) => ['accepted', 'arrived', 'picked_up', 'on_the_way'].includes(getOrderStatus(order))).length;
        const completedCount = myOrdersAll.filter((order) => getOrderStatus(order) === 'completed').length;

        setStats({
          ...statsData,
          totalOrders: statsData.totalOrders || myOrdersAll.length,
          totalTrips: statsData.totalTrips || myOrdersAll.length,
          activeOrders: statsData.activeOrders || acceptedCount,
          completedOrders: statsData.completedOrders || completedCount,
          ordersByStatus: {
            ...(statsData.ordersByStatus || {}),
            accepted: statsData.ordersByStatus?.accepted ?? acceptedCount,
            completed: statsData.ordersByStatus?.completed ?? completedCount,
          },
        });
        setAvailableOrders(available);
        setDriverOrders(mine);
        setUserOrders([]);
      } else {
        const [statsRes, ordersRes] = await Promise.all([
          usersAPI.getStats(),
          ordersAPI.getAll(),
        ]);

        const statsData = extractStats(statsRes);
        const orders = extractApiList(ordersRes);

        setStats(statsData);
        setUserOrders(orders.slice(0, 5));
        setAvailableOrders([]);
        setDriverOrders([]);
      }
    } catch (err) {
      console.error('[Dashboard] fetchData error:', err?.response?.data || err?.message || err);
      setStats({ totalOrders: 0, totalTrips: 0, activeOrders: 0, completedOrders: 0, ordersByStatus: {} });
      setUserOrders([]);
      setAvailableOrders([]);
      setDriverOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAccept = async (orderId) => {
    setActionLoading((p) => ({ ...p, [orderId]: 'accepting' }));

    try {
      await ordersAPI.acceptOrder(orderId);
      await fetchData();
    } catch (e) {
      console.error('[Dashboard] accept failed:', e);
    } finally {
      setActionLoading((p) => ({ ...p, [orderId]: null }));
    }
  };

  const handleComplete = async (orderId) => {
    setActionLoading((p) => ({ ...p, [orderId]: 'completing' }));

    try {
      await ordersAPI.completeOrder(orderId);
      await fetchData();
    } catch (e) {
      console.error('[Dashboard] complete failed:', e);
    } finally {
      setActionLoading((p) => ({ ...p, [orderId]: null }));
    }
  };

  if (loading || !user?.role) {
    return <LoadingScreen message={!user?.role ? 'Memeriksa akun…' : 'Memuat dashboard…'} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PAGE_BG }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      {normalizeRole(user.role) === 'driver' ? (
        <DriverDashboard
          user={user}
          stats={stats}
          availableOrders={availableOrders}
          driverOrders={driverOrders}
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

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
    marginRight: 2,
  },

  header: {
    backgroundColor: WHITE,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerGreeting: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerName: {
    fontSize: 24,
    fontWeight: '900',
    color: INK,
    letterSpacing: -0.7,
    lineHeight: 28,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
    borderWidth: 1.5,
    borderColor: WHITE,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchBarFocused: {
    borderColor: PRIMARY,
    backgroundColor: WHITE,
    shadowColor: PRIMARY,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: INK,
    fontWeight: '500',
    padding: 0,
  },
  clearSearch: {
    color: MUTED,
    fontSize: 18,
    lineHeight: 20,
  },
  searchDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#d1d5db',
  },
  searchFilterBtn: {
    paddingHorizontal: 2,
  },
  searchFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  searchDropdown: {
    marginTop: 6,
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 20,
    overflow: 'hidden',
  },
  searchDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  searchResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  searchResultThumb: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: PRIMARY_LT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultEmoji: {
    fontSize: 20,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
  },
  searchResultSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 1,
  },
  searchEmpty: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchEmptyText: {
    color: MUTED,
    fontSize: 13,
  },

  promoBannerCard: {
    height: 180,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 7,
  },
  promoBannerBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  promoBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  promoBannerSideGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '65%',
  },
  promoBannerInner: {
    padding: 18,
    gap: 4,
  },
  promoBannerCircle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    right: -40,
    top: -50,
  },
  promoBannerCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    right: 40,
    bottom: -30,
  },
  promoVisualWrap: {
    position: 'absolute',
    right: 18,
    top: 28,
    width: 108,
    height: 108,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-5deg' }],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  promoVisualGlow: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  promoVisualEmoji: {
    fontSize: 52,
  },
  promoBannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  promoBannerBadgeText: {
    color: INK,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  promoBannerTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 23,
  },
  promoBannerSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    marginBottom: 10,
  },
  promoBannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promoBannerBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: INK,
  },
  promoDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  promoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
  },
  promoDotActive: {
    width: 22,
    backgroundColor: PRIMARY,
  },

  card: {
    backgroundColor: WHITE,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: BORDER,
  },

  serviceMenuRow: {
    flexDirection: 'row',
    gap: 12,
    overflow: 'visible',
  },
  serviceMenuItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  serviceMenuCard: {
    width: '100%',
    height: 82,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
    borderWidth: 1,
    position: 'relative',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 3,
  },
  serviceMenuImage: {
    width: 58,
    height: 58,
  },
  serviceMenuBadge: {
    position: 'absolute',
    top: -7,
    left: -5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    zIndex: 5,
    borderWidth: 2,
    borderColor: WHITE,
  },
  serviceMenuBadgeText: {
    color: WHITE,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  serviceMenuLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: INK,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  serviceMenuSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    color: MUTED,
    marginTop: 2,
    textAlign: 'center',
  },

  aiCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 14,
    elevation: 5,
  },
  aiGradient: {
    padding: 16,
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  aiIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  aiTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  aiSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    marginTop: 3,
  },
  aiArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeOrderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 12,
  },
  activeOrderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOrderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
  },
  activeOrderTime: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '500',
  },
  activeOrderPrice: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '700',
  },

  statsStrip: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    marginHorizontal: 16,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statsDivider: {
    width: 1,
    backgroundColor: BORDER,
    marginVertical: 4,
  },
  statsLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '600',
    marginTop: 3,
  },
  ratingValue: {
    fontSize: 22,
    fontWeight: '900',
    color: AMBER,
    letterSpacing: -0.5,
  },
  totalOrderValue: {
    fontSize: 22,
    fontWeight: '900',
    color: PRIMARY,
    letterSpacing: -0.5,
  },
  savingValue: {
    fontSize: 15,
    fontWeight: '900',
    color: GREEN,
    letterSpacing: -0.3,
  },

  emptyOrders: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  emptyCircleOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e6f7ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyCircleMid: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#9FE1CB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircleInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: INK,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 250,
    marginBottom: 16,
  },
  emptyTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  emptyTip: {
    fontSize: 12,
    fontWeight: '600',
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: PRIMARY,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },
  loadingSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 6,
    letterSpacing: 0.5,
  },

  driverHeader: {
    backgroundColor: WHITE,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },
  driverHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  driverMode: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverGreeting: {
    fontSize: 26,
    fontWeight: '900',
    color: INK,
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  driverBell: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  driverStats: {
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  driverStatsDivider: {
    width: 1,
    backgroundColor: BORDER,
    marginVertical: 4,
  },
  driverOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_LT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  refreshText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  driverEmptyCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  driverEmptyInner: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  driverEmptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: PRIMARY_LT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  driverEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
    marginBottom: 6,
  },
  driverEmptySubtitle: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 240,
  },
  driverEmptyMiniCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  driverEmptyMiniText: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '600',
    textAlign: 'center',
  },

  driverOrderCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  driverOrderTop: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  driverStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },
  driverOrderType: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  driverStatusChip: {
    marginLeft: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  driverStatusChipText: {
    fontSize: 10,
    fontWeight: '800',
  },
  driverOrderPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: INK,
  },
  driverOrderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    marginBottom: 14,
  },
  driverRouteLine: {
    width: 1.5,
    height: 28,
    backgroundColor: '#9FE1CB',
    marginVertical: 4,
  },
  driverLocation: {
    fontSize: 13,
    color: INK_MID,
    fontWeight: '600',
  },
  driverCustomerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  driverCustomerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: PRIMARY_LT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverCustomerInitial: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '900',
  },
  driverCustomerLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 1,
  },
  driverCustomerName: {
    color: INK,
    fontSize: 13.5,
    fontWeight: '900',
  },
  driverCustomerSub: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  driverDetailBtn: {
    marginTop: 10,
    minHeight: 44,
    borderRadius: 13,
    backgroundColor: PRIMARY_LT,
    borderWidth: 1,
    borderColor: '#b7f0d2',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  driverDetailBtnText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '900',
  },

  driverActionBtn: {
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  driverActionText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },
});