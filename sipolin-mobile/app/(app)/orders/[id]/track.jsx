/**
 * app/(app)/orders/[id]/track.jsx  —  SIPOLIN Live Tracking Screen
 * ─────────────────────────────────────────────────────────────────
 * Customer-facing real-time driver tracking:
 *   • Full-screen MapView with custom Uber-dark style
 *   • Animated driver marker (smooth coord interpolation via AnimatedRegion)
 *   • Customer location marker
 *   • Route polyline connecting both points
 *   • 5-second REST polling with smart staleness detection
 *   • Glassmorphism bottom card — driver info, ETA, distance, Call button
 *   • Reanimated slide-up entrance animation for the bottom card
 *   • Camera auto-follows driver position
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking,
  ActivityIndicator, Platform, StatusBar, Alert, Dimensions,
} from 'react-native';
import MapView, {
  Marker, Polyline, AnimatedRegion, PROVIDER_GOOGLE,
} from 'react-native-maps';
import { BlurView }           from 'expo-blur';
import * as Location          from 'expo-location';
import { Image }              from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, FadeIn, Easing,
} from 'react-native-reanimated';

import { usersAPI, ordersAPI } from '../../../../services/api';

const { width: W, height: H } = Dimensions.get('window');

// ─── Poll config ──────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS   = 5_000;   // Fetch driver location every 5 s
const STALE_WARN_MS      = 20_000;  // Show "connection lost" after 20 s of no update
const CAMERA_ZOOM        = { latitudeDelta: 0.008, longitudeDelta: 0.008 };
const MARKER_ANIM_DURATION = 1_400; // ms — smooth glide between GPS fixes

// ─── Indonesia fallback (Cirebon area) ───────────────────────────────────────
const FALLBACK_REGION = {
  latitude:      -6.7320,
  longitude:     108.5523,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// ─────────────────────────────────────────────────────────────────────────────
// DARK MAP STYLE — Royal Blue / SIPOLIN Brand
// ─────────────────────────────────────────────────────────────────────────────
const SIPOLIN_MAP_STYLE = [
  { elementType: 'geometry',                                              stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill',                                      stylers: [{ color: '#6b7280' }] },
  { elementType: 'labels.text.stroke',                                    stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.icon',                                           stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative',       elementType: 'geometry',         stylers: [{ color: '#1f2937' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'poi',                  elementType: 'geometry',         stylers: [{ color: '#1f2937' }] },
  { featureType: 'poi',                  elementType: 'labels.text.fill', stylers: [{ color: '#4b5563' }] },
  { featureType: 'poi.park',             elementType: 'geometry',         stylers: [{ color: '#0f1f1a' }] },
  { featureType: 'road',                 elementType: 'geometry',         stylers: [{ color: '#1e293b' }] },
  { featureType: 'road',                 elementType: 'geometry.stroke',  stylers: [{ color: '#111827' }] },
  { featureType: 'road',                 elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'road.highway',         elementType: 'geometry',         stylers: [{ color: '#1d3461' }] },
  { featureType: 'road.highway',         elementType: 'geometry.stroke',  stylers: [{ color: '#1e3a8a' }] },
  { featureType: 'road.highway',         elementType: 'labels.text.fill', stylers: [{ color: '#93c5fd' }] },
  { featureType: 'road.arterial',        elementType: 'geometry',         stylers: [{ color: '#1e2a3a' }] },
  { featureType: 'transit',              elementType: 'geometry',         stylers: [{ color: '#1f2937' }] },
  { featureType: 'transit.station',      elementType: 'labels.text.fill', stylers: [{ color: '#374151' }] },
  { featureType: 'water',                elementType: 'geometry',         stylers: [{ color: '#0c1929' }] },
  { featureType: 'water',                elementType: 'labels.text.fill', stylers: [{ color: '#1e3a5f' }] },
];

// ─── Haversine formula (km) ───────────────────────────────────────────────────
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Road factor + avg motorbike city speed (25 km/h in Indonesian traffic)
const etaMinutes = (distKm) => Math.ceil((distKm * 1.35 / 25) * 60);

const fmtDistance = (km) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

const fmtEta = (mins) => {
  if (mins <= 0) return 'Tiba';
  if (mins < 60)  return `${mins} mnt`;
  return `${Math.floor(mins / 60)} j ${mins % 60} mnt`;
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Pulsing online indicator dot */
const OnlineDot = ({ isOnline }) => (
  <View style={[s.onlineDot, { backgroundColor: isOnline ? '#22c55e' : '#f59e0b' }]} />
);

