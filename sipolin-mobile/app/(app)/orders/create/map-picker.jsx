import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";

const PRIMARY = "#00AA5B";
const PRIMARY_DK = "#007A3E";
const ORANGE = "#F97316";
const INK = "#0f172a";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const PAGE_BG = "#f4f6f8";
const WHITE = "#ffffff";

const FALLBACK_REGION = {
  latitude: -6.3272,
  longitude: 108.3249,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

const getParam = (value, fallback = "") => {
  if (Array.isArray(value)) return value[0] ?? fallback;
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const toNumber = (value) => {
  const n = Number(getParam(value, ""));
  return Number.isFinite(n) ? n : null;
};

const formatCoord = (coord) => {
  if (!coord) return "Titik belum dipilih";
  return `${coord.latitude.toFixed(6)}, ${coord.longitude.toFixed(6)}`;
};

const reverseName = async (coord) => {
  try {
    const places = await Location.reverseGeocodeAsync(coord);
    const p = places?.[0];
    if (!p) return "";

    return [
      p.name,
      p.street,
      p.district,
      p.subregion,
      p.city,
    ]
      .filter(Boolean)
      .slice(0, 4)
      .join(", ");
  } catch {
    return "";
  }
};

export default function MapPickerScreen() {
  const params = useLocalSearchParams();
  const mapRef = useRef(null);

  const service = getParam(params.service, "ride");
  const target = getParam(params.target, "pickup");
  const backPath = getParam(params.backPath, "/orders/create/pol_ride");
  const title = getParam(
    params.title,
    target === "destination" ? "Pilih Lokasi Tujuan" : "Pilih Lokasi Jemput"
  );
  const subtitle = getParam(
    params.subtitle,
    "Geser peta atau tap titik yang sesuai. Tambahkan catatan supaya driver gampang menemukan kamu."
  );

  const initialLat = toNumber(params.lat);
  const initialLng = toNumber(params.lng);

  const [region, setRegion] = useState(
    initialLat && initialLng
      ? {
          latitude: initialLat,
          longitude: initialLng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : FALLBACK_REGION
  );
  const [coord, setCoord] = useState(
    initialLat && initialLng
      ? { latitude: initialLat, longitude: initialLng }
      : null
  );
  const [label, setLabel] = useState(getParam(params.label, ""));
  const [note, setNote] = useState(getParam(params.note, ""));
  const [locating, setLocating] = useState(false);

  const tone = target === "destination" ? ORANGE : PRIMARY;

  const carryParams = useMemo(() => {
    const keys = [
      "foodName",
      "restaurantName",
      "foodPrice",
      "generalNote",
      "pickupLabel",
      "pickupLat",
      "pickupLng",
      "pickupNote",
      "destinationLabel",
      "destinationLat",
      "destinationLng",
      "destinationNote",
    ];

    const next = { service };
    keys.forEach((key) => {
      const value = getParam(params[key], "");
      if (value !== "") next[key] = value;
    });
    return next;
  }, [params, service]);

  const setLocation = async (nextCoord, shouldReverse = true) => {
    setCoord(nextCoord);
    setRegion({ ...nextCoord, latitudeDelta: 0.01, longitudeDelta: 0.01 });

    mapRef.current?.animateToRegion(
      { ...nextCoord, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      450
    );

    if (shouldReverse && !label.trim()) {
      const name = await reverseName(nextCoord);
      if (name) setLabel(name);
    }
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin lokasi ditolak",
          "Aktifkan izin lokasi supaya bisa memakai titik posisi sekarang."
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const next = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      await setLocation(next, true);
    } catch (error) {
      Alert.alert("Gagal mengambil lokasi", error?.message || "Coba ulang lagi.");
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    if (!coord) {
      useMyLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = () => {
    if (!coord) {
      Alert.alert("Titik belum dipilih", "Tap peta atau pakai lokasi sekarang dulu.");
      return;
    }

    if (!label.trim()) {
      Alert.alert("Nama lokasi belum diisi", "Isi nama lokasi supaya driver gampang menemukan titiknya.");
      return;
    }

    router.replace({
      pathname: backPath,
      params: {
        ...carryParams,
        [`${target}Label`]: label.trim(),
        [`${target}Lat`]: String(coord.latitude),
        [`${target}Lng`]: String(coord.longitude),
        [`${target}Note`]: note.trim(),
      },
    });
  };

  return (
    <SafeAreaView style={S.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_DK} />

      <LinearGradient
        colors={[PRIMARY_DK, PRIMARY]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={S.header}
      >
        <View style={S.headerTop}>
          <TouchableOpacity style={S.headerButton} activeOpacity={0.8} onPress={() => router.back()}>
            <Feather name="arrow-left" size={21} color={WHITE} />
          </TouchableOpacity>

          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={S.headerTitle}>{title}</Text>
            <Text style={S.headerSubtitle}>{subtitle}</Text>
          </View>

          <View style={S.headerIcon}>
            <Ionicons name={service === "send" ? "bag-handle" : "bicycle"} size={22} color={PRIMARY} />
          </View>
        </View>
      </LinearGradient>

      <View style={S.mapWrap}>
        <MapView
          ref={mapRef}
          style={S.map}
          initialRegion={region}
          onPress={(event) => setLocation(event.nativeEvent.coordinate, true)}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
        >
          {coord && (
            <Marker coordinate={coord} draggable onDragEnd={(event) => setLocation(event.nativeEvent.coordinate, true)}>
              <View style={[S.markerBubble, { backgroundColor: tone }]}>
                <Ionicons name="location" size={22} color={WHITE} />
              </View>
            </Marker>
          )}
        </MapView>

        <TouchableOpacity style={S.locateButton} activeOpacity={0.85} onPress={useMyLocation} disabled={locating}>
          {locating ? (
            <ActivityIndicator size="small" color={PRIMARY} />
          ) : (
            <Feather name="crosshair" size={20} color={PRIMARY} />
          )}
          <Text style={S.locateText}>Pakai lokasi saya</Text>
        </TouchableOpacity>
      </View>

      <View style={S.bottomCard}>
        <View style={S.dragHandle} />

        <View style={S.coordRow}>
          <View style={[S.smallIcon, { backgroundColor: target === "destination" ? "#fff7ed" : "#ecfdf5" }]}>
            <Feather name={target === "destination" ? "map-pin" : "navigation"} size={18} color={tone} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={S.coordLabel}>Koordinat dipilih</Text>
            <Text style={S.coordText}>{formatCoord(coord)}</Text>
          </View>
        </View>

        <Text style={S.inputLabel}>Nama lokasi</Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder="Contoh: Gerbang Polindra / Kantin Teknik"
          placeholderTextColor="#94a3b8"
          style={S.input}
        />

        <Text style={S.inputLabel}>Catatan lokasi</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Contoh: depan pagar hitam, dekat pos satpam, lantai 2"
          placeholderTextColor="#94a3b8"
          style={[S.input, S.noteInput]}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={[S.confirmButton, { backgroundColor: tone }]} activeOpacity={0.88} onPress={handleConfirm}>
          <Text style={S.confirmText}>Pakai Titik Ini</Text>
          <Feather name="check" size={19} color={WHITE} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BG },
  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: "row", alignItems: "center" },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: WHITE, fontSize: 18, fontWeight: "900" },
  headerSubtitle: { color: "rgba(255,255,255,0.82)", fontSize: 12, lineHeight: 17, marginTop: 3 },
  mapWrap: { flex: 1, margin: 14, borderRadius: 26, overflow: "hidden", backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER },
  map: { flex: 1 },
  markerBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  locateButton: {
    position: "absolute",
    right: 14,
    top: 14,
    minHeight: 42,
    borderRadius: 16,
    backgroundColor: WHITE,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  locateText: { color: INK, fontSize: 12, fontWeight: "800" },
  bottomCard: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 12,
  },
  dragHandle: { width: 42, height: 4, borderRadius: 999, backgroundColor: "#cbd5e1", alignSelf: "center", marginBottom: 14 },
  coordRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  smallIcon: { width: 42, height: 42, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  coordLabel: { color: MUTED, fontSize: 12, fontWeight: "700" },
  coordText: { color: INK, fontSize: 14, fontWeight: "900", marginTop: 2 },
  inputLabel: { color: INK, fontSize: 13, fontWeight: "900", marginBottom: 7 },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    color: INK,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  noteInput: { minHeight: 74, paddingTop: 12, fontWeight: "600" },
  confirmButton: {
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  confirmText: { color: WHITE, fontSize: 15, fontWeight: "900" },
});
