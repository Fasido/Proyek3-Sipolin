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
  Animated,
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
import { usersAPI, ordersAPI } from '../../services/api';
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
const PRIMARY    = '#00AA5B';
const PRIMARY_DK = '#007A3E';
const PRIMARY_LT = '#E6F7EE';
const INK        = '#0f172a';
const INK_MID    = '#334155';
const MUTED      = '#94a3b8';
const BORDER     = '#f1f5f9';
const SURFACE    = '#f8fafc';
const PAGE_BG    = '#f4f6f8';
const WHITE      = '#ffffff';
const GREEN      = '#059669';
const AMBER      = '#d97706';
const RED        = '#dc2626';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatIDR = (v) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const formatTimeAgo = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'Baru saja';
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
};

// ─── Static Data ──────────────────────────────────────────────────────────────

/**
 * CAROUSEL BANNERS
 * image: pakai require() dari assets/images/
 * Kalau file belum ada, fallback ke gradient bg otomatis
 * Tambah file ke assets/images/ sesuai nama di bawah
 */
const PROMO_BANNERS = [
  {
    id: '1',
    title: 'Gratis Ongkir\nPesanan Pertama!',
    subtitle: 'Khusus pengguna baru SIPOLIN',
    badge: 'PROMO',
    badgeColor: '#FFD700',
    gradient: ['#00C46A', '#007A3E'],
    image: (() => { try { return require('../../assets/images/banner-ride.jpg'); } catch { return null; } })(),
    route: '/pol_ride',
    cta: 'Pesan Sekarang',
  },
  {
    id: '2',
    title: 'Cashback 30%\nPol-Send Hari Ini',
    subtitle: 'Kirim paket lebih hemat & cepat',
    badge: 'CASHBACK',
    badgeColor: '#FF6B35',
    gradient: ['#1A73E8', '#0D47A1'],
    image: (() => { try { return require('../../assets/images/banner-send.jpg'); } catch { return null; } })(),
    route: '/pol_send',
    cta: 'Kirim Sekarang',
  },
  {
    id: '3',
    title: 'Upgrade Member\nDapat Benefit Lebih!',
    subtitle: 'Nikmati harga eksklusif setiap hari',
    badge: 'MEMBER PLUS',
    badgeColor: '#FFD700',
    gradient: ['#7C3AED', '#4C1D95'],
    image: (() => { try { return require('../../assets/images/banner-member.png'); } catch { return null; } })(),
    route: null,
    cta: 'Lihat Keuntungan',
  },
  {
    id: '4',
    title: 'Menangkan Hadiah\nSenilai 5 Juta!',
    subtitle: 'Kasih rating & kumpulkan poin',
    badge: 'EVENT',
    badgeColor: '#FF4D6D',
    gradient: ['#F59E0B', '#B45309'],
    image: (() => { try { return require('../../assets/images/banner-event.png'); } catch { return null; } })(),
    route: null,
    cta: 'Ikut Sekarang',
  },
];

/**
 * SERVICE MENU — Gojek-style dengan emoji besar + gradient card
 * promo: badge di pojok kiri atas
 */
const SERVICE_MENU = [
  {
    id: 'polride',
    emoji: '🛵',
    label: 'Pol-Ride',
    promo: '-1RB!',
    promoColor: '#00AA5B',
    gradientStart: '#D4F7E7',
    gradientEnd: '#A8EDCC',
    emojiSize: 38,
    // 👇 UPDATE RUTE KE SINI 👇
    route: '/orders/create/pol_ride',
  },
  {
    id: 'polsend',
    emoji: '📦',
    label: 'Pol-Send',
    promo: '-30rb',
    promoColor: '#1A73E8',
    gradientStart: '#D3E7FD',
    gradientEnd: '#A8CFFA',
    emojiSize: 36,
    // 👇 UPDATE RUTE KE SINI 👇
    route: '/orders/create/pol_send',
  },
  {
    id: 'lainnya',
    emoji: '⚙️',
    label: 'Lainnya',
    promo: null,
    promoColor: null,
    gradientStart: '#F1F5F9',
    gradientEnd: '#E2E8F0',
    emojiSize: 32,
    route: null,
  },
];

