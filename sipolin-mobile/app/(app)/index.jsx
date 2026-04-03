import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, ordersAPI, notificationsAPI } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin,
  Users,
  Package,
  DollarSign,
  Bell,
  RefreshCw,
  CheckCircle,
  ClipboardList,
  Clock,
  ThumbsUp,
  BadgeCheck,
  ChevronRight,
  Zap,
} from 'lucide-react-native';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount ?? 0);

// ─── Design Tokens ────────────────────────────────────────────────────────────

const C = {
  // Royal Blue palette (Polindra)
  deepBlue:    '#071E5C',
  royalBlue:   '#0E3A8C',
  midBlue:     '#1A5AD8',
  lightBlue:   '#3B7BFF',
  // Accents
  orange:      '#E8621A',
  orangeLight: '#FFF3EC',
  orangeBorder:'#FFD4B8',
  green:       '#059669',
  greenLight:  '#ECFDF5',
  amber:       '#D97706',
  amberLight:  '#FFF7E6',
  red:         '#FF4757',
  // Surfaces
  bg:          '#EEF2FF',
  surface:     '#FFFFFF',
  border:      '#EEF0F7',
  // Typography
  ink:         '#0D1B3E',
  muted:       '#6B7A9E',
  // Card shadow
  shadow:      '#0E3A8C',
};

const card = {
  backgroundColor: C.surface,
  borderRadius: 22,
  shadowColor: C.shadow,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 16,
  elevation: 7,
};

