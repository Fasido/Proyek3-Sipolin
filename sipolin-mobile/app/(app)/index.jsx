import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
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
} from 'lucide-react-native';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount ?? 0);

// ─── Main Component ──────────────────────────────────────────────────────────

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
    // ... sisa kode fetching lo ...
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
      pending:    { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      accepted:   { bg: 'bg-blue-100',   text: 'text-blue-700'   },
      completed:  { bg: 'bg-green-100',  text: 'text-green-700'  },
      cancelled:  { bg: 'bg-red-100',    text: 'text-red-700'    },
    };
    const { bg, text } = config[status] ?? config.pending;
    const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '—';

    return (
      <View className={`rounded-full px-3 py-1 ${bg}`}>
        <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
      </View>
    );
  };

  // ─── Customer Dashboard ────────────────────────────────────────────────────

  const CustomerDashboard = () => (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      className="flex-1 bg-gray-50"
    >
      {/* Header */}
      <LinearGradient
        colors={['#1D4ED8', '#2563EB', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-6 pb-10 px-6 rounded-b-[30px]"
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white/70 text-sm">Welcome back,</Text>
            <Text className="text-white text-2xl font-bold">{user?.name || 'User'}</Text>
          </View>
          {/* Bell with unread badge sourced from stats.unreadNotifications */}
          <TouchableOpacity
            onPress={() => router.push('/(app)/notifications')}
            className="bg-white/20 rounded-full p-3 relative"
            accessibilityLabel="Notifications"
          >
            <Bell size={20} color="#FFFFFF" />
            {(stats?.unreadNotifications ?? 0) > 0 && (
              <View className="absolute top-1 right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                <Text className="text-white text-[9px] font-bold">
                  {stats.unreadNotifications > 9 ? '9+' : stats.unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push('/(app)/orders/create?type=TEBENGAN')}
            className="flex-1 bg-white rounded-xl p-4 items-start"
          >
            <Users size={24} color="#1D4ED8" />
            <Text className="font-semibold text-gray-900 text-sm mt-2">Pol-Ride</Text>
            <Text className="text-xs text-gray-500">Transportasi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(app)/orders/create?type=JASTIP')}
            className="flex-1 bg-white rounded-xl p-4 items-start"
          >
            <Package size={24} color="#FF6B35" />
            <Text className="font-semibold text-gray-900 text-sm mt-2">Pol-Send</Text>
            <Text className="text-xs text-gray-500">Jastip / Barang</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(app)/profile')}
            className="flex-1 bg-white rounded-xl p-4 items-start"
          >
            <DollarSign size={24} color="#22C55E" />
            <Text className="font-semibold text-gray-900 text-sm mt-2">Poli-Pay</Text>
            <Text className="text-xs text-gray-500">Saldo</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── Stats Summary: sourced from GET /api/users/stats ── */}
      {/* Shape: { totalOrders, ordersByStatus: { pending, accepted, completed }, unreadNotifications } */}
      <View className="px-6 pt-5 pb-1">
        <View className="flex-row gap-2">
          {/* Total Tebengan */}
          <View className="flex-1 bg-white rounded-xl p-3 items-center">
            <ClipboardList size={18} color="#1D4ED8" />
            <Text className="text-gray-900 font-bold text-lg mt-1">
              {stats?.totalOrders ?? 0}
            </Text>
            <Text className="text-gray-400 text-[10px] text-center">Total Tebengan</Text>
          </View>

          {/* Pending */}
          <View className="flex-1 bg-white rounded-xl p-3 items-center">
            <Clock size={18} color="#EAB308" />
            <Text className="text-yellow-600 font-bold text-lg mt-1">
              {stats?.ordersByStatus?.pending ?? 0}
            </Text>
            <Text className="text-gray-400 text-[10px]">Menunggu</Text>
          </View>

          {/* Accepted */}
          <View className="flex-1 bg-white rounded-xl p-3 items-center">
            <ThumbsUp size={18} color="#2563EB" />
            <Text className="text-blue-600 font-bold text-lg mt-1">
              {stats?.ordersByStatus?.accepted ?? 0}
            </Text>
            <Text className="text-gray-400 text-[10px]">Diterima</Text>
          </View>

          {/* Completed */}
          <View className="flex-1 bg-white rounded-xl p-3 items-center">
            <BadgeCheck size={18} color="#16A34A" />
            <Text className="text-green-600 font-bold text-lg mt-1">
              {stats?.ordersByStatus?.completed ?? 0}
            </Text>
            <Text className="text-gray-400 text-[10px]">Selesai</Text>
          </View>
        </View>
      </View>
      {/* Tebengan Aktif Card – first order with status pending or accepted */}
      {userOrders.length > 0 && (
        <View className="px-6 pt-4 pb-2">
          <Text className="text-gray-900 font-bold text-lg mb-3">Tebengan Aktif</Text>
          {userOrders.slice(0, 1).map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => router.push(`/(app)/orders/${order.id}`)}
              className="bg-white rounded-xl p-4 border-l-4 border-blue-600"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-2">
                  <Text className="font-bold text-gray-900 text-base">{order.title}</Text>
                  <Text className="text-xs text-gray-500 mt-1">{order.type}</Text>
                </View>
                <StatusBadge status={order.status} />
              </View>

              <View className="gap-2 mb-3">
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color="#1D4ED8" />
                  <Text className="text-xs text-gray-600 flex-1" numberOfLines={1}>{order.pickup}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color="#FF6B35" />
                  <Text className="text-xs text-gray-600 flex-1" numberOfLines={1}>{order.destination}</Text>
                </View>
              </View>

              {order.price != null && (
                <View className="mt-1 pt-3 border-t border-gray-100">
                  <Text className="font-bold text-lg text-blue-600">{formatIDR(order.price)}</Text>
                </View>
              )}

              {/* Selesaikan Order — only shown once driver accepted (status: 'accepted') */}
              {order.status === 'accepted' && (
                <TouchableOpacity
                  onPress={() => handleCompleteOrder(order.id)}
                  disabled={!!actionLoading[order.id]}
                  className="bg-blue-600 rounded-lg py-2 mt-3 flex-row justify-center items-center gap-2"
                >
                  {actionLoading[order.id] === 'completing' ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <CheckCircle size={16} color="#FFFFFF" />
                      <Text className="text-white font-semibold text-sm">Selesaikan Order</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Semua Tebengan / Orders List */}
      <View className="px-6 py-4">
        <Text className="text-gray-900 font-bold text-lg mb-3">Tebengan Kamu</Text>
        {userOrders.length === 0 ? (
          <View className="bg-white rounded-xl p-6 items-center">
            <Text className="text-gray-500 text-center">Belum ada tebengan. Buat sekarang!</Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/orders/create')}
              className="bg-blue-600 rounded-lg px-6 py-2 mt-4"
            >
              <Text className="text-white font-semibold text-sm">Buat Tebengan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          userOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => router.push(`/(app)/orders/${order.id}`)}
              className="bg-white rounded-lg p-3 mb-2 flex-row justify-between items-center"
            >
              <View className="flex-1 mr-2">
                <Text className="font-semibold text-gray-900 text-sm" numberOfLines={1}>{order.title}</Text>
                <Text className="text-xs text-gray-500 mt-0.5">{order.type}</Text>
              </View>
              <View className="items-end gap-1">
                <Text className="font-bold text-blue-600 text-sm">{formatIDR(order.price)}</Text>
                <StatusBadge status={order.status} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );

  // ─── Driver Dashboard ──────────────────────────────────────────────────────

  const DriverDashboard = () => (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      className="flex-1 bg-gray-50"
    >
      {/* Header */}
      <LinearGradient
        colors={['#15803D', '#16A34A', '#22C55E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-6 pb-10 px-6 rounded-b-[30px]"
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white/70 text-sm">Driver Mode</Text>
            <Text className="text-white text-2xl font-bold">{user?.name || 'Driver'}</Text>
          </View>
          {/* Bell with unread badge sourced from stats.unreadNotifications */}
          <TouchableOpacity
            onPress={() => router.push('/(app)/notifications')}
            className="bg-white/20 rounded-full p-3 relative"
            accessibilityLabel="Notifications"
          >
            <Bell size={20} color="#FFFFFF" />
            {(stats?.unreadNotifications ?? 0) > 0 && (
              <View className="absolute top-1 right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                <Text className="text-white text-[9px] font-bold">
                  {stats.unreadNotifications > 9 ? '9+' : stats.unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Driver Stats – sourced from GET /api/users/driver-stats */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-white/20 rounded-xl p-4">
            <Text className="text-white/70 text-xs mb-1">Total Tebengan</Text>
            <Text className="text-white font-bold text-lg">{stats?.totalOrders ?? 0}</Text>
          </View>
          <View className="flex-1 bg-white/20 rounded-xl p-4">
            <Text className="text-white/70 text-xs mb-1">Selesai</Text>
            <Text className="text-white font-bold text-lg">
              {stats?.ordersByStatus?.completed ?? 0}
            </Text>
          </View>
          <View className="flex-1 bg-white/20 rounded-xl p-4">
            <Text className="text-white/70 text-xs mb-1">Diterima</Text>
            <Text className="text-white font-bold text-lg">
              {stats?.ordersByStatus?.accepted ?? 0}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Available Orders */}
      <View className="px-6 py-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-900 font-bold text-lg">Tebengan Tersedia</Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="flex-row items-center gap-1"
            accessibilityLabel="Refresh orders"
          >
            <RefreshCw size={14} color="#2563EB" />
            <Text className="text-blue-600 font-semibold text-sm">Perbarui</Text>
          </TouchableOpacity>
        </View>

        {availableOrders.length === 0 ? (
          <View className="bg-white rounded-xl p-6 items-center">
            <Text className="text-gray-500 text-center">Belum ada tebengan tersedia saat ini</Text>
          </View>
        ) : (
          availableOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => router.push(`/(app)/orders/${order.id}`)}
              className="bg-white rounded-xl p-4 mb-3 border-l-4 border-green-600"
              activeOpacity={0.85}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-2">
                  <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>{order.title}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{order.type}</Text>
                </View>
                <Text className="font-bold text-green-600 text-base">{formatIDR(order.price)}</Text>
              </View>

              <View className="gap-2 mb-3">
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color="#1D4ED8" />
                  <Text className="text-sm text-gray-700 flex-1" numberOfLines={1}>{order.pickup}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color="#FF6B35" />
                  <Text className="text-sm text-gray-700 flex-1" numberOfLines={1}>{order.destination}</Text>
                </View>
              </View>

              {/* Accept Order Button */}
              <TouchableOpacity
                onPress={() => handleAcceptOrder(order.id)}
                disabled={!!actionLoading[order.id]}
                className="bg-green-600 rounded-lg py-2.5 mt-1 flex-row justify-center items-center gap-2"
                activeOpacity={0.8}
              >
                {actionLoading[order.id] === 'accepting' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold text-center text-sm">Ambil Tebengan</Text>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );

  // ─── Guards ────────────────────────────────────────────────────────────────

  // Full-screen loader while initial data loads OR role is not yet resolved
  if (loading || !user?.role) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text className="text-gray-400 text-sm mt-3">
          {!user?.role ? 'Checking your account…' : 'Loading dashboard…'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {user.role === 'driver' ? <DriverDashboard /> : <CustomerDashboard />}
    </SafeAreaView>
  );
}