/** Custom driver map marker — blue scooter pin */
const DriverMarkerView = ({ heading = 0 }) => (
  <View style={s.driverMarkerWrap}>
    <View style={[s.driverMarkerArrow, { transform: [{ rotate: `${heading}deg` }] }]}>
      <Text style={s.driverMarkerIcon}>🛵</Text>
    </View>
    <View style={s.driverMarkerShadow} />
  </View>
);

/** Custom customer map marker */
const CustomerMarkerView = () => (
  <View style={s.customerMarkerWrap}>
    <View style={s.customerMarkerPin}>
      <View style={s.customerMarkerDot} />
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TRACKING SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function TrackScreen() {
  const { id: orderId } = useLocalSearchParams();
  const router          = useRouter();

  // ── Data state ─────────────────────────────────────────────────────────────
  const [order,        setOrder]        = useState(null);
  const [driverInfo,   setDriverInfo]   = useState(null);
  const [customerCoord, setCustomerCoord] = useState(null);
  const [distanceKm,   setDistanceKm]   = useState(null);
  const [isOnline,     setIsOnline]     = useState(true);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const mapRef        = useRef(null);
  const driverMarkerRef = useRef(null);
  const pollRef       = useRef(null);
  const lastUpdateRef = useRef(null);

  // ── AnimatedRegion for smooth marker movement ─────────────────────────────
  const driverAnimCoord = useRef(
    new AnimatedRegion({
      latitude:      FALLBACK_REGION.latitude,
      longitude:     FALLBACK_REGION.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;

  // ── Reanimated — bottom card slide-up ──────────────────────────────────────
  const cardTranslateY = useSharedValue(300);
  const cardOpacity    = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform:  [{ translateY: cardTranslateY.value }],
    opacity:    cardOpacity.value,
  }));

  const showCard = useCallback(() => {
    cardTranslateY.value = withSpring(0,   { damping: 18, stiffness: 120 });
    cardOpacity.value    = withTiming(1,   { duration: 400, easing: Easing.out(Easing.cubic) });
  }, []);

  // ── Update driver position — animate marker + camera ─────────────────────
  const updateDriverPosition = useCallback((lat, lng, heading = 0) => {
    const coord = { latitude: lat, longitude: lng };

    // Animate marker coordinate
    if (Platform.OS === 'android') {
      driverMarkerRef.current?.animateMarkerToCoordinate(coord, MARKER_ANIM_DURATION);
    } else {
      driverAnimCoord.timing({
        ...coord,
        duration:        MARKER_ANIM_DURATION,
        useNativeDriver: false,
      }).start();
    }

    // Animate camera to follow driver
    mapRef.current?.animateToRegion(
      { ...coord, ...CAMERA_ZOOM },
      MARKER_ANIM_DURATION
    );
  }, [driverAnimCoord]);

  // ── Fetch driver location from backend ────────────────────────────────────
  const fetchDriverLocation = useCallback(async (driverId, custCoord) => {
    try {
      const { data } = await usersAPI.getDriverLocation(driverId);

      lastUpdateRef.current = Date.now();
      setIsOnline(data.isOnline);

      if (data.latitude && data.longitude) {
        // Update animated marker
        updateDriverPosition(data.latitude, data.longitude);

        // Update driver info (name/phone/vehicle may enrich on first poll)
        setDriverInfo((prev) => ({ ...prev, ...data }));

        // Calculate ETA
        if (custCoord) {
          const km = haversineKm(
            custCoord.latitude,
            custCoord.longitude,
            data.latitude,
            data.longitude
          );
          setDistanceKm(km);
        }
      }
    } catch (err) {
      console.warn('[Track] Poll error:', err?.message);
    }
  }, [updateDriverPosition]);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // 1. Fetch order
        const orderRes = await ordersAPI.getById(orderId);
        const ord      = orderRes.data;
        if (!mounted) return;
        if (!ord.driverId) {
          setError('Driver belum ditugaskan ke pesanan ini.');
          setLoading(false);
          return;
        }
        setOrder(ord);

        // 2. Get customer's current location (for ETA calculation)
        let custCoord = null;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            custCoord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            if (mounted) setCustomerCoord(custCoord);
          }
        } catch (_) { /* non-fatal */ }

        // 3. First driver location fetch
        const driverRes = await usersAPI.getDriverLocation(ord.driverId);
        if (!mounted) return;
        const dData = driverRes.data;
        setDriverInfo(dData);

        if (dData.latitude && dData.longitude) {
          // Teleport animated coord to initial position (no animation first time)
          driverAnimCoord.setValue({
            latitude:      dData.latitude,
            longitude:     dData.longitude,
            latitudeDelta: 0,
            longitudeDelta: 0,
          });

          // Fit map to show both driver and customer
          const coords = [{ latitude: dData.latitude, longitude: dData.longitude }];
          if (custCoord) coords.push(custCoord);
          setTimeout(() => {
            mapRef.current?.fitToCoordinates(coords, {
              edgePadding: { top: 120, right: 60, bottom: 340, left: 60 },
              animated: true,
            });
          }, 500);

          if (custCoord) {
            const km = haversineKm(custCoord.latitude, custCoord.longitude, dData.latitude, dData.longitude);
            setDistanceKm(km);
          }
        }

        setLoading(false);
        showCard();

        // 4. Start polling
        pollRef.current = setInterval(() => {
          fetchDriverLocation(ord.driverId, custCoord);
        }, POLL_INTERVAL_MS);

        // 5. Staleness watcher
        const staleCheck = setInterval(() => {
          if (lastUpdateRef.current && Date.now() - lastUpdateRef.current > STALE_WARN_MS) {
            setIsOnline(false);
          }
        }, 8_000);
        pollRef._stale = staleCheck;

      } catch (err) {
        console.error('[Track] Init error:', err);
        if (mounted) {
          setError('Gagal memuat tracking. Periksa koneksi internet.');
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      clearInterval(pollRef.current);
      clearInterval(pollRef._stale);
    };
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Call driver ───────────────────────────────────────────────────────────
  const handleCall = useCallback(() => {
    const phone = driverInfo?.phone;
    if (!phone) return Alert.alert('Info', 'Nomor telepon driver tidak tersedia.');
    const url = `tel:${phone}`;
    Linking.canOpenURL(url)
      .then((ok) => ok ? Linking.openURL(url) : Alert.alert('Error', 'Tidak bisa membuka telepon.'))
      .catch(console.warn);
  }, [driverInfo?.phone]);

  // ── Order status label ────────────────────────────────────────────────────
  const statusConfig = useMemo(() => {
    const map = {
      pending:    { label: 'Mencari Driver',  color: '#f59e0b', bg: '#fffbeb' },
      accepted:   { label: 'Driver Menuju',   color: '#2563eb', bg: '#eff6ff' },
      picked_up:  { label: 'Dalam Perjalanan', color: '#7c3aed', bg: '#f5f3ff' },
      completed:  { label: 'Selesai',          color: '#16a34a', bg: '#f0fdf4' },
      cancelled:  { label: 'Dibatalkan',       color: '#dc2626', bg: '#fef2f2' },
    };
    return map[order?.status] ?? { label: order?.status ?? '...', color: '#6b7280', bg: '#f9fafb' };
  }, [order?.status]);

  // ─── ETA / distance text ──────────────────────────────────────────────────
  const etaMins     = distanceKm !== null ? etaMinutes(distanceKm) : null;
  const distanceStr = distanceKm !== null ? fmtDistance(distanceKm) : '—';
  const etaStr      = etaMins !== null ? fmtEta(etaMins) : '—';

  // ──────────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ──────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.loadingWrap}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={s.loadingText}>Menghubungkan ke driver…</Text>
      </View>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ──────────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={s.loadingWrap}>
        <StatusBar barStyle="light-content" />
        <Text style={s.errorEmoji}>⚠️</Text>
        <Text style={s.errorTitle}>Oops!</Text>
        <Text style={s.errorMsg}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => router.back()}>
          <Text style={s.retryBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FULL-SCREEN MAP
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        customMapStyle={SIPOLIN_MAP_STYLE}
        initialRegion={FALLBACK_REGION}
        showsUserLocation={false}
        showsCompass={false}
        showsMyLocationButton={false}
        showsTraffic={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        rotateEnabled={false}       // Keep map north-up (cleaner UX)
      >
        {/* ── Driver Marker (animated) ── */}
        {driverInfo?.latitude && (
          <Marker.Animated
            ref={driverMarkerRef}
            coordinate={driverAnimCoord}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <DriverMarkerView heading={0} />
          </Marker.Animated>
        )}

        {/* ── Customer Marker ── */}
        {customerCoord && (
          <Marker
            coordinate={customerCoord}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
          >
            <CustomerMarkerView />
          </Marker>
        )}

        {/* ── Route Polyline ── */}
        {driverInfo?.latitude && customerCoord && (
          <Polyline
            coordinates={[
              { latitude: driverInfo.latitude, longitude: driverInfo.longitude },
              customerCoord,
            ]}
            strokeColor="#2563eb"
            strokeWidth={3}
            lineDashPattern={[8, 6]}
            lineJoin="round"
            lineCap="round"
          />
        )}
      </MapView>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TOP NAV BAR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Animated.View entering={FadeIn.duration(400)} style={s.topBar}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>

        <View style={s.topCenter}>
          <Text style={s.topTitle}>Live Tracking</Text>
          <View style={[s.statusChip, { backgroundColor: statusConfig.bg }]}>
            <View style={[s.statusDot, { backgroundColor: statusConfig.color }]} />
            <Text style={[s.statusChipText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>

        <View style={s.connectionBadge}>
          <OnlineDot isOnline={isOnline} />
          <Text style={s.connectionText}>{isOnline ? 'Live' : 'Reconnecting…'}</Text>
        </View>
      </Animated.View>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          GLASSMORPHISM BOTTOM CARD
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Animated.View style={[s.bottomCard, cardStyle]}>
        {/* Blur layer */}
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Glass border overlay */}
        <View style={s.glassBorder} />

        {/* ── Content ── */}
        <View style={s.cardContent}>

          {/* Drag handle */}
          <View style={s.dragHandle} />

          {/* ── ETA + Distance row ── */}
          <View style={s.etaRow}>
            <View style={s.etaBlock}>
              <Text style={s.etaValue}>{etaStr}</Text>
              <Text style={s.etaLabel}>Estimasi Tiba</Text>
            </View>
            <View style={s.etaDivider} />
            <View style={s.etaBlock}>
              <Text style={s.etaValue}>{distanceStr}</Text>
              <Text style={s.etaLabel}>Jarak</Text>
            </View>
            <View style={s.etaDivider} />
            <View style={s.etaBlock}>
              <Text style={s.etaValue}>
                {order?.price ? `Rp ${Number(order.price).toLocaleString('id')}` : '—'}
              </Text>
              <Text style={s.etaLabel}>Tarif</Text>
            </View>
          </View>

          {/* Separator */}
          <View style={s.sep} />

          {/* ── Driver info row ── */}
          <View style={s.driverRow}>
            {/* Avatar */}
            <View style={s.driverAvatarWrap}>
              {driverInfo?.profilePicture ? (
                <Image
                  source={{ uri: driverInfo.profilePicture }}
                  style={s.driverAvatar}
                  contentFit="cover"
                  placeholder="LGF5?xYk^6#M@-5c,1J5@[or[Q6."
                  transition={300}
                />
              ) : (
                <View style={s.driverAvatarFallback}>
                  <Text style={s.driverAvatarInitial}>
                    {driverInfo?.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </Text>
                </View>
              )}
              {/* Verified badge */}
              {driverInfo?.isVerified && (
                <View style={s.verifiedBadge}>
                  <Text style={s.verifiedBadgeText}>✓</Text>
                </View>
              )}
            </View>

            {/* Name + vehicle */}
            <View style={s.driverMeta}>
              <Text style={s.driverName} numberOfLines={1}>
                {driverInfo?.name ?? 'Driver'}
              </Text>
              <Text style={s.driverVehicle} numberOfLines={1}>
                {driverInfo?.vehicleDetail ?? 'Motor'}{' '}
                {driverInfo?.plateNumber ? `• ${driverInfo.plateNumber}` : ''}
              </Text>
              <View style={s.driverRating}>
                <Text style={s.ratingStars}>★★★★★</Text>
                <Text style={s.ratingText}>Driver SIPOLIN</Text>
              </View>
            </View>

            {/* Call button */}
            <TouchableOpacity
              onPress={handleCall}
              style={s.callBtn}
              activeOpacity={0.8}
            >
              <View style={s.callBtnInner}>
                <Text style={s.callBtnIcon}>📞</Text>
              </View>
              <Text style={s.callBtnLabel}>Hubungi</Text>
            </TouchableOpacity>
          </View>

          {/* ── Route info ── */}
          <View style={s.routeCard}>
            <View style={s.routeRow}>
              <View style={[s.routeDot, { backgroundColor: '#22c55e' }]} />
              <Text style={s.routeText} numberOfLines={1}>{order?.pickup ?? '—'}</Text>
            </View>
            <View style={s.routeLine} />
            <View style={s.routeRow}>
              <View style={[s.routeDot, { backgroundColor: '#2563eb' }]} />
              <Text style={s.routeText} numberOfLines={1}>{order?.destination ?? '—'}</Text>
            </View>
          </View>

        </View>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  // ── Root ──────────────────────────────────────────────────────────────────
  root: {
    flex:            1,
    backgroundColor: '#0d1117',
  },

  // ── Loading / Error ───────────────────────────────────────────────────────
  loadingWrap: {
    flex:            1,
    backgroundColor: '#0d1117',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             12,
  },
  loadingText: {
    color:     '#6b7280',
    fontSize:  14,
    fontWeight:'500',
  },
  errorEmoji: { fontSize: 48 },
  errorTitle: {
    color:      '#f9fafb',
    fontSize:   22,
    fontWeight: '700',
  },
  errorMsg: {
    color:     '#9ca3af',
    fontSize:  14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  retryBtn: {
    marginTop:       16,
    backgroundColor: '#2563eb',
    borderRadius:    14,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  retryBtnText: {
    color:      '#fff',
    fontWeight: '700',
    fontSize:   15,
  },

  // ── Top Nav Bar ───────────────────────────────────────────────────────────
  topBar: {
    position:   'absolute',
    top:        0,
    left:       0,
    right:      0,
    paddingTop: Platform.OS === 'ios' ? 54 : StatusBar.currentHeight + 12,
    paddingBottom: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems:    'center',
    overflow:      'hidden',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width:           38,
    height:          38,
    borderRadius:    19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     0.5,
    borderColor:     'rgba(255,255,255,0.15)',
  },
  backBtnText: {
    color:    '#fff',
    fontSize: 20,
    lineHeight: 22,
  },
  topCenter: {
    flex:       1,
    alignItems: 'center',
    gap:        4,
  },
  topTitle: {
    color:         '#fff',
    fontSize:      15,
    fontWeight:    '700',
    letterSpacing: -0.3,
  },
  statusChip: {
    flexDirection:   'row',
    alignItems:      'center',
    borderRadius:    20,
    paddingVertical: 3,
    paddingHorizontal: 9,
    gap:             5,
  },
  statusDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  statusChipText: {
    fontSize:   11,
    fontWeight: '700',
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
    width:         38,
    justifyContent: 'flex-end',
  },
  connectionText: {
    color:    'rgba(255,255,255,0.5)',
    fontSize: 10,
  },

  // ── Online dot ────────────────────────────────────────────────────────────
  onlineDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },

  // ── Driver Marker ─────────────────────────────────────────────────────────
  driverMarkerWrap: {
    alignItems:    'center',
    justifyContent:'center',
  },
  driverMarkerArrow: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: '#1d4ed8',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2.5,
    borderColor:     '#60a5fa',
    // iOS shadow
    shadowColor:     '#2563eb',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.7,
    shadowRadius:    8,
    elevation:       12,
  },
  driverMarkerIcon: {
    fontSize: 22,
  },
  driverMarkerShadow: {
    width:           20,
    height:          6,
    borderRadius:    10,
    backgroundColor: 'rgba(37,99,235,0.3)',
    marginTop:       4,
  },

  // ── Customer Marker ───────────────────────────────────────────────────────
  customerMarkerWrap: {
    alignItems:    'center',
    justifyContent:'center',
  },
  customerMarkerPin: {
    width:           22,
    height:          22,
    borderRadius:    11,
    backgroundColor: '#2563eb',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     3,
    borderColor:     '#fff',
    shadowColor:     '#2563eb',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.6,
    shadowRadius:    6,
    elevation:       8,
  },
  customerMarkerDot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: '#fff',
  },

  // ── Bottom Glassmorphism Card ─────────────────────────────────────────────
  bottomCard: {
    position:            'absolute',
    bottom:              0,
    left:                0,
    right:               0,
    overflow:            'hidden',
    borderTopLeftRadius: 32,
    borderTopRightRadius:32,
    // Dark glass tint fallback (shown before blur renders)
    backgroundColor:    'rgba(10,14,26,0.75)',
  },
  glassBorder: {
    position:            'absolute',
    top:                 0,
    left:                0,
    right:               0,
    height:              1,
    backgroundColor:     'rgba(255,255,255,0.14)',
    borderTopLeftRadius: 32,
    borderTopRightRadius:32,
  },
  cardContent: {
    paddingTop:        10,
    paddingHorizontal: 20,
    paddingBottom:     Platform.OS === 'ios' ? 36 : 24,
  },

  // ── Drag handle ───────────────────────────────────────────────────────────
  dragHandle: {
    alignSelf:       'center',
    width:           40,
    height:          4,
    borderRadius:    2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom:    16,
  },

  // ── ETA Row ───────────────────────────────────────────────────────────────
  etaRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-around',
    marginBottom:   18,
  },
  etaBlock: {
    flex:       1,
    alignItems: 'center',
    gap:        2,
  },
  etaValue: {
    color:         '#f9fafb',
    fontSize:      18,
    fontWeight:    '800',
    letterSpacing: -0.5,
  },
  etaLabel: {
    color:    '#6b7280',
    fontSize: 11,
    fontWeight: '500',
  },
  etaDivider: {
    width:           1,
    height:          32,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // ── Separator ─────────────────────────────────────────────────────────────
  sep: {
    height:          1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom:    18,
  },

  // ── Driver Row ────────────────────────────────────────────────────────────
  driverRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           14,
    marginBottom:  18,
  },
  driverAvatarWrap: {
    position:     'relative',
    flexShrink:   0,
  },
  driverAvatar: {
    width:        56,
    height:       56,
    borderRadius: 28,
    borderWidth:  2,
    borderColor:  'rgba(255,255,255,0.2)',
  },
  driverAvatarFallback: {
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: '#1d4ed8',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     'rgba(96,165,250,0.4)',
  },
  driverAvatarInitial: {
    color:      '#fff',
    fontSize:   22,
    fontWeight: '800',
  },
  verifiedBadge: {
    position:        'absolute',
    bottom:          0,
    right:           0,
    width:           18,
    height:          18,
    borderRadius:    9,
    backgroundColor: '#2563eb',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1.5,
    borderColor:     '#0d1117',
  },
  verifiedBadgeText: {
    color:    '#fff',
    fontSize: 9,
    fontWeight:'800',
  },
  driverMeta: {
    flex: 1,
    gap:  3,
  },
  driverName: {
    color:         '#f9fafb',
    fontSize:      16,
    fontWeight:    '700',
    letterSpacing: -0.3,
  },
  driverVehicle: {
    color:    '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  driverRating: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
    marginTop:     2,
  },
  ratingStars: {
    color:    '#fbbf24',
    fontSize: 11,
  },
  ratingText: {
    color:    '#4b5563',
    fontSize: 11,
    fontWeight:'500',
  },

  // ── Call Button ───────────────────────────────────────────────────────────
  callBtn: {
    alignItems:  'center',
    gap:         4,
    flexShrink:  0,
  },
  callBtnInner: {
    width:           48,
    height:          48,
    borderRadius:    24,
    backgroundColor: '#2563eb',
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     '#2563eb',
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.5,
    shadowRadius:    10,
    elevation:       10,
  },
  callBtnIcon: {
    fontSize: 20,
  },
  callBtnLabel: {
    color:    '#6b7280',
    fontSize: 10,
    fontWeight:'600',
  },

  // ── Route Card ────────────────────────────────────────────────────────────
  routeCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius:    16,
    padding:         14,
    borderWidth:     0.5,
    borderColor:     'rgba(255,255,255,0.08)',
    gap:             6,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  routeDot: {
    width:        10,
    height:       10,
    borderRadius: 5,
    flexShrink:   0,
  },
  routeLine: {
    width:           1.5,
    height:          14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginLeft:      4,
  },
  routeText: {
    color:    '#d1d5db',
    fontSize: 13,
    fontWeight:'500',
    flex:     1,
  },
});