const statCard = {
  flex: 1,
  backgroundColor: C.surface,
  borderRadius: 18,
  padding: 14,
  shadowColor: C.shadow,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 5,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({});     // tracks per-order loading state

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    // Jika role belum ada, jangan ambil data API, tapi matikan loading-nya
    if (!user?.role) {
      setLoading(false);
      return;
    }

    try {
      // Drivers have a dedicated stats endpoint; customers use the shared one.
      // usersAPI.getStats()       → GET /api/users/stats
      //   returns: { totalOrders, ordersByStatus: { pending, accepted, completed }, unreadNotifications }
      // usersAPI.getDriverStats() → GET /api/users/driver-stats
      const [statsRes, ordersRes] = await Promise.all([
        user.role === 'driver' ? usersAPI.getDriverStats() : usersAPI.getStats(),
        user.role === 'driver'
          ? ordersAPI.getAvailableOrders()   // GET /api/orders/available
          : ordersAPI.list({ limit: 5 }),
      ]);

      setStats(statsRes.data);

      if (user.role === 'driver') {
        setAvailableOrders(ordersRes.data ?? []);
      } else {
        setUserOrders(ordersRes.data ?? []);
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching data:', error);
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

  // ── Order Actions ──────────────────────────────────────────────────────────

  const handleAcceptOrder = async (orderId) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: 'accepting' }));
    try {
      await ordersAPI.acceptOrder(orderId);
      await fetchData();
    } catch (error) {
      console.error('[Dashboard] Accept order failed:', error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  const handleCompleteOrder = async (orderId) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: 'completing' }));
    try {
      await ordersAPI.completeOrder(orderId);
      await fetchData();
    } catch (error) {
      console.error('[Dashboard] Complete order failed:', error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  // ── Status Badge ───────────────────────────────────────────────────────────

  const StatusBadge = ({ status }) => {
    const config = {
      pending:   { bg: C.amberLight,  text: C.amber,   label: 'Menunggu' },
      accepted:  { bg: '#EEF2FF',     text: C.midBlue, label: 'Diterima' },
      completed: { bg: C.greenLight,  text: C.green,   label: 'Selesai'  },
      cancelled: { bg: '#FEF2F2',     text: '#DC2626', label: 'Dibatal'  },
    };
    const c = config[status] ?? config.pending;
    return (
      <View style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
        <Text style={{ color: c.text, fontSize: 11, fontWeight: '700' }}>{c.label}</Text>
      </View>
    );
  };

  // ─── Shared Header Component ───────────────────────────────────────────────

  const DashboardHeader = ({ isDriver }) => (
    <LinearGradient
      colors={[C.deepBlue, C.royalBlue, C.midBlue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingTop: 20, paddingBottom: 80, paddingHorizontal: 24, overflow: 'hidden' }}
    >
      {/* ── Decorative background bubbles ── */}
      <View style={{ position: 'absolute', top: -50, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)' }} />
      <View style={{ position: 'absolute', top: 30, right: 70, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)' }} />
      <View style={{ position: 'absolute', bottom: 10, left: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.04)' }} />

      {/* ── Logo + Wordmark ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 22 }}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={{
            width: 38, height: 38, borderRadius: 11, marginRight: 10,
            borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
          }}
        />
        <View>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: '700', letterSpacing: 2.5 }}>POLITEKNIK NEGERI INDRAMAYU</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.8, marginTop: 1 }}>SIPOLIN</Text>
        </View>
        {isDriver && (
          <View style={{ marginLeft: 10, backgroundColor: '#4ADE80', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: '#064E3B', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>DRIVER</Text>
          </View>
        )}
      </View>

      {/* ── Greeting row ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '500' }}>
            {isDriver ? 'Mode Driver Aktif' : 'Selamat datang kembali,'}
          </Text>
          <Text
            style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 3, letterSpacing: -0.5 }}
            numberOfLines={1}
          >
            {isDriver ? `${user?.name || 'Driver'} 🚗` : `${user?.name || 'User'} 👋`}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ADE80', marginRight: 7 }} />
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
              {isDriver ? 'Siap menerima tebengan' : 'Online • Siap Berangkat'}
            </Text>
          </View>
        </View>

        {/* Bell icon */}
        <TouchableOpacity
          onPress={() => router.push('/(app)/notifications')}
          style={{
            backgroundColor: 'rgba(255,255,255,0.14)',
            borderRadius: 14, padding: 12,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
          }}
          accessibilityLabel="Notifications"
        >
          <Bell size={20} color="#FFFFFF" />
          {(stats?.unreadNotifications ?? 0) > 0 && (
            <View style={{
              position: 'absolute', top: 7, right: 7,
              backgroundColor: C.red, borderRadius: 8,
              minWidth: 16, height: 16,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1.5, borderColor: C.royalBlue,
            }}>
              <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>
                {stats.unreadNotifications > 9 ? '9+' : stats.unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  // ─── Customer Dashboard ────────────────────────────────────────────────────

  const CustomerDashboard = () => (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.royalBlue} />
      }
      style={{ flex: 1, backgroundColor: C.bg }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <DashboardHeader isDriver={false} />

      {/* ── QUICK ACTIONS (floating card, overlaps header) ── */}
      <View style={{
        marginTop: -52, marginHorizontal: 20,
        backgroundColor: C.surface, borderRadius: 24, padding: 20,
        shadowColor: C.shadow, shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.13, shadowRadius: 22, elevation: 12,
      }}>
        <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 18 }}>
          LAYANAN KAMI
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

          {/* Pol-Ride */}
          <TouchableOpacity
            onPress={() => router.push('/(app)/orders/create?type=TEBENGAN')}
            style={{ alignItems: 'center', flex: 1 }}
            activeOpacity={0.72}
          >
            <View style={{
              width: 62, height: 62, borderRadius: 19,
              backgroundColor: '#EEF2FF',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 9,
              borderWidth: 1.5, borderColor: '#C7D4FF',
            }}>
              <Users size={27} color={C.royalBlue} />
            </View>
            <Text style={{ color: C.ink, fontSize: 12, fontWeight: '700' }}>Pol-Ride</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>Transportasi</Text>
          </TouchableOpacity>

          {/* Vertical divider */}
          <View style={{ width: 1, backgroundColor: C.border, marginHorizontal: 6, marginVertical: 4 }} />

          {/* Pol-Send */}
          <TouchableOpacity
            onPress={() => router.push('/(app)/orders/create?type=JASTIP')}
            style={{ alignItems: 'center', flex: 1 }}
            activeOpacity={0.72}
          >
            <View style={{
              width: 62, height: 62, borderRadius: 19,
              backgroundColor: C.orangeLight,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 9,
              borderWidth: 1.5, borderColor: C.orangeBorder,
            }}>
              <Package size={27} color={C.orange} />
            </View>
            <Text style={{ color: C.ink, fontSize: 12, fontWeight: '700' }}>Pol-Send</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>Jastip / Barang</Text>
          </TouchableOpacity>

          {/* Vertical divider */}
          <View style={{ width: 1, backgroundColor: C.border, marginHorizontal: 6, marginVertical: 4 }} />

          {/* Poli-Pay */}
          <TouchableOpacity
            onPress={() => router.push('/(app)/profile')}
            style={{ alignItems: 'center', flex: 1 }}
            activeOpacity={0.72}
          >
            <View style={{
              width: 62, height: 62, borderRadius: 19,
              backgroundColor: C.greenLight,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 9,
              borderWidth: 1.5, borderColor: '#A7F3D0',
            }}>
              <DollarSign size={27} color={C.green} />
            </View>
            <Text style={{ color: C.ink, fontSize: 12, fontWeight: '700' }}>Poli-Pay</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>Saldo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── STATS GRID ── */}
      <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
        <Text style={{ color: C.ink, fontSize: 16, fontWeight: '800', letterSpacing: -0.3, marginBottom: 14 }}>
          Ringkasan Tebengan
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>

          {/* Total */}
          <View style={{ ...statCard, borderTopWidth: 3, borderTopColor: C.midBlue }}>
            <ClipboardList size={17} color={C.midBlue} />
            <Text style={{ color: C.ink, fontSize: 26, fontWeight: '900', marginTop: 8, letterSpacing: -1 }}>
              {stats?.totalOrders ?? 0}
            </Text>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', marginTop: 3 }}>Total</Text>
          </View>

          {/* Pending */}
          <View style={{ ...statCard, borderTopWidth: 3, borderTopColor: '#F59E0B' }}>
            <Clock size={17} color="#F59E0B" />
            <Text style={{ color: C.amber, fontSize: 26, fontWeight: '900', marginTop: 8, letterSpacing: -1 }}>
              {stats?.ordersByStatus?.pending ?? 0}
            </Text>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', marginTop: 3 }}>Menunggu</Text>
          </View>

          {/* Accepted */}
          <View style={{ ...statCard, borderTopWidth: 3, borderTopColor: C.lightBlue }}>
            <ThumbsUp size={17} color={C.lightBlue} />
            <Text style={{ color: C.midBlue, fontSize: 26, fontWeight: '900', marginTop: 8, letterSpacing: -1 }}>
              {stats?.ordersByStatus?.accepted ?? 0}
            </Text>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', marginTop: 3 }}>Diterima</Text>
          </View>

          {/* Completed */}
          <View style={{ ...statCard, borderTopWidth: 3, borderTopColor: '#10B981' }}>
            <BadgeCheck size={17} color="#10B981" />
            <Text style={{ color: C.green, fontSize: 26, fontWeight: '900', marginTop: 8, letterSpacing: -1 }}>
              {stats?.ordersByStatus?.completed ?? 0}
            </Text>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', marginTop: 3 }}>Selesai</Text>
          </View>
        </View>
      </View>

      {/* ── ACTIVE ORDER CARD ── */}
      {userOrders.length > 0 && (
        <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ color: C.ink, fontSize: 16, fontWeight: '800', letterSpacing: -0.3 }}>Tebengan Aktif</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.orangeLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
              <Zap size={11} color={C.orange} />
              <Text style={{ color: C.orange, fontSize: 11, fontWeight: '800', marginLeft: 4 }}>Live</Text>
            </View>
          </View>

          {userOrders.slice(0, 1).map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => router.push(`/(app)/orders/${order.id}`)}
              activeOpacity={0.9}
              style={{ ...card, overflow: 'hidden' }}
            >
              {/* Gradient ticket header */}
              <LinearGradient
                colors={[C.deepBlue, C.midBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>ORDER AKTIF</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginTop: 3 }} numberOfLines={1}>
                    {order.title}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <StatusBadge status={order.status} />
                  <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{order.type}</Text>
                </View>
              </LinearGradient>

              {/* Ticket notch divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: -1 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: C.bg, marginLeft: -8 }} />
                <View style={{ flex: 1, borderTopWidth: 1.5, borderTopColor: C.border, borderStyle: 'dashed', marginHorizontal: 4 }} />
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: C.bg, marginRight: -8 }} />
              </View>

              {/* Route + Price body */}
              <View style={{ padding: 16 }}>
                {/* Route timeline */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
                  <View style={{ alignItems: 'center', marginRight: 14, paddingTop: 3 }}>
                    <View style={{ width: 11, height: 11, borderRadius: 5.5, backgroundColor: C.midBlue, borderWidth: 2, borderColor: '#D1D9F5' }} />
                    <View style={{ width: 2, height: 22, backgroundColor: '#D1D9F5', marginVertical: 3 }} />
                    <View style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: C.orange, borderWidth: 2, borderColor: C.orangeLight }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>JEMPUT</Text>
                      <Text style={{ color: C.ink, fontSize: 13, fontWeight: '600', marginTop: 3 }} numberOfLines={1}>
                        {order.pickup || '—'}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>TUJUAN</Text>
                      <Text style={{ color: C.ink, fontSize: 13, fontWeight: '600', marginTop: 3 }} numberOfLines={1}>
                        {order.destination || '—'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Price + Action */}
                {order.price != null && (
                  <View style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    borderTopWidth: 1, borderTopColor: C.border, paddingTop: 14, marginTop: 2,
                  }}>
                    <View>
                      <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600' }}>Total Bayar</Text>
                      <Text style={{ color: C.royalBlue, fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginTop: 2 }}>
                        {formatIDR(order.price)}
                      </Text>
                    </View>

                    {order.status === 'accepted' && (
                      <TouchableOpacity
                        onPress={() => handleCompleteOrder(order.id)}
                        disabled={!!actionLoading[order.id]}
                        activeOpacity={0.82}
                        style={{ overflow: 'hidden', borderRadius: 14 }}
                      >
                        <LinearGradient
                          colors={[C.royalBlue, C.midBlue]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{ paddingHorizontal: 20, paddingVertical: 13, flexDirection: 'row', alignItems: 'center' }}
                        >
                          {actionLoading[order.id] === 'completing' ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <CheckCircle size={15} color="#FFFFFF" />
                              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginLeft: 7 }}>
                                Selesaikan
                              </Text>
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── ALL ORDERS LIST ── */}
      <View style={{ paddingHorizontal: 20, marginTop: 26, marginBottom: 36 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ color: C.ink, fontSize: 16, fontWeight: '800', letterSpacing: -0.3 }}>Tebengan Kamu</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/orders')}>
            <Text style={{ color: C.midBlue, fontSize: 13, fontWeight: '600' }}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {userOrders.length === 0 ? (
          <View style={{
            backgroundColor: C.surface, borderRadius: 22, padding: 32, alignItems: 'center',
            shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07,
            shadowRadius: 12, elevation: 4,
          }}>
            <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <ClipboardList size={25} color={C.midBlue} />
            </View>
            <Text style={{ color: C.ink, fontSize: 15, fontWeight: '700', textAlign: 'center' }}>Belum ada tebengan</Text>
            <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', marginTop: 7, lineHeight: 20 }}>
              Buat tebengan pertamamu dan mulai perjalanan bersama!
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/orders/create')}
              activeOpacity={0.82}
              style={{ overflow: 'hidden', borderRadius: 14, marginTop: 20 }}
            >
              <LinearGradient
                colors={[C.royalBlue, C.midBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingHorizontal: 28, paddingVertical: 13 }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>+ Buat Tebengan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          userOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => router.push(`/(app)/orders/${order.id}`)}
              activeOpacity={0.82}
              style={{
                backgroundColor: C.surface, borderRadius: 18, padding: 16,
                marginBottom: 10, flexDirection: 'row', alignItems: 'center',
                shadowColor: C.shadow, shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.07, shadowRadius: 10, elevation: 4,
                borderLeftWidth: 4, borderLeftColor: C.midBlue,
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ color: C.ink, fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
                  {order.title}
                </Text>
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 4, fontWeight: '500' }}>
                  {order.type}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 7 }}>
                <Text style={{ color: C.midBlue, fontSize: 14, fontWeight: '800' }}>
                  {formatIDR(order.price)}
                </Text>
                <StatusBadge status={order.status} />
              </View>
              <ChevronRight size={16} color={C.muted} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );

  // ─── Driver Dashboard ──────────────────────────────────────────────────────

  const DriverDashboard = () => (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.royalBlue} />
      }
      style={{ flex: 1, backgroundColor: C.bg }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <DashboardHeader isDriver={true} />

      {/* ── DRIVER STATS (floating card, overlaps header) ── */}
      <View style={{
        marginTop: -52, marginHorizontal: 20,
        backgroundColor: C.surface, borderRadius: 24, padding: 20,
        shadowColor: C.shadow, shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.13, shadowRadius: 22, elevation: 12,
      }}>
        <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 18 }}>
          STATISTIK KAMU
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

          {/* Total */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: C.royalBlue, fontSize: 30, fontWeight: '900', letterSpacing: -1 }}>
              {stats?.totalOrders ?? 0}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <ClipboardList size={12} color={C.muted} />
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>Total</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={{ width: 1, backgroundColor: C.border, marginVertical: 4 }} />

          {/* Diterima */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: C.midBlue, fontSize: 30, fontWeight: '900', letterSpacing: -1 }}>
              {stats?.ordersByStatus?.accepted ?? 0}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <ThumbsUp size={12} color={C.muted} />
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>Diterima</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={{ width: 1, backgroundColor: C.border, marginVertical: 4 }} />

          {/* Selesai */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: C.green, fontSize: 30, fontWeight: '900', letterSpacing: -1 }}>
              {stats?.ordersByStatus?.completed ?? 0}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <BadgeCheck size={12} color={C.muted} />
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>Selesai</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── AVAILABLE ORDERS ── */}
      <View style={{ paddingHorizontal: 20, marginTop: 28, marginBottom: 36 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: C.ink, fontSize: 16, fontWeight: '800', letterSpacing: -0.3 }}>Tebengan Tersedia</Text>
          <TouchableOpacity
            onPress={onRefresh}
            style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
            }}
            accessibilityLabel="Refresh orders"
          >
            <RefreshCw size={13} color={C.midBlue} />
            <Text style={{ color: C.midBlue, fontSize: 12, fontWeight: '700', marginLeft: 5 }}>Perbarui</Text>
          </TouchableOpacity>
        </View>

        {availableOrders.length === 0 ? (
          <View style={{
            backgroundColor: C.surface, borderRadius: 22, padding: 34, alignItems: 'center',
            shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07,
            shadowRadius: 12, elevation: 4,
          }}>
            <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <MapPin size={25} color={C.midBlue} />
            </View>
            <Text style={{ color: C.ink, fontSize: 15, fontWeight: '700', textAlign: 'center' }}>
              Belum ada tebengan
            </Text>
            <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', marginTop: 7, lineHeight: 20 }}>
              Tebengan baru akan muncul di sini secara otomatis.
            </Text>
          </View>
        ) : (
          availableOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => router.push(`/(app)/orders/${order.id}`)}
              activeOpacity={0.9}
              style={{ ...card, overflow: 'hidden', marginBottom: 16 }}
            >
              {/* Ticket header row */}
              <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>
                    {order.type?.toUpperCase() || 'TEBENGAN'}
                  </Text>
                  <Text style={{ color: C.ink, fontSize: 15, fontWeight: '800', marginTop: 4 }} numberOfLines={1}>
                    {order.title}
                  </Text>
                </View>
                {/* Price chip */}
                <View style={{ backgroundColor: '#EEF2FF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7 }}>
                  <Text style={{ color: C.royalBlue, fontSize: 15, fontWeight: '900' }}>
                    {formatIDR(order.price)}
                  </Text>
                </View>
              </View>

              {/* Ticket notch divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: -1 }}>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: C.bg, marginLeft: -7 }} />
                <View style={{ flex: 1, borderTopWidth: 1.5, borderTopColor: C.border, borderStyle: 'dashed', marginHorizontal: 4 }} />
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: C.bg, marginRight: -7 }} />
              </View>

              {/* Route + CTA */}
              <View style={{ padding: 16 }}>
                {/* Route timeline */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 }}>
                  <View style={{ alignItems: 'center', marginRight: 14, paddingTop: 3 }}>
                    <View style={{ width: 11, height: 11, borderRadius: 5.5, backgroundColor: C.midBlue, borderWidth: 2, borderColor: '#D1D9F5' }} />
                    <View style={{ width: 2, height: 24, backgroundColor: '#D1D9F5', marginVertical: 3 }} />
                    <View style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: C.orange, borderWidth: 2, borderColor: C.orangeLight }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>JEMPUT</Text>
                      <Text style={{ color: C.ink, fontSize: 13, fontWeight: '600', marginTop: 3 }} numberOfLines={1}>
                        {order.pickup || '—'}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>TUJUAN</Text>
                      <Text style={{ color: C.ink, fontSize: 13, fontWeight: '600', marginTop: 3 }} numberOfLines={1}>
                        {order.destination || '—'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Accept Button */}
                <TouchableOpacity
                  onPress={() => handleAcceptOrder(order.id)}
                  disabled={!!actionLoading[order.id]}
                  activeOpacity={0.82}
                  style={{ overflow: 'hidden', borderRadius: 15 }}
                >
                  <LinearGradient
                    colors={[C.deepBlue, C.royalBlue, C.midBlue]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                  >
                    {actionLoading[order.id] === 'accepting' ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <ThumbsUp size={17} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginLeft: 9 }}>
                          Ambil Tebengan
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );

  // ─── Guards ────────────────────────────────────────────────────────────────

  if (loading || !user?.role) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <LinearGradient
          colors={[C.deepBlue, C.midBlue]}
          style={{ width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
        </LinearGradient>
        <Text style={{ color: C.ink, fontSize: 15, fontWeight: '700' }}>
          {!user?.role ? 'Memeriksa akun…' : 'Memuat dashboard…'}
        </Text>
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>SIPOLIN • Polindra</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      {user.role === 'driver' ? <DriverDashboard /> : <CustomerDashboard />}
    </SafeAreaView>
  );
}
