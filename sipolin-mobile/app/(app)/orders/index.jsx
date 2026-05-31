import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bike,
  Box,
  CalendarClock,
  ChevronRight,
  Circle,
  MapPin,
  PackageOpen,
  RefreshCw,
} from 'lucide-react-native';

import { ordersAPI, extractApiList } from '../../../services/api';

const PRIMARY = '#00AA5B';
const PRIMARY_DK = '#007A3E';
const PRIMARY_LT = '#E6F7EE';
const INK = '#0f172a';
const INK_MID = '#334155';
const MUTED = '#94a3b8';
const BORDER = '#e5e7eb';
const PAGE_BG = '#f4f6f8';
const WHITE = '#ffffff';
const AMBER = '#d97706';
const BLUE = '#2563eb';
const GREEN = '#16a34a';
const RED = '#dc2626';

const normalizeStatus = (status) => String(status || 'pending').toLowerCase();

const formatIDR = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (dateString) => {
  if (!dateString) return 'Baru saja';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Baru saja';

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTypeMeta = (type) => {
  if (type === 'pol_send') {
    return {
      label: 'Pol-Send',
      icon: Box,
      color: BLUE,
      bg: '#eff6ff',
      desc: 'Pengiriman barang',
    };
  }

  return {
    label: 'Pol-Ride',
    icon: Bike,
    color: PRIMARY,
    bg: PRIMARY_LT,
    desc: 'Antar jemput',
  };
};

const getStatusMeta = (statusRaw) => {
  const status = normalizeStatus(statusRaw);

  const map = {
    pending: {
      label: 'Menunggu Driver',
      color: AMBER,
      bg: '#fffbeb',
    },
    accepted: {
      label: 'Diproses Driver',
      color: BLUE,
      bg: '#eff6ff',
    },
    completed: {
      label: 'Selesai',
      color: GREEN,
      bg: '#f0fdf4',
    },
    cancelled: {
      label: 'Dibatalkan',
      color: RED,
      bg: '#fef2f2',
    },
  };

  return map[status] || {
    label: status || 'Status',
    color: MUTED,
    bg: '#f8fafc',
  };
};

const EmptyState = ({ onRefresh }) => (
  <View style={S.emptyWrap}>
    <View style={S.emptyIcon}>
      <PackageOpen size={34} color={PRIMARY} strokeWidth={1.8} />
    </View>
    <Text style={S.emptyTitle}>Belum ada pesanan</Text>
    <Text style={S.emptySubtitle}>
      Pesanan yang kamu buat atau ambil nanti akan muncul di sini.
    </Text>
    <TouchableOpacity activeOpacity={0.82} onPress={onRefresh} style={S.emptyButton}>
      <RefreshCw size={16} color={WHITE} strokeWidth={2.5} />
      <Text style={S.emptyButtonText}>Muat Ulang</Text>
    </TouchableOpacity>
  </View>
);

const OrderCard = ({ item, onPress }) => {
  const type = getTypeMeta(item.type);
  const status = getStatusMeta(item.status);
  const TypeIcon = type.icon;

  const pickup = item.pickup || item.pickupLocation || 'Lokasi jemput belum tersedia';
  const destination = item.destination || item.dropoffLocation || 'Tujuan belum tersedia';

  const partnerName =
    item.driver?.name ||
    item.customer?.name ||
    null;

  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={S.orderCard}>
      <View style={S.cardTop}>
        <View style={[S.typeBadge, { backgroundColor: type.bg }]}>
          <TypeIcon size={15} color={type.color} strokeWidth={2.4} />
          <Text style={[S.typeBadgeText, { color: type.color }]}>{type.label}</Text>
        </View>

        <Text style={S.priceText}>{formatIDR(item.price)}</Text>
      </View>

      <Text style={S.orderTitle} numberOfLines={1}>
        {item.title || type.label}
      </Text>

      <View style={S.routeBox}>
        <View style={S.routeIconCol}>
          <Circle size={11} color={PRIMARY} fill={PRIMARY} strokeWidth={0} />
          <View style={S.routeLine} />
          <MapPin size={15} color={RED} strokeWidth={2.2} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={S.routeText} numberOfLines={1}>{pickup}</Text>
          <Text style={[S.routeText, { marginTop: 17 }]} numberOfLines={1}>
            {destination}
          </Text>
        </View>
      </View>

      <View style={S.metaRow}>
        <View style={{ flex: 1 }}>
          <View style={S.dateRow}>
            <CalendarClock size={13} color={MUTED} strokeWidth={2} />
            <Text style={S.dateText}>{formatDate(item.createdAt)}</Text>
          </View>

          {partnerName && (
            <Text style={S.partnerText} numberOfLines={1}>
              Terkait dengan: {partnerName}
            </Text>
          )}
        </View>

        <View style={[S.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[S.statusText, { color: status.color }]}>{status.label}</Text>
        </View>

        <ChevronRight size={18} color={MUTED} strokeWidth={2.3} />
      </View>
    </TouchableOpacity>
  );
};

export default function OrdersListScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [orders]);

  const fetchOrders = useCallback(async () => {
    try {
      const result = await ordersAPI.list();
      const list = extractApiList(result);
      setOrders(list);
    } catch (error) {
      console.error('[OrdersList] fetchOrders:', error?.response?.data || error?.message || error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (loading) {
    return (
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
        <View style={S.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={S.loadingText}>Memuat pesanan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />

      <View style={S.header}>
        <TouchableOpacity activeOpacity={0.75} onPress={() => router.back()} style={S.backBtn}>
          <ArrowLeft size={20} color={INK} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={S.headerTitle}>Pesanan</Text>
          <Text style={S.headerSubtitle}>Pantau semua order kamu di sini</Text>
        </View>

        <TouchableOpacity activeOpacity={0.75} onPress={onRefresh} style={S.refreshBtn}>
          <RefreshCw size={18} color={PRIMARY} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedOrders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={sortedOrders.length === 0 ? S.emptyList : S.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} tintColor={PRIMARY} />
        }
        ListEmptyComponent={<EmptyState onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <OrderCard
            item={item}
            onPress={() => router.push(`/orders/${item.id}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: MUTED,
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: INK,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  headerSubtitle: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 110,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 110,
  },
  orderCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  cardTop: {
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 15,
    backgroundColor: '#fbfdff',
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    gap: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  priceText: {
    color: INK,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  orderTitle: {
    paddingHorizontal: 18,
    paddingTop: 17,
    color: INK,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  routeBox: {
    paddingHorizontal: 18,
    paddingTop: 16,
    flexDirection: 'row',
  },
  routeIconCol: {
    width: 27,
    alignItems: 'center',
    marginRight: 10,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#a7f3d0',
    marginVertical: 5,
    borderRadius: 2,
  },
  routeText: {
    color: INK_MID,
    fontSize: 14,
    fontWeight: '800',
  },
  metaRow: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
  },
  partnerText: {
    color: INK_MID,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: PRIMARY_LT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    color: INK,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: MUTED,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 18,
  },
  emptyButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '900',
  },
});
