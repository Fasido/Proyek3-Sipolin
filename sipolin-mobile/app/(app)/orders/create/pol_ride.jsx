import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { ordersAPI } from "../../../../services/api";

const FIRST_KM_FARE = 5000;
const NEXT_KM_FARE = 3000;
const ROAD_FACTOR = 1.25;

const PRIMARY = "#00AA5B";
const PRIMARY_DK = "#007A3E";
const ORANGE = "#F97316";
const INK = "#0f172a";
const INK_MID = "#334155";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const PAGE_BG = "#f4f6f8";
const WHITE = "#ffffff";

const getParam = (value, fallback = "") => {
  if (Array.isArray(value)) return value[0] ?? fallback;
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const makeLocation = (params, key) => ({
  label: getParam(params[`${key}Label`], ""),
  latitude: getParam(params[`${key}Lat`], ""),
  longitude: getParam(params[`${key}Lng`], ""),
  note: getParam(params[`${key}Note`], ""),
});

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getOrderFromResponse(response) {
  return response?.data?.data || response?.data?.order || response?.data || null;
}


const toFiniteNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const getLocationCoord = (location) => {
  const latitude = toFiniteNumber(location?.latitude);
  const longitude = toFiniteNumber(location?.longitude);

  if (latitude === null || longitude === null) return null;
  return { latitude, longitude };
};

const haversineKm = (a, b) => {
  if (!a || !b) return null;

  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const estimateRouteDistanceKm = (pickup, destination) => {
  const start = getLocationCoord(pickup);
  const end = getLocationCoord(destination);
  const directKm = haversineKm(start, end);

  if (!directKm || directKm <= 0) return null;

  // Haversine itu garis lurus. Dikalikan road factor biar lebih dekat
  // dengan jarak jalan asli di lapangan.
  return Math.max(1, directKm * ROAD_FACTOR);
};

const calculateDistanceFare = (distanceKm) => {
  if (!distanceKm || distanceKm <= 0) return FIRST_KM_FARE;

  const extraKm = Math.max(0, Math.ceil(distanceKm - 1));
  return FIRST_KM_FARE + extraKm * NEXT_KM_FARE;
};

const formatDistance = (distanceKm) => {
  if (!distanceKm) return "Pilih dua titik";
  if (distanceKm < 1) return "< 1 km";
  return `${distanceKm.toFixed(1)} km`;
};

const getExtraKm = (distanceKm) => {
  if (!distanceKm || distanceKm <= 1) return 0;
  return Math.max(0, Math.ceil(distanceKm - 1));
};


const LocationCard = ({ type, title, subtitle, location, icon, color, onPress }) => {
  const hasValue = Boolean(location?.label);

  return (
    <TouchableOpacity style={S.locationCard} activeOpacity={0.86} onPress={onPress}>
      <View style={[S.locationIcon, { backgroundColor: color === ORANGE ? "#fff7ed" : "#ecfdf5" }]}>
        <Feather name={icon} size={20} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={S.locationTitle}>{title}</Text>
        <Text style={[S.locationValue, !hasValue && { color: MUTED, fontWeight: "700" }]} numberOfLines={2}>
          {hasValue ? location.label : subtitle}
        </Text>
        {hasValue && location.note ? (
          <Text style={S.locationNote} numberOfLines={1}>Catatan: {location.note}</Text>
        ) : null}
      </View>

      <View style={S.locationAction}>
        <Text style={[S.locationActionText, { color }]}>{hasValue ? "Ubah" : "Pilih"}</Text>
        <Feather name="chevron-right" size={18} color={color} />
      </View>
    </TouchableOpacity>
  );
};

export default function PolRideScreen() {
  const params = useLocalSearchParams();

  const [pickup, setPickup] = useState(() => makeLocation(params, "pickup"));
  const [destination, setDestination] = useState(() => makeLocation(params, "destination"));
  const [note, setNote] = useState(() => getParam(params.generalNote, ""));
  const [loading, setLoading] = useState(false);

  const paramsKey = JSON.stringify({
    generalNote: getParam(params.generalNote, ""),
    pickupLabel: getParam(params.pickupLabel, ""),
    pickupLat: getParam(params.pickupLat, ""),
    pickupLng: getParam(params.pickupLng, ""),
    pickupNote: getParam(params.pickupNote, ""),
    destinationLabel: getParam(params.destinationLabel, ""),
    destinationLat: getParam(params.destinationLat, ""),
    destinationLng: getParam(params.destinationLng, ""),
    destinationNote: getParam(params.destinationNote, ""),
  });

  useEffect(() => {
    setPickup(makeLocation(params, "pickup"));
    setDestination(makeLocation(params, "destination"));
    setNote(getParam(params.generalNote, ""));
    // Jangan pakai [params]. useLocalSearchParams bisa bikin object baru tiap render,
    // lalu setState jalan terus dan memicu Maximum update depth exceeded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  const estimatedDistanceKm = useMemo(() => {
    return estimateRouteDistanceKm(pickup, destination);
  }, [pickup, destination]);

  const estimatedPrice = useMemo(() => {
    return calculateDistanceFare(estimatedDistanceKm);
  }, [estimatedDistanceKm]);

  const extraKm = getExtraKm(estimatedDistanceKm);

  const openPicker = (target) => {
    const selected = target === "pickup" ? pickup : destination;

    router.push({
      pathname: "/orders/create/map-picker",
      params: {
        service: "ride",
        target,
        backPath: "/orders/create/pol_ride",
        title: target === "pickup" ? "Pilih Lokasi Jemput" : "Pilih Lokasi Tujuan",
        subtitle:
          target === "pickup"
            ? "Pilih titik kamu menunggu driver. Bisa pakai lokasi sekarang."
            : "Pilih titik tujuan perjalanan kamu.",
        label: selected.label,
        lat: selected.latitude,
        lng: selected.longitude,
        note: selected.note,
        generalNote: note,
        pickupLabel: pickup.label,
        pickupLat: pickup.latitude,
        pickupLng: pickup.longitude,
        pickupNote: pickup.note,
        destinationLabel: destination.label,
        destinationLat: destination.latitude,
        destinationLng: destination.longitude,
        destinationNote: destination.note,
      },
    });
  };

  const handleSubmit = async () => {
    if (!pickup.label.trim()) {
      Alert.alert("Lokasi belum lengkap", "Pilih lokasi jemput dulu dari map.");
      return;
    }

    if (!destination.label.trim()) {
      Alert.alert("Lokasi belum lengkap", "Pilih lokasi tujuan dulu dari map.");
      return;
    }

    setLoading(true);

    try {
      const response = await ordersAPI.createRide({
        pickupLocation: pickup.label.trim(),
        dropoffLocation: destination.label.trim(),
        pickupLatitude: pickup.latitude ? Number(pickup.latitude) : undefined,
        pickupLongitude: pickup.longitude ? Number(pickup.longitude) : undefined,
        destinationLatitude: destination.latitude ? Number(destination.latitude) : undefined,
        destinationLongitude: destination.longitude ? Number(destination.longitude) : undefined,
        pickupNote: pickup.note?.trim(),
        destinationNote: destination.note?.trim(),
        estimatedDistanceKm: estimatedDistanceKm || 1,
        estimatedPrice,
        note: note.trim(),
      });

      const order = getOrderFromResponse(response);
      const orderId = order?.id || response?.data?.id;

      if (!response?.data?.success && !orderId) {
        Alert.alert("Gagal membuat pesanan", response?.data?.error || "Pesanan gagal dibuat.");
        return;
      }

      if (!orderId) {
        Alert.alert("Pesanan dibuat", "Pesanan berhasil masuk database, tapi ID pesanan tidak ditemukan dari backend.");
        return;
      }

      router.replace(`/orders/${orderId}`);
    } catch (error) {
      console.error("Error creating Pol-Ride:", error);

      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Terjadi kesalahan jaringan.";

      Alert.alert("Gagal membuat pesanan", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={S.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_DK} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={S.content}>
          <LinearGradient colors={[PRIMARY_DK, PRIMARY]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.hero}>
            <View style={S.headerRow}>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={S.backButton}>
                <Feather name="arrow-left" size={21} color={WHITE} />
              </TouchableOpacity>

              <View style={S.heroIcon}>
                <Ionicons name="bicycle" size={24} color={PRIMARY} />
              </View>
            </View>

            <Text style={S.heroTitle}>Pol-Ride</Text>
            <Text style={S.heroSubtitle}>Pesan driver lokal buat antar-jemput. Pilih titiknya dari map biar driver gak nebak-nebak.</Text>

            <View style={S.heroStats}>
              <View style={S.heroStatItem}>
                <Feather name="zap" size={15} color={WHITE} />
                <Text style={S.heroStatText}>Cepat</Text>
              </View>
              <View style={S.heroStatItem}>
                <Feather name="map-pin" size={15} color={WHITE} />
                <Text style={S.heroStatText}>Titik presisi</Text>
              </View>
              <View style={S.heroStatItem}>
                <Feather name="shield" size={15} color={WHITE} />
                <Text style={S.heroStatText}>Driver kampus</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={S.mainCard}>
            <View style={S.sectionHeader}>
              <View>
                <Text style={S.sectionTitle}>Rute Perjalanan</Text>
                <Text style={S.sectionSubtitle}>Tap kartu untuk pilih titik di map</Text>
              </View>
              <View style={S.routeMiniIcon}>
                <MaterialCommunityIcons name="map-marker-path" size={22} color={PRIMARY} />
              </View>
            </View>

            <LocationCard
              title="Lokasi Jemput"
              subtitle="Pilih titik kamu dijemput"
              location={pickup}
              icon="navigation"
              color={PRIMARY}
              onPress={() => openPicker("pickup")}
            />

            <View style={S.routeConnector}>
              <View style={S.routeDot} />
              <View style={S.routeLine} />
              <View style={[S.routeDot, { backgroundColor: ORANGE }]} />
            </View>

            <LocationCard
              title="Lokasi Tujuan"
              subtitle="Pilih titik tujuan"
              location={destination}
              icon="map-pin"
              color={ORANGE}
              onPress={() => openPicker("destination")}
            />
          </View>

          <View style={S.noteCard}>
            <Text style={S.inputLabel}>Catatan perjalanan</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Contoh: Saya bawa tas besar, tunggu di depan gerbang"
              placeholderTextColor="#94a3b8"
              style={S.noteInput}
              multiline
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          <View style={S.priceCard}>
            <View style={S.priceTop}>
              <View>
                <Text style={S.priceLabel}>Estimasi Harga</Text>
                <Text style={S.priceSub}>Estimasi jarak {formatDistance(estimatedDistanceKm)}</Text>
              </View>
              <View style={S.priceIcon}>
                <Feather name="tag" size={20} color={WHITE} />
              </View>
            </View>

            <Text style={S.priceValue}>{formatRupiah(estimatedPrice)}</Text>

            <View style={S.priceDivider} />

            <View style={S.rowBetween}>
              <Text style={S.mutedText}>1 km pertama</Text>
              <Text style={S.boldText}>{formatRupiah(FIRST_KM_FARE)}</Text>
            </View>
            <View style={S.rowBetween}>
              <Text style={S.mutedText}>Km berikutnya ({extraKm} km × {formatRupiah(NEXT_KM_FARE)})</Text>
              <Text style={S.boldText}>{formatRupiah(extraKm * NEXT_KM_FARE)}</Text>
            </View>
          </View>

          <TouchableOpacity style={[S.submitButton, loading && { opacity: 0.65 }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.88}>
            {loading ? <ActivityIndicator color={WHITE} /> : <Text style={S.submitText}>Cari Driver Sekarang</Text>}
          </TouchableOpacity>

          <Text style={S.footerText}>Pesanan akan masuk status pending, lalu driver bisa mengambil order kamu.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BG },
  content: { paddingBottom: 34 },
  hero: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 26, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  backButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  heroIcon: { width: 46, height: 46, borderRadius: 17, backgroundColor: WHITE, alignItems: "center", justifyContent: "center" },
  heroTitle: { color: WHITE, fontSize: 30, fontWeight: "900", letterSpacing: -0.6 },
  heroSubtitle: { color: "rgba(255,255,255,0.86)", fontSize: 14, lineHeight: 21, marginTop: 8, fontWeight: "600" },
  heroStats: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 18 },
  heroStatItem: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  heroStatText: { color: WHITE, fontSize: 11, fontWeight: "800" },
  mainCard: { marginHorizontal: 16, marginTop: -12, backgroundColor: WHITE, borderRadius: 26, padding: 16, borderWidth: 1, borderColor: BORDER, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 5 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { color: INK, fontSize: 17, fontWeight: "900" },
  sectionSubtitle: { color: MUTED, fontSize: 12, fontWeight: "600", marginTop: 2 },
  routeMiniIcon: { width: 42, height: 42, borderRadius: 16, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center" },
  locationCard: { minHeight: 86, borderRadius: 22, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: BORDER, padding: 13, flexDirection: "row", alignItems: "center", gap: 12 },
  locationIcon: { width: 46, height: 46, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  locationTitle: { color: INK, fontSize: 13, fontWeight: "900" },
  locationValue: { color: INK_MID, fontSize: 14, fontWeight: "900", lineHeight: 19, marginTop: 3 },
  locationNote: { color: MUTED, fontSize: 11, fontWeight: "600", marginTop: 4 },
  locationAction: { alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 2 },
  locationActionText: { fontSize: 11, fontWeight: "900" },
  routeConnector: { height: 24, marginLeft: 35, flexDirection: "row", alignItems: "center" },
  routeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: PRIMARY },
  routeLine: { height: 2, flex: 1, backgroundColor: "#dbeafe", marginHorizontal: 8, borderRadius: 999 },
  noteCard: { marginHorizontal: 16, marginTop: 14, backgroundColor: WHITE, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: BORDER },
  inputLabel: { color: INK, fontSize: 13, fontWeight: "900", marginBottom: 8 },
  noteInput: { minHeight: 90, borderRadius: 18, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingTop: 12, color: INK, fontSize: 14, fontWeight: "600" },
  priceCard: { marginHorizontal: 16, marginTop: 14, borderRadius: 26, backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#bbf7d0", padding: 18 },
  priceTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceLabel: { color: PRIMARY_DK, fontSize: 13, fontWeight: "900" },
  priceSub: { color: MUTED, fontSize: 12, fontWeight: "600", marginTop: 3 },
  priceIcon: { width: 42, height: 42, borderRadius: 16, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center" },
  priceValue: { color: INK, fontSize: 30, fontWeight: "900", marginTop: 12 },
  priceDivider: { height: 1, backgroundColor: "#bbf7d0", marginVertical: 14 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 7 },
  mutedText: { color: MUTED, fontSize: 13, fontWeight: "600" },
  boldText: { color: INK_MID, fontSize: 13, fontWeight: "900" },
  submitButton: { marginHorizontal: 16, marginTop: 16, height: 56, borderRadius: 19, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center", shadowColor: PRIMARY, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
  submitText: { color: WHITE, fontSize: 15, fontWeight: "900" },
  footerText: { color: MUTED, textAlign: "center", fontSize: 12, lineHeight: 18, marginHorizontal: 35, marginTop: 13, fontWeight: "600" },
});