// Dataset makanan / resto lokal Polindra — dipakai untuk smart search
const FOODS_DATASET = [
  { id: 1, name: 'Nasi Goreng Spesial', resto: 'Warung Pak Haji', price: 18000, tag: 'nasi' },
  { id: 2, name: 'Mie Ayam Bakso',      resto: 'Mie Pak Slamet',  price: 15000, tag: 'mie'  },
  { id: 3, name: 'Ayam Penyet',         resto: 'Dapur Bu Endah',  price: 22000, tag: 'ayam' },
  { id: 4, name: 'Es Teh Manis',        resto: 'Kantin Polindra', price:  5000, tag: 'minum'},
  { id: 5, name: 'Bakso Urat Jumbo',    resto: 'Bakso Mas Bro',   price: 20000, tag: 'bakso'},
  { id: 6, name: 'Soto Ayam Lamongan', resto: 'Soto Bu Kartini', price: 17000, tag: 'soto' },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 44 }) => {
  if (user?.profilePicture) {
    return (
      <Image
        source={{ uri: user.profilePicture }}
        style={{
          width: size, height: size, borderRadius: size / 2,
          borderWidth: 2, borderColor: PRIMARY_LT,
        }}
      />
    );
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
      shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
    }}>
      <Text style={{ color: WHITE, fontSize: size * 0.36, fontWeight: '800' }}>
        {getInitials(user?.name)}
      </Text>
    </View>
  );
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:   { label: 'Menunggu',   color: AMBER,   bg: '#fffbeb' },
    accepted:  { label: 'Diproses',   color: PRIMARY, bg: PRIMARY_LT },
    completed: { label: 'Selesai',    color: GREEN,   bg: '#ecfdf5'  },
    cancelled: { label: 'Dibatalkan', color: RED,     bg: '#fef2f2'  },
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
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <Text style={{ fontSize: 17, fontWeight: '800', color: INK, letterSpacing: -0.3 }}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: PRIMARY, marginRight: 2 }}>{action}</Text>
        <ChevronRight size={14} color={PRIMARY} strokeWidth={2.5} />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Promo Banner Card (image + gradient overlay) ────────────────────────────
