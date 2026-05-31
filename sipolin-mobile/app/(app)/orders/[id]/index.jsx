import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bike,
  Box,
  CheckCircle2,
  Circle,
  Clock3,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react-native';

import { useAuth } from '../../../../context/AuthContext';
import { ordersAPI, extractApiItem } from '../../../../services/api';

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

const normalizeRole = (role) => String(role || '').toLowerCase();
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
    month: 'long',
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

const getStatusMeta = ({ statusRaw, isDriver, driverName }) => {
  const status = normalizeStatus(statusRaw);

  if (status === 'pending') {
    return {
      label: 'Menunggu',
      title: isDriver ? 'Order tersedia untuk diambil' : 'Menunggu driver',
      desc: isDriver
        ? 'Order ini masih terbuka. Kalau cocok, ambil order lalu hubungi pembeli.'
        : 'Order kamu sudah dikirim ke semua driver yang online.',
      color: AMBER,
      bg: '#fffbeb',
      icon: Clock3,
    };
  }

  if (status === 'accepted') {
    return {
      label: 'Diproses',
      title: isDriver ? 'Pesanan sedang kamu kerjakan' : `Diproses oleh ${driverName || 'driver'}`,
      desc: isDriver
        ? 'Kamu sudah mengambil order ini. Cek data pembeli, lokasi, lalu selesaikan setelah transaksi selesai.'
        : 'Driver sudah mengambil order kamu. Kamu bisa lacak status atau chat driver.',
      color: BLUE,
      bg: '#eff6ff',
      icon: Navigation,
    };
  }

  if (status === 'arrived') {
    return {
      label: 'Driver Sampai',
      title: isDriver ? 'Kamu sudah sampai di lokasi jemput/toko' : `${driverName || 'Driver'} sudah sampai`,
      desc: isDriver
        ? 'Konfirmasi barang/user sudah diambil kalau transaksi sudah siap jalan.'
        : 'Driver sudah berada di lokasi jemput/toko. Siapkan barang atau segera temui driver.',
      color: '#7c3aed',
      bg: '#f5f3ff',
      icon: MapPin,
    };
  }

  if (status === 'picked_up') {
    return {
      label: 'Sudah Diambil',
      title: isDriver ? 'Mulai menuju lokasi tujuan' : 'Pesanan sudah diambil',
      desc: isDriver
        ? 'Lanjutkan perjalanan menuju lokasi tujuan pembeli.'
        : 'Driver sudah mengambil barang/menjemput user dan akan menuju tujuan.',
      color: '#7c3aed',
      bg: '#f5f3ff',
      icon: Navigation,
    };
  }

  if (status === 'on_the_way') {
    return {
      label: 'Menuju Tujuan',
      title: isDriver ? 'Kamu sedang menuju tujuan' : 'Driver menuju tujuan',
      desc: isDriver
        ? 'Selesaikan pesanan setelah sampai dan transaksi benar-benar selesai.'
        : 'Driver sedang mengantar menuju lokasi tujuan.',
      color: BLUE,
      bg: '#eff6ff',
      icon: Navigation,
    };
  }

  if (status === 'completed') {
    return {
      label: 'Selesai',
      title: 'Pesanan selesai',
      desc: 'Transaksi ini sudah selesai dan masuk ke riwayat kedua akun.',
      color: GREEN,
      bg: '#f0fdf4',
      icon: CheckCircle2,
    };
  }

  if (status === 'cancelled') {
    return {
      label: 'Dibatalkan',
      title: 'Pesanan dibatalkan',
      desc: 'Pesanan ini sudah dibatalkan.',
      color: RED,
      bg: '#fef2f2',
      icon: XCircle,
    };
  }

  return {
    label: status || 'Status',
    title: 'Status pesanan',
    desc: 'Detail status pesanan belum tersedia.',
    color: MUTED,
    bg: '#f8fafc',
    icon: Clock3,
  };
};

const InfoRow = ({ label, value }) => (
  <View style={S.infoRow}>
    <Text style={S.infoLabel}>{label}</Text>
    <Text style={S.infoValue}>{value || '—'}</Text>
  </View>
);

