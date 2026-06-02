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

const MAX_FOOD_PRICE = 100000;
const DEFAULT_FOOD_PRICE = 20000;
const BASE_FEE = 5000;
const SERVICE_PERCENT = 0.1;

const PRIMARY = "#00AA5B";
const PRIMARY_DK = "#007A3E";
const ORANGE = "#F97316";
const PURPLE = "#7C3AED";
const INK = "#0f172a";
const INK_MID = "#334155";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const PAGE_BG = "#f4f6f8";
const WHITE = "#ffffff";
const RED = "#ef4444";

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

const LocationCard = ({ title, subtitle, location, icon, color, onPress }) => {
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
        {hasValue && location.note ? <Text style={S.locationNote} numberOfLines={1}>Catatan: {location.note}</Text> : null}
      </View>
      <View style={S.locationAction}>
        <Text style={[S.locationActionText, { color }]}>{hasValue ? "Ubah" : "Pilih"}</Text>
        <Feather name="chevron-right" size={18} color={color} />
      </View>
    </TouchableOpacity>
  );
};

export default function PolSendScreen() {
  const params = useLocalSearchParams();

  const [foodName, setFoodName] = useState(() => getParam(params.foodName, ""));
  const [restaurantName, setRestaurantName] = useState(() => getParam(params.restaurantName, ""));
  const [foodPrice, setFoodPrice] = useState(() => getParam(params.foodPrice, ""));
  const [pickup, setPickup] = useState(() => makeLocation(params, "pickup"));
  const [destination, setDestination] = useState(() => makeLocation(params, "destination"));
  const [note, setNote] = useState(() => getParam(params.generalNote, ""));
  const [loading, setLoading] = useState(false);

  const paramsKey = JSON.stringify({
    foodName: getParam(params.foodName, ""),
    restaurantName: getParam(params.restaurantName, ""),
    foodPrice: getParam(params.foodPrice, ""),
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
    setFoodName(getParam(params.foodName, ""));
    setRestaurantName(getParam(params.restaurantName, ""));
    setFoodPrice(getParam(params.foodPrice, ""));
    setPickup(makeLocation(params, "pickup"));
    setDestination(makeLocation(params, "destination"));
    setNote(getParam(params.generalNote, ""));
    // Jangan pakai [params]. useLocalSearchParams bisa bikin object baru tiap render,
    // lalu setState jalan terus dan memicu Maximum update depth exceeded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  const parsedPrice = foodPrice === "" ? DEFAULT_FOOD_PRICE : parseInt(foodPrice, 10);
  const priceIsValid =
    foodPrice === "" ||
    (!Number.isNaN(parsedPrice) && parsedPrice > 0 && parsedPrice <= MAX_FOOD_PRICE);

  const estimatedTotal = useMemo(() => {
    const base = Number.isNaN(parsedPrice) ? DEFAULT_FOOD_PRICE : parsedPrice;
    return Math.round(base + BASE_FEE + base * SERVICE_PERCENT);
  }, [parsedPrice]);

  const openPicker = (target) => {
    const selected = target === "pickup" ? pickup : destination;

    router.push({
      pathname: "/orders/create/map-picker",
      params: {
        service: "send",
        target,
        backPath: "/orders/create/pol_send",
        title: target === "pickup" ? "Pilih Lokasi Ambil" : "Pilih Lokasi Antar",
        subtitle:
          target === "pickup"
            ? "Pilih titik toko/kantin/tempat barang diambil."
            : "Pilih titik pesanan diantarkan.",
        label: selected.label,
        lat: selected.latitude,
        lng: selected.longitude,
        note: selected.note,
        foodName,
        restaurantName,
        foodPrice,
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

  const validate = () => {
    if (!foodName.trim()) {
      Alert.alert("Data belum lengkap", "Nama makanan/barang wajib diisi.");
      return false;
    }

    if (!restaurantName.trim()) {
      Alert.alert("Data belum lengkap", "Nama toko/kantin wajib diisi.");
      return false;
    }

    if (!pickup.label.trim()) {
      Alert.alert("Lokasi belum lengkap", "Pilih lokasi ambil dari map dulu.");
      return false;
    }

    if (!destination.label.trim()) {
      Alert.alert("Lokasi belum lengkap", "Pilih lokasi antar dari map dulu.");
      return false;
    }

    if (foodPrice !== "" && Number.isNaN(parseInt(foodPrice, 10))) {
      Alert.alert("Harga tidak valid", "Harga harus berupa angka.");
      return false;
    }

    if (foodPrice !== "" && parseInt(foodPrice, 10) > MAX_FOOD_PRICE) {
      Alert.alert("Harga terlalu besar", `Harga makanan maksimal ${formatRupiah(MAX_FOOD_PRICE)}.`);
      return false;
    }

    if (foodPrice !== "" && parseInt(foodPrice, 10) <= 0) {
      Alert.alert("Harga tidak valid", "Harga makanan harus lebih dari 0.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const price = foodPrice === "" ? DEFAULT_FOOD_PRICE : parseInt(foodPrice, 10);

      const response = await ordersAPI.createSend({
        foodName: foodName.trim(),
        itemName: foodName.trim(),
        restaurantName: restaurantName.trim(),
        foodPrice: price,
        pickupLocation: pickup.label.trim(),
        dropoffLocation: destination.label.trim(),
        pickupLatitude: pickup.latitude ? Number(pickup.latitude) : undefined,
        pickupLongitude: pickup.longitude ? Number(pickup.longitude) : undefined,
        destinationLatitude: destination.latitude ? Number(destination.latitude) : undefined,
        destinationLongitude: destination.longitude ? Number(destination.longitude) : undefined,
        pickupNote: pickup.note?.trim(),
        destinationNote: destination.note?.trim(),
        note: note.trim(),
      });

      const order = response?.data?.data || response?.data?.order || response?.data || null;
      const orderId = order?.id;

      if (response.data?.success || orderId) {
        Alert.alert("Pesanan Dibuat!", "Pesanan masuk dan sedang menunggu driver.", [
          {
            text: "Lihat Detail",
            onPress: () => (orderId ? router.replace(`/orders/${orderId}`) : router.back()),
          },
        ]);
      } else {
        Alert.alert("Error", response.data?.error || "Gagal membuat pesanan");
      }
    } catch (error) {
      console.error("Error creating Pol_Send:", error);
      const msg = error.response?.data?.error || error.message || "Terjadi kesalahan jaringan";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={S.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={S.content}>
          <LinearGradient colors={[PURPLE, PRIMARY]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.hero}>
            <View style={S.headerRow}>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={S.backButton}>
                <Feather name="arrow-left" size={21} color={WHITE} />
              </TouchableOpacity>

              <View style={S.heroIcon}>
                <Ionicons name="bag-handle" size={23} color={PURPLE} />
              </View>
            </View>

            <Text style={S.heroTitle}>Pol-Send</Text>
            <Text style={S.heroSubtitle}>Titip makanan/barang, driver ambil ke toko lalu antar ke titik tujuan kamu.</Text>

            <View style={S.heroStats}>
              <View style={S.heroStatItem}>
                <Feather name="shopping-bag" size={15} color={WHITE} />
                <Text style={S.heroStatText}>Jastip</Text>
              </View>
              <View style={S.heroStatItem}>
                <Feather name="map-pin" size={15} color={WHITE} />
                <Text style={S.heroStatText}>Ambil & antar</Text>
              </View>
              <View style={S.heroStatItem}>
                <Feather name="clock" size={15} color={WHITE} />
                <Text style={S.heroStatText}>Praktis</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={S.card}>
            <View style={S.sectionHeader}>
              <View>
                <Text style={S.sectionTitle}>Detail Pesanan</Text>
                <Text style={S.sectionSubtitle}>Isi barang yang mau dititip</Text>
              </View>
              <View style={S.miniIcon}>
                <MaterialCommunityIcons name="food-fork-drink" size={22} color={PURPLE} />
              </View>
            </View>

            <Text style={S.inputLabel}>Nama makanan/barang</Text>
            <TextInput
              value={foodName}
              onChangeText={setFoodName}
              placeholder="Contoh: Seblak ceker level 3"
              placeholderTextColor="#94a3b8"
              style={S.input}
              editable={!loading}
            />

            <Text style={S.inputLabel}>Nama toko/kantin</Text>
            <TextInput
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="Contoh: Seblak Teh Rina / Kantin Teknik"
              placeholderTextColor="#94a3b8"
              style={S.input}
              editable={!loading}
            />

            <Text style={S.inputLabel}>Harga makanan/barang</Text>
            <TextInput
              value={foodPrice}
              onChangeText={setFoodPrice}
              placeholder="Kosongkan untuk default Rp 20.000"
              placeholderTextColor="#94a3b8"
              style={[S.input, !priceIsValid && { borderColor: RED, backgroundColor: "#fff1f2" }]}
              keyboardType="numeric"
              editable={!loading}
            />
            <Text style={[S.helperText, !priceIsValid && { color: RED }]}>Maksimal {formatRupiah(MAX_FOOD_PRICE)}</Text>
          </View>

          <View style={S.card}>
            <View style={S.sectionHeader}>
              <View>
                <Text style={S.sectionTitle}>Lokasi Pengiriman</Text>
                <Text style={S.sectionSubtitle}>Pilih titik ambil dan titik antar</Text>
              </View>
              <View style={[S.miniIcon, { backgroundColor: "#ecfdf5" }]}>
                <MaterialCommunityIcons name="map-marker-path" size={22} color={PRIMARY} />
              </View>
            </View>

            <LocationCard
              title="Lokasi Ambil / Toko"
              subtitle="Pilih titik toko/kantin di map"
              location={pickup}
              icon="shopping-bag"
              color={PRIMARY}
              onPress={() => openPicker("pickup")}
            />

            <View style={S.routeConnector}>
              <View style={S.routeDot} />
              <View style={S.routeLine} />
              <View style={[S.routeDot, { backgroundColor: ORANGE }]} />
            </View>

            <LocationCard
              title="Lokasi Antar"
              subtitle="Pilih titik tujuan antar di map"
              location={destination}
              icon="map-pin"
              color={ORANGE}
              onPress={() => openPicker("destination")}
            />
          </View>

          <View style={S.card}>
            <Text style={S.inputLabel}>Catatan pesanan</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Contoh: jangan terlalu pedas, tambah telur, bayar dulu nanti aku ganti"
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
                <Text style={S.priceLabel}>Estimasi Total</Text>
                <Text style={S.priceSub}>Harga barang + fee jastip 10% + {formatRupiah(BASE_FEE)}</Text>
              </View>
              <View style={S.priceIcon}>
                <Feather name="credit-card" size={20} color={WHITE} />
              </View>
            </View>
            <Text style={S.priceValue}>{formatRupiah(estimatedTotal)}</Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !priceIsValid}
            style={[S.submitButton, (loading || !priceIsValid) && { opacity: 0.65 }]}
            activeOpacity={0.88}
          >
            {loading ? <ActivityIndicator color={WHITE} /> : <Text style={S.submitText}>Buat Pesanan Pol-Send</Text>}
          </TouchableOpacity>
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
  card: { marginHorizontal: 16, marginTop: 14, backgroundColor: WHITE, borderRadius: 26, padding: 16, borderWidth: 1, borderColor: BORDER, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { color: INK, fontSize: 17, fontWeight: "900" },
  sectionSubtitle: { color: MUTED, fontSize: 12, fontWeight: "600", marginTop: 2 },
  miniIcon: { width: 42, height: 42, borderRadius: 16, backgroundColor: "#f5f3ff", alignItems: "center", justifyContent: "center" },
  inputLabel: { color: INK, fontSize: 13, fontWeight: "900", marginBottom: 7, marginTop: 7 },
  input: { minHeight: 50, borderRadius: 17, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, color: INK, fontSize: 14, fontWeight: "700" },
  helperText: { color: MUTED, fontSize: 11, fontWeight: "600", marginTop: 6 },
  noteInput: { minHeight: 90, borderRadius: 18, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingTop: 12, color: INK, fontSize: 14, fontWeight: "600" },
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
  priceCard: { marginHorizontal: 16, marginTop: 14, borderRadius: 26, backgroundColor: "#f5f3ff", borderWidth: 1, borderColor: "#ddd6fe", padding: 18 },
  priceTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceLabel: { color: PURPLE, fontSize: 13, fontWeight: "900" },
  priceSub: { color: MUTED, fontSize: 12, fontWeight: "600", marginTop: 3, maxWidth: 230 },
  priceIcon: { width: 42, height: 42, borderRadius: 16, backgroundColor: PURPLE, alignItems: "center", justifyContent: "center" },
  priceValue: { color: INK, fontSize: 30, fontWeight: "900", marginTop: 12 },
  submitButton: { marginHorizontal: 16, marginTop: 16, height: 56, borderRadius: 19, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center", shadowColor: PRIMARY, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
  submitText: { color: WHITE, fontSize: 15, fontWeight: "900" },
});