const PromoBannerCard = ({ item, router }) => (
  <TouchableOpacity
    activeOpacity={0.92}
    onPress={() => item.route && router.push(item.route)}
    style={[S.promoBannerCard, { width: SW - 40 }]}
  >
    {/* Background: foto jika ada, fallback gradient */}
    {item.image ? (
      <>
        <Image source={item.image} style={S.promoBannerBgImage} resizeMode="cover" />
        {/* Dark gradient overlay agar teks terbaca */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.72)']}
          style={S.promoBannerOverlay}
        />
        <LinearGradient
          colors={[item.gradient[0] + 'CC', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={S.promoBannerSideGlow}
        />
      </>
    ) : (
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    )}

    {/* Dekorasi bubble */}
    <View style={S.promoBannerCircle1} />
    <View style={S.promoBannerCircle2} />

    {/* Konten */}
    <View style={S.promoBannerInner}>
      {/* Badge promo */}
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

// ─── Service Menu Item (Gojek-style emoji card) ───────────────────────────────
const ServiceMenuItem = ({ item, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={S.serviceMenuItem}>
    {/* Card dengan gradient */}
    <View style={S.serviceMenuCard}>
      <LinearGradient
        colors={[item.gradientStart, item.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={S.serviceMenuGradient}
      />
      {/* Promo badge pojok kiri atas */}
      {item.promo && (
        <View style={[S.serviceMenuBadge, { backgroundColor: item.promoColor }]}>
          <Text style={S.serviceMenuBadgeText}>{item.promo}</Text>
        </View>
      )}
      {/* Emoji icon */}
      <Text style={{ fontSize: item.emojiSize, lineHeight: item.emojiSize + 8 }}>{item.emoji}</Text>
    </View>
    <Text style={S.serviceMenuLabel}>{item.label}</Text>
  </TouchableOpacity>
);

// ─── Active Order Card ────────────────────────────────────────────────────────
const ActiveOrderCard = ({ order, onPress, isLast }) => {
  const isRide = order.type === 'pol_ride';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[S.activeOrderCard, isLast && { borderBottomWidth: 0 }]}
    >
      <View style={[S.activeOrderIcon, { backgroundColor: isRide ? PRIMARY_LT : '#EBF3FD' }]}>
        {isRide
          ? <Car size={18} color={PRIMARY} strokeWidth={2} />
          : <Package size={18} color='#1A73E8' strokeWidth={2} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={S.activeOrderTitle} numberOfLines={1}>{order.title}</Text>
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
    <Text style={S.emptySubtitle}>Yuk buat pesanan pertamamu!{'\n'}Pol-Ride atau Pol-Send siap antar 🚀</Text>
    <View style={[S.emptyTipRow, { backgroundColor: PRIMARY_LT }]}>
      <Smile size={14} color={PRIMARY} strokeWidth={2} />
      <Text style={[S.emptyTip, { color: PRIMARY }]}>Pesanan baru muncul di sini real-time</Text>
    </View>
  </View>
);

// ─── Loading Screen ───────────────────────────────────────────────────────────
const LoadingScreen = ({ message }) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' }}>
    <StatusBar barStyle="dark-content" />
    <View style={{
      width: 64, height: 64, borderRadius: 20, backgroundColor: PRIMARY,
      alignItems: 'center', justifyContent: 'center', marginBottom: 20,
      shadowColor: PRIMARY, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
    }}>
      <ActivityIndicator size="large" color={WHITE} />
    </View>
    <Text style={{ fontSize: 16, fontWeight: '700', color: INK }}>{message}</Text>
    <Text style={{ fontSize: 12, color: MUTED, marginTop: 6, letterSpacing: 0.5 }}>SIPOLIN • Polindra</Text>
  </SafeAreaView>
);

// ─── Driver Order Card ────────────────────────────────────────────────────────
const DriverOrderCard = ({ order, onAccept, onComplete, loading, isLast }) => {
  const isAccepted = order.status === 'accepted';
  return (
    <View style={{
      backgroundColor: WHITE, borderRadius: 18, marginBottom: isLast ? 0 : 14,
      shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07, shadowRadius: 12, elevation: 5, overflow: 'hidden',
    }}>
      <View style={{
        backgroundColor: isAccepted ? PRIMARY_LT : '#f8fafc',
        paddingHorizontal: 16, paddingVertical: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: BORDER,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: isAccepted ? PRIMARY : AMBER, marginRight: 8 }} />
          <Text style={{ fontSize: 11, fontWeight: '800', color: isAccepted ? PRIMARY : AMBER, letterSpacing: 0.8 }}>
            {order.type === 'pol_ride' ? 'POL-RIDE' : 'POL-SEND'}
          </Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '900', color: INK }}>{formatIDR(order.price)}</Text>
      </View>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: INK, marginBottom: 14 }} numberOfLines={1}>
          {order.title}
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 18 }}>
          <View style={{ alignItems: 'center', marginRight: 14 }}>
            <Circle size={10} color={PRIMARY} fill={PRIMARY} strokeWidth={0} />
            <View style={{ width: 1.5, height: 28, backgroundColor: '#9FE1CB', marginVertical: 4 }} />
            <MapPin size={12} color={RED} strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1, justifyContent: 'space-between', height: 54 }}>
            <Text style={{ fontSize: 13, color: INK_MID, fontWeight: '600' }} numberOfLines={1}>{order.pickup || '—'}</Text>
            <Text style={{ fontSize: 13, color: INK_MID, fontWeight: '600' }} numberOfLines={1}>{order.destination || '—'}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => isAccepted ? onComplete(order.id) : onAccept(order.id)}
          disabled={!!loading}
          activeOpacity={0.85}
          style={{
            backgroundColor: isAccepted ? GREEN : PRIMARY,
            borderRadius: 13, paddingVertical: 14,
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'row', opacity: loading ? 0.7 : 1,
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

// ─── Customer Dashboard ───────────────────────────────────────────────────────
const CustomerDashboard = ({ user, stats, orders, refreshing, onRefresh, router }) => {
  const firstName = user?.name?.split(' ')[0] ?? 'Mahasiswa';

  // ── Carousel state ──────────────────────────────────────────────────────────
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);

  const onCarouselViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveSlide(viewableItems[0].index ?? 0);
  }, []);

  const carouselViewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  // ── Smart Search state ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    const q = text.toLowerCase();
    const results = FOODS_DATASET.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.resto.toLowerCase().includes(q) ||
        f.tag.includes(q)
    );
    setSearchResults(results);
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} colors={[PRIMARY]} />
      }
      contentContainerStyle={{ paddingBottom: 48, backgroundColor: PAGE_BG }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <View style={S.header}>
        <View style={S.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={S.headerGreeting}>{getGreeting()}, 👋</Text>
            <Text style={S.headerName}>Mau apa nih, {firstName}!</Text>
          </View>
          <View style={S.headerActions}>
            {/* Notification Bell → /notifications */}
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              activeOpacity={0.7}
              style={S.headerIconBtn}
            >
              <Bell size={18} color={INK_MID} strokeWidth={2} />
              {(stats?.unreadNotifications ?? 0) > 0 && <View style={S.notifDot} />}
            </TouchableOpacity>
            {/* Profile Avatar → real profilePicture */}
            <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.85}>
              <Avatar user={user} size={44} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── SMART SEARCH BAR ──────────────────────────────────────── */}
        <View style={[S.searchBar, searchFocused && S.searchBarFocused]}>
          <Search size={16} color={searchFocused ? PRIMARY : MUTED} strokeWidth={2} />
          <TextInput
            style={S.searchInput}
            placeholder="Cari makanan, resto, layanan..."
            placeholderTextColor={MUTED}
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} activeOpacity={0.7}>
              <Text style={{ color: MUTED, fontSize: 18, lineHeight: 20 }}>×</Text>
            </TouchableOpacity>
          )}
          {!searchQuery && (
            <>
              <View style={S.searchDivider} />
              <TouchableOpacity activeOpacity={0.7} style={S.searchFilterBtn}>
                <Text style={S.searchFilterText}>Filter</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── SEARCH RESULTS DROPDOWN ──────────────────────────────── */}
        {searchFocused && searchResults.length > 0 && (
          <View style={S.searchDropdown}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={S.searchDropdownItem}
                onPress={() => {
                  handleSearch('');
                  // TODO: navigate to food detail / order flow
                }}
              >
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: INK }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>{item.resto} · {formatIDR(item.price)}</Text>
                </View>
                <ChevronRight size={14} color={MUTED} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        {searchFocused && searchQuery.length > 0 && searchResults.length === 0 && (
          <View style={[S.searchDropdown, { paddingVertical: 16, alignItems: 'center' }]}>
            <Text style={{ color: MUTED, fontSize: 13 }}>Hasil tidak ditemukan untuk "{searchQuery}"</Text>
          </View>
        )}
      </View>

      {/* ── PROMO CAROUSEL (FlatList pagingEnabled) ─────────────────────── */}
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
            length: SW - 48,
            offset: (SW - 48 + 12) * index,
            index,
          })}
          renderItem={({ item }) => <PromoBannerCard item={item} router={router} />}
        />
        {/* Dot indicators — driven by activeSlide */}
        <View style={S.promoDots}>
          {PROMO_BANNERS.map((item, i) => (
            <View
              key={item.id}
              style={[
                S.promoDot,
                i === activeSlide && S.promoDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* ── SERVICE MENU ──────────────────────────────────────────────────── */}
      <View style={S.card}>
        <SectionHeader title="Layanan" />
        <View style={[S.serviceMenuRow, { justifyContent: 'flex-start', gap: 0 }]}>
          {SERVICE_MENU.map((item) => (
            <ServiceMenuItem
              key={item.id}
              item={item}
              onPress={() => { if (item.route) router.push(item.route); }}
            />
          ))}
        </View>
      </View>

      {/* ── ACTIVE ORDERS ─────────────────────────────────────────────────── */}
      <View style={[S.card, { marginTop: 0 }]}>
        <SectionHeader
          title="Pesanan Aktif"
          action="Lihat Semua"
          onAction={() => router.push('/orders')}
        />
        {orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          orders.map((order, i) => (
            <ActiveOrderCard
              key={order.id}
              order={order}
              isLast={i === orders.length - 1}
              onPress={() => router.push(`/orders/${order.id}`)}
            />
          ))
        )}
      </View>

      {/* ── STATS STRIP — professional metrics ───────────────────────────── */}
      <View style={S.statsStrip}>
        {/* Rata-rata Rating */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Star size={14} color={AMBER} fill={AMBER} strokeWidth={0} />
            <Text style={{ fontSize: 22, fontWeight: '900', color: AMBER, letterSpacing: -0.5 }}>
              {stats?.avgRating ? Number(stats.avgRating).toFixed(1) : '5.0'}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: MUTED, fontWeight: '600', marginTop: 3 }}>Rating Kamu</Text>
        </View>

        <View style={S.statsDivider} />

        {/* Total Order */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Zap size={14} color={PRIMARY} fill={PRIMARY} strokeWidth={0} />
            <Text style={{ fontSize: 22, fontWeight: '900', color: PRIMARY, letterSpacing: -0.5 }}>
              {stats?.totalOrders ?? 0}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: MUTED, fontWeight: '600', marginTop: 3 }}>Total Pesanan</Text>
        </View>

        <View style={S.statsDivider} />

        {/* Total Hemat */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <TrendingUp size={13} color={GREEN} strokeWidth={2.5} />
            <Text style={{ fontSize: 15, fontWeight: '900', color: GREEN, letterSpacing: -0.3 }}>
              {stats?.totalSavings
                ? `${Math.round((stats.totalSavings) / 1000)}rb`
                : '0'}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: MUTED, fontWeight: '600', marginTop: 3 }}>Total Hemat</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// ─── Driver Dashboard ─────────────────────────────────────────────────────────