const PersonCard = ({ title, iconType = 'user', person, fallbackName, fallbackSub, phoneLabel, onCall }) => {
  const Icon = iconType === 'driver' ? ShieldCheck : UserRound;
  const iconColor = iconType === 'driver' ? BLUE : PRIMARY;
  const iconBg = iconType === 'driver' ? '#eff6ff' : PRIMARY_LT;

  return (
    <View style={S.card}>
      <Text style={S.cardTitle}>{title}</Text>

      <View style={S.personRow}>
        <View style={[S.avatarCircle, { backgroundColor: iconBg }]}>
          <Icon size={22} color={iconColor} strokeWidth={2.2} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={S.personName}>{person?.name || fallbackName}</Text>
          <Text style={S.personSub}>
            {person?.nim ||
              person?.vehicleDetail ||
              fallbackSub ||
              'Sipolin'}
            {person?.plateNumber ? ` · ${person.plateNumber}` : ''}
          </Text>
        </View>

        {onCall && (
          <TouchableOpacity activeOpacity={0.8} onPress={onCall} style={S.smallIconBtn}>
            <Phone size={18} color={PRIMARY} strokeWidth={2.4} />
          </TouchableOpacity>
        )}
      </View>

      <InfoRow label={phoneLabel || 'No. HP'} value={person?.phone} />
    </View>
  );
};

const RouteBox = ({ pickup, destination }) => (
  <View style={S.routeCard}>
    <View style={S.routeIconCol}>
      <Circle size={12} color={PRIMARY} fill={PRIMARY} strokeWidth={0} />
      <View style={S.routeLine} />
      <MapPin size={16} color={RED} strokeWidth={2.3} />
    </View>

    <View style={{ flex: 1 }}>
      <Text style={S.routeLabel}>Jemput / Ambil</Text>
      <Text style={S.routeText}>{pickup || 'Lokasi belum tersedia'}</Text>

      <View style={{ height: 18 }} />

      <Text style={S.routeLabel}>Tujuan</Text>
      <Text style={S.routeText}>{destination || 'Tujuan belum tersedia'}</Text>
    </View>
  </View>
);


const getProgressIndex = (statusRaw) => {
  const status = normalizeStatus(statusRaw);
  const order = ['pending', 'accepted', 'arrived', 'picked_up', 'on_the_way', 'completed'];
  if (status === 'cancelled') return -1;
  const index = order.indexOf(status);
  return index === -1 ? 0 : index;
};

const buildActivitySteps = ({ order, isDriver, driverName }) => {
  const status = normalizeStatus(order?.status);
  const progressIndex = getProgressIndex(status);

  const steps = [
    {
      key: 'pending',
      title: 'Pesanan dibuat',
      desc: isDriver
        ? 'Order masuk dan tersedia untuk driver.'
        : 'Pesanan kamu sudah dikirim ke driver yang online.',
      time: formatDate(order?.createdAt),
    },
    {
      key: 'accepted',
      title: isDriver ? 'Kamu mengambil order' : `Diambil oleh ${driverName || 'driver'}`,
      desc: isDriver
        ? 'Cek detail pembeli dan mulai menuju lokasi ambil.'
        : 'Driver sudah menerima dan akan menuju lokasi ambil.',
      time: progressIndex >= 1 ? 'Sudah diproses' : 'Menunggu driver',
    },
    {
      key: 'arrived',
      title: 'Driver sampai di lokasi ambil',
      desc: isDriver
        ? 'Konfirmasi setelah sudah bertemu pembeli atau sampai toko.'
        : 'Driver sudah sampai di titik jemput/toko.',
      time: progressIndex >= 2 ? 'Sudah sampai' : 'Menunggu update',
    },
    {
      key: 'picked_up',
      title: order?.type === 'pol_ride' ? 'User sudah dijemput' : 'Barang/pesanan sudah diambil',
      desc: isDriver
        ? 'Lanjutkan perjalanan menuju tujuan.'
        : 'Driver sudah mengambil pesanan dan siap menuju tujuan.',
      time: progressIndex >= 3 ? 'Sudah diambil' : 'Menunggu update',
    },
    {
      key: 'on_the_way',
      title: 'Menuju tujuan',
      desc: isDriver
        ? 'Antarkan ke lokasi tujuan, lalu selesaikan pesanan.'
        : 'Driver sedang mengantar menuju lokasi tujuan.',
      time: progressIndex >= 4 ? 'Sedang berjalan' : 'Menunggu update',
    },
    {
      key: 'completed',
      title: 'Pesanan selesai',
      desc: 'Transaksi selesai dan masuk ke riwayat.',
      time: order?.completedAt ? formatDate(order.completedAt) : progressIndex >= 5 ? 'Selesai' : 'Belum selesai',
    },
  ];

  if (status === 'cancelled') {
    return [
      steps[0],
      {
        key: 'cancelled',
        title: 'Pesanan dibatalkan',
        desc: 'Pesanan ini sudah dibatalkan dan tidak dilanjutkan.',
        time: 'Dibatalkan',
      },
    ];
  }

  return steps;
};