const DriverDashboard = ({
  user, stats, availableOrders,
  refreshing, onRefresh,
  actionLoading, onAccept, onComplete, router,
}) => {
  const firstName = user?.name?.split(' ')[0] ?? 'Driver';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} colors={[PRIMARY]} />
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={{ backgroundColor: WHITE, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={{ fontSize: 13, color: MUTED, fontWeight: '600', marginBottom: 4 }}>
              Mode Driver · <Text style={{ color: PRIMARY, fontWeight: '700' }}>Online</Text>
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: INK, letterSpacing: -0.8, lineHeight: 30 }}>
              {getGreeting()}, {firstName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              activeOpacity={0.7}
              style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER }}
            >
              <Bell size={18} color={INK_MID} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.85}>
              <Avatar user={user} size={44} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 24, backgroundColor: SURFACE, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8, borderWidth: 1, borderColor: BORDER }}>
          <StatPill label="Total Trip" value={stats?.totalTrips ?? stats?.totalOrders} color={PRIMARY} />
          <View style={{ width: 1, backgroundColor: BORDER, marginVertical: 4 }} />
          <StatPill label="Berjalan"   value={stats?.ordersByStatus?.accepted}          color={AMBER} />
          <View style={{ width: 1, backgroundColor: BORDER, marginVertical: 4 }} />
          <StatPill label="Selesai"    value={stats?.ordersByStatus?.completed}         color={GREEN} />
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: BORDER }} />

      <View style={{ paddingHorizontal: 24, paddingTop: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <SectionHeader title="Order Tersedia" />
          <TouchableOpacity
            onPress={onRefresh}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_LT, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginBottom: 16 }}
          >
            <RefreshCw size={13} color={PRIMARY} strokeWidth={2.5} />
            <Text style={{ color: PRIMARY, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>Perbarui</Text>
          </TouchableOpacity>
        </View>

        {availableOrders.length === 0 ? (
          <View style={{ backgroundColor: WHITE, borderRadius: 20, borderWidth: 1, borderColor: BORDER, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 4 }}>
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: PRIMARY_LT, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <MapPin size={26} color={PRIMARY} strokeWidth={1.8} />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: INK, marginBottom: 6 }}>Belum ada order</Text>
              <Text style={{ fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 20, maxWidth: 240 }}>
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

  const [stats, setStats]                     = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [userOrders, setUserOrders]           = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [actionLoading, setActionLoading]     = useState({});

  const fetchData = useCallback(async () => {
    if (!user?.role) { setLoading(false); return; }
    try {
      const isDriver = user.role === 'driver';
      const [statsRes, ordersRes] = await Promise.all([
        usersAPI.getStats(),
        isDriver ? ordersAPI.getAvailable() : ordersAPI.getAll(),
      ]);

      const statsData = statsRes?.data ?? statsRes ?? { totalOrders: 0, ordersByStatus: { accepted: 0, completed: 0 } };
      setStats(statsData);

      if (isDriver) {
        const d = ordersRes?.data ?? ordersRes;
        setAvailableOrders(Array.isArray(d) ? d : []);
      } else {
        const d = ordersRes?.data ?? ordersRes;
        setUserOrders(Array.isArray(d) ? d.slice(0, 5) : []);
      }
    } catch (err) {
      console.error('[Dashboard] fetchData error:', err);
      setStats({ totalOrders: 0, ordersByStatus: { accepted: 0, completed: 0 } });
      setUserOrders([]);
      setAvailableOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

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

  if (loading || !user?.role) {
    return <LoadingScreen message={!user?.role ? 'Memeriksa akun…' : 'Memuat dashboard…'} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PAGE_BG }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      {user.role === 'driver' ? (
        <DriverDashboard
          user={user} stats={stats} availableOrders={availableOrders}
          refreshing={refreshing} onRefresh={onRefresh}
          actionLoading={actionLoading} onAccept={handleAccept} onComplete={handleComplete}
          router={router}
        />
      ) : (
        <CustomerDashboard
          user={user} stats={stats} orders={userOrders}
          refreshing={refreshing} onRefresh={onRefresh}
          router={router}
        />
      )}
    </SafeAreaView>
  );
}

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // Header
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
  headerGreeting: { fontSize: 12, color: MUTED, fontWeight: '600', marginBottom: 2 },
  headerName: { fontSize: 24, fontWeight: '900', color: INK, letterSpacing: -0.7, lineHeight: 28 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: RED, borderWidth: 1.5, borderColor: WHITE,
  },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f3f4f6', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    gap: 10, borderWidth: 1.5, borderColor: 'transparent',
  },
  searchBarFocused: {
    borderColor: PRIMARY, backgroundColor: WHITE,
    shadowColor: PRIMARY, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  searchInput: { flex: 1, fontSize: 14, color: INK, fontWeight: '500', padding: 0 },
  searchDivider: { width: 1, height: 16, backgroundColor: '#d1d5db' },
  searchFilterBtn: { paddingHorizontal: 2 },
  searchFilterText: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  searchDropdown: {
    marginTop: 6, backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: '#0f172a', shadowOpacity: 0.08, shadowRadius: 12, elevation: 6,
    overflow: 'hidden',
  },
  searchDropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },

  // Carousel
  promoBannerCard: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
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
    width: '60%',
  },
  promoBannerInner: {
    padding: 18,
    gap: 4,
  },
  promoBannerCircle1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)', right: -40, top: -50,
  },
  promoBannerCircle2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)', right: 40, bottom: -30,
  },
  promoBannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, marginBottom: 4,
  },
  promoBannerBadgeText: { color: INK, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  promoBannerTitle: { color: WHITE, fontSize: 18, fontWeight: '900', letterSpacing: -0.5, lineHeight: 23 },
  promoBannerSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: '500', lineHeight: 17, marginBottom: 10 },
  promoBannerBtn: {
    alignSelf: 'flex-start', backgroundColor: WHITE,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  promoBannerBtnText: { fontSize: 12, fontWeight: '800', color: INK },
  promoDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 6 },
  promoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db' },
  promoDotActive: { width: 22, backgroundColor: PRIMARY },

  // Service Menu — Gojek style
  serviceMenuRow: { flexDirection: 'row' },
  serviceMenuItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  serviceMenuCard: {
    width: 70, height: 70,
    borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  serviceMenuGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  serviceMenuBadge: {
    position: 'absolute',
    top: 5, left: 5,
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
  },
  serviceMenuBadgeText: { color: WHITE, fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },
  serviceMenuLabel: { fontSize: 12, fontWeight: '700', color: INK_MID, textAlign: 'center', letterSpacing: 0.1 },

  // Card
  card: {
    backgroundColor: WHITE, marginHorizontal: 16, marginBottom: 14,
    borderRadius: 20, padding: 20,
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: BORDER,
  },

  // Active Order Card
  activeOrderCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER, gap: 12,
  },
  activeOrderIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  activeOrderTitle: { fontSize: 14, fontWeight: '700', color: INK },
  activeOrderTime: { fontSize: 12, color: MUTED, fontWeight: '500' },
  activeOrderPrice: { fontSize: 12, color: PRIMARY, fontWeight: '700' },

  // Stats
  statsStrip: {
    flexDirection: 'row', backgroundColor: WHITE,
    marginHorizontal: 16, borderRadius: 18,
    paddingVertical: 18, paddingHorizontal: 8,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statsDivider: { width: 1, backgroundColor: BORDER, marginVertical: 4 },

  // Empty
  emptyOrders: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 },
  emptyCircleOuter: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#e6f7ee', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyCircleMid: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#9FE1CB', alignItems: 'center', justifyContent: 'center' },
  emptyCircleInner: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: INK, marginBottom: 8, letterSpacing: -0.3 },
  emptySubtitle: { fontSize: 13.5, color: MUTED, textAlign: 'center', lineHeight: 21, maxWidth: 250, marginBottom: 16 },
  emptyTipRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  emptyTip: { fontSize: 12, fontWeight: '600' },
});