const ActivityTimeline = ({ order, isDriver, driverName }) => {
  const status = normalizeStatus(order?.status);
  const progressIndex = getProgressIndex(status);
  const steps = buildActivitySteps({ order, isDriver, driverName });

  return (
    <View style={S.timelineCard}>
      <View style={S.timelineHeader}>
        <View>
          <Text style={S.timelineTitle}>Proses Pesanan</Text>
          <Text style={S.timelineSubtitle}>Riwayat aktivitas transaksi</Text>
        </View>

        <View style={S.timelineBadge}>
          <Text style={S.timelineBadgeText}>
            {status === 'cancelled' ? 'Batal' : `${Math.max(progressIndex + 1, 1)}/${steps.length}`}
          </Text>
        </View>
      </View>

      {steps.map((step, index) => {
        const isCancelledStep = step.key === 'cancelled';
        const done = status === 'cancelled'
          ? index === 0 || isCancelledStep
          : index <= progressIndex;
        const active = status !== 'cancelled' && index === progressIndex;
        const isLast = index === steps.length - 1;

        return (
          <View key={step.key} style={S.timelineRow}>
            <View style={S.timelineLeft}>
              <View
                style={[
                  S.timelineDot,
                  done && S.timelineDotDone,
                  active && S.timelineDotActive,
                  isCancelledStep && S.timelineDotCancel,
                ]}
              >
                {done ? (
                  <CheckCircle2 size={13} color={WHITE} strokeWidth={3} />
                ) : (
                  <View style={S.timelineDotInner} />
                )}
              </View>
              {!isLast && (
                <View style={[S.timelineLine, done && S.timelineLineDone]} />
              )}
            </View>

            <View style={[S.timelineContent, active && S.timelineContentActive]}>
              <View style={S.timelineContentTop}>
                <Text style={[S.timelineStepTitle, done && { color: INK }]}>
                  {step.title}
                </Text>
                {active && <Text style={S.timelineNow}>Aktif</Text>}
              </View>
              <Text style={S.timelineStepDesc}>{step.desc}</Text>
              <Text style={S.timelineTime}>{step.time}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const RatingDriverCard = ({ rating, setRating, driverName }) => {
  const submitRating = () => {
    if (!rating) {
      Alert.alert('Rating belum dipilih', 'Pilih bintang dulu ya.');
      return;
    }

    Alert.alert(
      'Terima kasih!',
      `Rating ${rating} bintang untuk ${driverName || 'driver'} sudah tersimpan sementara. Nanti bisa kita sambungkan ke database.`
    );
  };

  return (
    <View style={S.ratingCard}>
      <Text style={S.ratingTitle}>Beri Rating Driver</Text>
      <Text style={S.ratingSubtitle}>
        Transaksi sudah selesai. Kasih penilaian buat kualitas layanan driver.
      </Text>

      <View style={S.ratingStars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} activeOpacity={0.75} onPress={() => setRating(star)}>
            <Text style={[S.ratingStar, star <= rating && S.ratingStarActive]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity activeOpacity={0.85} onPress={submitRating} style={S.ratingButton}>
        <Text style={S.ratingButtonText}>Kirim Rating</Text>
      </TouchableOpacity>
    </View>
  );
};



export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rating, setRating] = useState(0);

  const role = normalizeRole(user?.role);
  const isDriver = role === 'driver';

  const status = normalizeStatus(order?.status);
  const typeMeta = useMemo(() => getTypeMeta(order?.type), [order?.type]);

  const pickup = order?.pickup || order?.pickupLocation;
  const destination = order?.destination || order?.dropoffLocation;
  const customer = order?.customer || {};
  const driver = order?.driver || {};
  const hasDriver = Boolean(order?.driverId || driver?.id);

  const statusMeta = useMemo(
    () => getStatusMeta({ statusRaw: order?.status, isDriver, driverName: driver?.name }),
    [order?.status, isDriver, driver?.name]
  );

  const TypeIcon = typeMeta.icon;
  const StatusIcon = statusMeta.icon;

  const fetchOrder = useCallback(async () => {
    if (!id) return;

    try {
      const result = await ordersAPI.getById(id);
      const item = extractApiItem(result);
      setOrder(item);
    } catch (error) {
      console.error('[OrderDetail] fetchOrder:', error?.response?.data || error?.message || error);
      Alert.alert('Gagal', 'Detail pesanan tidak bisa dimuat.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrder();
  };

  const callPhone = (phone, label = 'Nomor telepon tidak tersedia.') => {
    if (!phone) {
      Alert.alert('Info', label);
      return;
    }

    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Gagal', 'Tidak bisa membuka aplikasi telepon.');
    });
  };

  const handleAccept = async () => {
    if (!order?.id) return;

    setActionLoading(true);
    try {
      await ordersAPI.acceptOrder(order.id);
      await fetchOrder();
      Alert.alert('Berhasil', 'Pesanan berhasil kamu ambil.');
    } catch (error) {
      Alert.alert('Gagal', error?.response?.data?.error || error?.message || 'Gagal mengambil pesanan.');
    } finally {
      setActionLoading(false);
    }
  };


  const handleUpdateProgress = async (nextStatus) => {
    if (!order?.id) return;

    setActionLoading(true);
    try {
      await ordersAPI.updateProgress(order.id, nextStatus);
      await fetchOrder();
    } catch (error) {
      Alert.alert('Gagal', error?.response?.data?.error || error?.message || 'Gagal mengubah progress pesanan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!order?.id) return;

    Alert.alert(
      'Selesaikan pesanan?',
      'Pastikan pesanan benar-benar sudah selesai.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Selesaikan',
          onPress: async () => {
            setActionLoading(true);
            try {
              await ordersAPI.completeOrder(order.id);
              await fetchOrder();
              Alert.alert('Berhasil', 'Pesanan sudah diselesaikan.');
            } catch (error) {
              Alert.alert('Gagal', error?.response?.data?.error || error?.message || 'Gagal menyelesaikan pesanan.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    if (!order?.id) return;

    Alert.alert(
      'Batalkan pesanan?',
      'Pesanan yang sudah dibatalkan tidak bisa dilanjutkan.',
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Batalkan',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await ordersAPI.cancelOrder(order.id);
              Alert.alert('Berhasil', 'Pesanan dibatalkan.');
              router.back();
            } catch (error) {
              Alert.alert('Gagal', error?.response?.data?.error || error?.message || 'Gagal membatalkan pesanan.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const goToChat = () => {
    const chatRoomId = order?.chatRoom?.id;

    if (chatRoomId) {
      router.push(`/chat/${chatRoomId}`);
      return;
    }

    router.push('/chat');
  };

  const goToTrack = () => {
    if (!hasDriver) {
      Alert.alert('Belum ada driver', 'Tracking baru tersedia setelah driver mengambil pesanan.');
      return;
    }

    router.push(`/orders/${order.id}/track`);
  };

  if (loading) {
    return (
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
        <View style={S.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={S.loadingText}>Memuat detail pesanan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={S.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
        <View style={S.center}>
          <Text style={S.errorTitle}>Pesanan tidak ditemukan</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()} style={S.primaryButton}>
            <Text style={S.primaryButtonText}>Kembali</Text>
          </TouchableOpacity>
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
          <Text style={S.headerTitle}>Detail Transaksi</Text>
          <Text style={S.headerSubtitle}>{typeMeta.label} · {formatIDR(order.price)}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.75} onPress={onRefresh} style={S.refreshBtn}>
          <RefreshCw size={18} color={PRIMARY} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} tintColor={PRIMARY} />}
        contentContainerStyle={S.scrollContent}
      >
        <View style={S.heroCard}>
          <View style={S.heroTop}>
            <View style={[S.typeIcon, { backgroundColor: typeMeta.bg }]}>
              <TypeIcon size={25} color={typeMeta.color} strokeWidth={2.4} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={S.heroTitle}>{order.title || typeMeta.label}</Text>
              <Text style={S.heroSubtitle}>{typeMeta.desc}</Text>
            </View>

            <Text style={S.heroPrice}>{formatIDR(order.price)}</Text>
          </View>

          <View style={[S.statusBox, { backgroundColor: statusMeta.bg }]}>
            <View style={[S.statusIcon, { backgroundColor: statusMeta.color }]}>
              <StatusIcon size={18} color={WHITE} strokeWidth={2.8} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[S.statusTitle, { color: statusMeta.color }]}>{statusMeta.title}</Text>
              <Text style={S.statusDesc}>{statusMeta.desc}</Text>
            </View>
          </View>
        </View>

        <RouteBox pickup={pickup} destination={destination} />

        <ActivityTimeline
          order={order}
          isDriver={isDriver}
          driverName={driver?.name}
        />

        {isDriver ? (
          <>
            <PersonCard
              title="Info Pembeli"
              person={customer}
              fallbackName="Pembeli Sipolin"
              fallbackSub="Mahasiswa"
              phoneLabel="No. HP Pembeli"
              onCall={() => callPhone(customer?.phone, 'Nomor pembeli belum tersedia.')}
            />

            <View style={S.card}>
              <Text style={S.cardTitle}>Catatan Pesanan</Text>
              <InfoRow label="Catatan" value={order.description || order.note} />
              <InfoRow label="Waktu pesan" value={formatDate(order.createdAt)} />
              <InfoRow label="Status" value={statusMeta.label} />
            </View>
          </>
        ) : (
          <>
            <View style={S.card}>
              <Text style={S.cardTitle}>Info Pesanan Saya</Text>
              <InfoRow label="Catatan" value={order.description || order.note} />
              <InfoRow label="Waktu pesan" value={formatDate(order.createdAt)} />
              <InfoRow label="Status" value={statusMeta.label} />
            </View>

            {hasDriver ? (
              <PersonCard
                title="Info Driver"
                iconType="driver"
                person={driver}
                fallbackName="Driver Sipolin"
                fallbackSub="Motor"
                phoneLabel="No. HP Driver"
                onCall={() => callPhone(driver?.phone, 'Nomor driver belum tersedia.')}
              />
            ) : (
              <View style={S.card}>
                <Text style={S.cardTitle}>Info Driver</Text>
                <View style={S.waitingDriverBox}>
                  <Clock3 size={22} color={AMBER} strokeWidth={2.4} />
                  <View style={{ flex: 1 }}>
                    <Text style={S.waitingTitle}>Belum ada driver</Text>
                    <Text style={S.waitingText}>Order ini masih tampil ke semua driver yang online.</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {!isDriver && status === 'completed' && hasDriver && (
          <RatingDriverCard
            rating={rating}
            setRating={setRating}
            driverName={driver?.name}
          />
        )}

        <View style={S.actionCard}>
          {isDriver && status === 'pending' && (
            <TouchableOpacity activeOpacity={0.85} disabled={actionLoading} onPress={handleAccept} style={S.primaryButton}>
              {actionLoading ? (
                <ActivityIndicator size="small" color={WHITE} />
              ) : (
                <>
                  <CheckCircle2 size={18} color={WHITE} strokeWidth={2.6} />
                  <Text style={S.primaryButtonText}>Ambil Order</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {isDriver && status === 'accepted' && (
            <>
              <TouchableOpacity activeOpacity={0.85} disabled={actionLoading} onPress={() => handleUpdateProgress('arrived')} style={S.primaryButton}>
                {actionLoading ? (
                  <ActivityIndicator size="small" color={WHITE} />
                ) : (
                  <>
                    <MapPin size={18} color={WHITE} strokeWidth={2.6} />
                    <Text style={S.primaryButtonText}>Saya Sudah Sampai</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} onPress={goToChat} style={S.secondaryButton}>
                <MessageCircle size={18} color={PRIMARY} strokeWidth={2.6} />
                <Text style={S.secondaryButtonText}>Chat Pembeli</Text>
              </TouchableOpacity>
            </>
          )}

          {isDriver && status === 'arrived' && (
            <>
              <TouchableOpacity activeOpacity={0.85} disabled={actionLoading} onPress={() => handleUpdateProgress('picked_up')} style={S.primaryButton}>
                {actionLoading ? (
                  <ActivityIndicator size="small" color={WHITE} />
                ) : (
                  <>
                    <CheckCircle2 size={18} color={WHITE} strokeWidth={2.6} />
                    <Text style={S.primaryButtonText}>Barang/User Sudah Diambil</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} onPress={goToChat} style={S.secondaryButton}>
                <MessageCircle size={18} color={PRIMARY} strokeWidth={2.6} />
                <Text style={S.secondaryButtonText}>Chat Pembeli</Text>
              </TouchableOpacity>
            </>
          )}

          {isDriver && status === 'picked_up' && (
            <>
              <TouchableOpacity activeOpacity={0.85} disabled={actionLoading} onPress={() => handleUpdateProgress('on_the_way')} style={S.primaryButton}>
                {actionLoading ? (
                  <ActivityIndicator size="small" color={WHITE} />
                ) : (
                  <>
                    <Navigation size={18} color={WHITE} strokeWidth={2.6} />
                    <Text style={S.primaryButtonText}>Mulai Menuju Tujuan</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} onPress={goToChat} style={S.secondaryButton}>
                <MessageCircle size={18} color={PRIMARY} strokeWidth={2.6} />
                <Text style={S.secondaryButtonText}>Chat Pembeli</Text>
              </TouchableOpacity>
            </>
          )}

          {isDriver && status === 'on_the_way' && (
            <>
              <TouchableOpacity activeOpacity={0.85} disabled={actionLoading} onPress={handleComplete} style={S.primaryButton}>
                {actionLoading ? (
                  <ActivityIndicator size="small" color={WHITE} />
                ) : (
                  <>
                    <CheckCircle2 size={18} color={WHITE} strokeWidth={2.6} />
                    <Text style={S.primaryButtonText}>Selesaikan Pesanan</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} onPress={goToChat} style={S.secondaryButton}>
                <MessageCircle size={18} color={PRIMARY} strokeWidth={2.6} />
                <Text style={S.secondaryButtonText}>Chat Pembeli</Text>
              </TouchableOpacity>
            </>
          )}

          {!isDriver && status === 'pending' && (
            <>
              <TouchableOpacity activeOpacity={0.85} onPress={onRefresh} style={S.primaryButton}>
                <RefreshCw size={18} color={WHITE} strokeWidth={2.6} />
                <Text style={S.primaryButtonText}>Refresh Status</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} disabled={actionLoading} onPress={handleCancel} style={S.dangerOutlineButton}>
                <XCircle size={18} color={RED} strokeWidth={2.5} />
                <Text style={S.dangerOutlineText}>Batalkan Pesanan</Text>
              </TouchableOpacity>
            </>
          )}

          {!isDriver && ['accepted', 'arrived', 'picked_up', 'on_the_way'].includes(status) && (
            <>
              <TouchableOpacity activeOpacity={0.85} onPress={goToTrack} style={S.primaryButton}>
                <Navigation size={18} color={WHITE} strokeWidth={2.6} />
                <Text style={S.primaryButtonText}>Lacak Driver</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} onPress={goToChat} style={S.secondaryButton}>
                <MessageCircle size={18} color={PRIMARY} strokeWidth={2.6} />
                <Text style={S.secondaryButtonText}>Chat Driver</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'completed' && (
            <View style={S.doneBox}>
              <CheckCircle2 size={20} color={GREEN} strokeWidth={2.6} />
              <Text style={S.doneText}>Pesanan ini sudah selesai.</Text>
            </View>
          )}

          {status === 'cancelled' && (
            <View style={[S.doneBox, { backgroundColor: '#fef2f2' }]}>
              <XCircle size={20} color={RED} strokeWidth={2.6} />
              <Text style={[S.doneText, { color: RED }]}>Pesanan ini dibatalkan.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAGE_BG },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26 },
  loadingText: { marginTop: 12, color: MUTED, fontSize: 14, fontWeight: '700' },
  errorTitle: { color: INK, fontSize: 18, fontWeight: '900', marginBottom: 18 },
  header: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 16, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  refreshBtn: { width: 42, height: 42, borderRadius: 16, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: INK, fontSize: 23, fontWeight: '900', letterSpacing: -0.5 },
  headerSubtitle: { color: MUTED, fontSize: 12.5, fontWeight: '700', marginTop: 2 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 115 },
  heroCard: { backgroundColor: WHITE, borderRadius: 26, padding: 18, borderWidth: 1, borderColor: BORDER, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 4, marginBottom: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 16 },
  typeIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: INK, fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  heroSubtitle: { color: MUTED, fontSize: 12.5, fontWeight: '700', marginTop: 2 },
  heroPrice: { color: INK, fontSize: 17, fontWeight: '900' },
  statusBox: { borderRadius: 20, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  statusIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: 14, fontWeight: '900', marginBottom: 2 },
  statusDesc: { color: INK_MID, fontSize: 12.5, fontWeight: '600', lineHeight: 18 },
  routeCard: { backgroundColor: WHITE, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: BORDER, flexDirection: 'row', marginBottom: 14, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  routeIconCol: { width: 28, alignItems: 'center', marginRight: 10, paddingTop: 3 },
  routeLine: { width: 2, height: 42, backgroundColor: '#a7f3d0', marginVertical: 6, borderRadius: 2 },
  routeLabel: { color: MUTED, fontSize: 11.5, fontWeight: '800', marginBottom: 4 },
  routeText: { color: INK, fontSize: 15, fontWeight: '900' },
  card: { backgroundColor: WHITE, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: BORDER, marginBottom: 14, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  cardTitle: { color: INK, fontSize: 16, fontWeight: '900', marginBottom: 14 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatarCircle: { width: 48, height: 48, borderRadius: 17, backgroundColor: PRIMARY_LT, alignItems: 'center', justifyContent: 'center' },
  personName: { color: INK, fontSize: 15, fontWeight: '900' },
  personSub: { color: MUTED, fontSize: 12.5, fontWeight: '700', marginTop: 2 },
  smallIconBtn: { width: 42, height: 42, borderRadius: 15, backgroundColor: PRIMARY_LT, alignItems: 'center', justifyContent: 'center' },
  infoRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 10 },
  infoLabel: { color: MUTED, fontSize: 11.5, fontWeight: '800', marginBottom: 4 },
  infoValue: { color: INK_MID, fontSize: 13.5, fontWeight: '700', lineHeight: 19 },
  waitingDriverBox: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#fffbeb', borderRadius: 18, padding: 14 },
  waitingTitle: { color: AMBER, fontSize: 14, fontWeight: '900' },
  waitingText: { color: INK_MID, fontSize: 12.5, fontWeight: '600', lineHeight: 18, marginTop: 2 },
  actionCard: { gap: 10, marginBottom: 16 },
  primaryButton: { minHeight: 54, backgroundColor: PRIMARY, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, shadowColor: PRIMARY_DK, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 12, elevation: 4 },
  primaryButtonText: { color: WHITE, fontSize: 15, fontWeight: '900' },
  secondaryButton: { minHeight: 54, backgroundColor: WHITE, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, borderWidth: 1, borderColor: '#b7f0d2' },
  secondaryButtonText: { color: PRIMARY, fontSize: 15, fontWeight: '900' },
  dangerOutlineButton: { minHeight: 54, backgroundColor: WHITE, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, borderWidth: 1, borderColor: '#fecaca' },
  dangerOutlineText: { color: RED, fontSize: 15, fontWeight: '900' },
  doneBox: { minHeight: 54, backgroundColor: '#f0fdf4', borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, borderWidth: 1, borderColor: '#bbf7d0' },
  doneText: { color: GREEN, fontSize: 15, fontWeight: '900' },

  timelineCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timelineTitle: {
    color: INK,
    fontSize: 16,
    fontWeight: '900',
  },
  timelineSubtitle: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  timelineBadge: {
    backgroundColor: PRIMARY_LT,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  timelineBadgeText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '900',
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 72,
  },
  timelineLeft: {
    width: 28,
    alignItems: 'center',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineDotDone: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  timelineDotActive: {
    borderColor: BLUE,
    backgroundColor: BLUE,
  },
  timelineDotCancel: {
    borderColor: RED,
    backgroundColor: RED,
  },
  timelineDotInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 3,
  },
  timelineLineDone: {
    backgroundColor: '#a7f3d0',
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 16,
  },
  timelineContentActive: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 9,
    marginBottom: 12,
  },
  timelineContentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  timelineStepTitle: {
    flex: 1,
    color: INK_MID,
    fontSize: 14,
    fontWeight: '900',
  },
  timelineNow: {
    color: BLUE,
    backgroundColor: '#eff6ff',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  timelineStepDesc: {
    color: MUTED,
    fontSize: 12.2,
    fontWeight: '600',
    lineHeight: 18,
  },
  timelineTime: {
    color: INK_MID,
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 5,
  },
  ratingCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginBottom: 14,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  ratingTitle: {
    color: INK,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },
  ratingSubtitle: {
    color: MUTED,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 15,
  },
  ratingStar: {
    fontSize: 35,
    color: '#cbd5e1',
  },
  ratingStarActive: {
    color: '#fbbf24',
  },
  ratingButton: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '900',
  },

});
