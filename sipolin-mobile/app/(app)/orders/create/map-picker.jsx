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
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const PRIMARY = "#00AA5B";
const PRIMARY_DK = "#007A3E";
const ORANGE = "#F97316";
const INK = "#0f172a";
const INK_MID = "#334155";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const PAGE_BG = "#f4f6f8";
const WHITE = "#ffffff";
const BLUE = "#2563eb";
const RED = "#ef4444";

// Area kerja Sipolin: Indramayu dan sekitar.
// Ini sengaja dibatasi supaya map tidak loncat jauh ke luar Indonesia/Filipina.
const INDRAMAYU_CENTER = {
  latitude: -6.3272,
  longitude: 108.3249,
};

const INDRAMAYU_BOUNDS = {
  south: -6.75,
  west: 107.85,
  north: -5.95,
  east: 108.85,
};

const getParam = (value, fallback = "") => {
  if (Array.isArray(value)) return value[0] ?? fallback;
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const toNumber = (value) => {
  const raw = getParam(value, "");
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const makeCoord = (latitude, longitude) => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
};

const clampCoord = (coord) => {
  if (!coord) return INDRAMAYU_CENTER;

  const latitude = Math.min(
    Math.max(Number(coord.latitude), INDRAMAYU_BOUNDS.south),
    INDRAMAYU_BOUNDS.north
  );

  const longitude = Math.min(
    Math.max(Number(coord.longitude), INDRAMAYU_BOUNDS.west),
    INDRAMAYU_BOUNDS.east
  );

  return { latitude, longitude };
};

const isInsideIndramayu = (coord) => {
  if (!coord) return false;

  return (
    coord.latitude >= INDRAMAYU_BOUNDS.south &&
    coord.latitude <= INDRAMAYU_BOUNDS.north &&
    coord.longitude >= INDRAMAYU_BOUNDS.west &&
    coord.longitude <= INDRAMAYU_BOUNDS.east
  );
};

const formatCoord = (coord) => {
  if (!coord) return "Geser peta untuk memilih titik";
  return `${coord.latitude.toFixed(6)}, ${coord.longitude.toFixed(6)}`;
};

const isSameCoord = (a, b) => {
  if (!a || !b) return false;

  return (
    Math.abs(Number(a.latitude) - Number(b.latitude)) < 0.00001 &&
    Math.abs(Number(a.longitude) - Number(b.longitude)) < 0.00001
  );
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

const buildMapHtml = ({ latitude, longitude }) => {
  const bounds = [
    [INDRAMAYU_BOUNDS.south, INDRAMAYU_BOUNDS.west],
    [INDRAMAYU_BOUNDS.north, INDRAMAYU_BOUNDS.east],
  ];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
  />

  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />

  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #eef2f7;
      overflow: hidden;
      touch-action: none;
    }

    .leaflet-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      background: #eef2f7;
    }

    .leaflet-control-attribution {
      font-size: 10px;
      opacity: 0.75;
    }

    .leaflet-control-zoom {
      border: none !important;
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16) !important;
      border-radius: 14px !important;
      overflow: hidden !important;
    }

    .leaflet-control-zoom a {
      width: 38px !important;
      height: 38px !important;
      line-height: 38px !important;
      font-size: 21px !important;
      color: #0f172a !important;
      border: none !important;
    }

    .area-label {
      background: rgba(255,255,255,0.94);
      border: 1px solid rgba(0,170,91,0.25);
      color: #007A3E;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 800;
      box-shadow: 0 6px 16px rgba(15,23,42,0.15);
    }
  </style>
</head>

<body>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <script>
    const BOUNDS = ${JSON.stringify(bounds)};
    const CENTER = [${latitude}, ${longitude}];

    function clampLatLng(lat, lng) {
      const south = ${INDRAMAYU_BOUNDS.south};
      const west = ${INDRAMAYU_BOUNDS.west};
      const north = ${INDRAMAYU_BOUNDS.north};
      const east = ${INDRAMAYU_BOUNDS.east};

      return {
        lat: Math.min(Math.max(Number(lat), south), north),
        lng: Math.min(Math.max(Number(lng), west), east)
      };
    }

    function sendMessage(payload) {
      try {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      } catch (e) {}
    }

    const map = L.map("map", {
      center: CENTER,
      zoom: 15,
      minZoom: 10,
      maxZoom: 19,
      zoomControl: true,
      attributionControl: true,
      maxBounds: BOUNDS,
      maxBoundsViscosity: 1.0,
      inertia: true,
      worldCopyJump: false,
      preferCanvas: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      minZoom: 10,
      attribution: "© OpenStreetMap",
      noWrap: true,
      bounds: BOUNDS
    }).addTo(map);

    L.rectangle(BOUNDS, {
      color: "#00AA5B",
      weight: 1,
      opacity: 0.25,
      fillOpacity: 0.015
    }).addTo(map);

    L.marker([${INDRAMAYU_CENTER.latitude}, ${INDRAMAYU_CENTER.longitude}], {
      opacity: 0
    })
      .bindTooltip("Area Indramayu", {
        permanent: false,
        direction: "top",
        className: "area-label"
      })
      .addTo(map);

    function postCenter(type = "center") {
      const center = map.getCenter();
      const clamped = clampLatLng(center.lat, center.lng);

      if (Math.abs(center.lat - clamped.lat) > 0.000001 || Math.abs(center.lng - clamped.lng) > 0.000001) {
        map.panTo([clamped.lat, clamped.lng], { animate: true });
      }

      sendMessage({
        type,
        latitude: clamped.lat,
        longitude: clamped.lng,
        zoom: map.getZoom()
      });
    }

    map.whenReady(function () {
      setTimeout(function () {
        map.invalidateSize();
        postCenter("ready");
      }, 120);
    });

    map.on("moveend zoomend", function () {
      postCenter("center");
    });

    map.on("click", function (e) {
      const clamped = clampLatLng(e.latlng.lat, e.latlng.lng);
      map.panTo([clamped.lat, clamped.lng], { animate: true });
      setTimeout(function () {
        postCenter("tap");
      }, 150);
    });

    window.setSipolinCenter = function (lat, lng, zoom) {
      const clamped = clampLatLng(lat, lng);
      map.setView([clamped.lat, clamped.lng], zoom || Math.max(map.getZoom(), 16), { animate: true });
      setTimeout(function () {
        postCenter("setCenter");
      }, 180);
    };

    window.resetSipolinIndramayu = function () {
      map.setView([${INDRAMAYU_CENTER.latitude}, ${INDRAMAYU_CENTER.longitude}], 15, { animate: true });
      setTimeout(function () {
        postCenter("reset");
      }, 180);
    };
  </script>
</body>
</html>
`;
};

export default function MapPickerScreen() {
  const params = useLocalSearchParams();
  const webRef = useRef(null);
  const reverseTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const autoLabelRef = useRef(true);

  const service = getParam(params.service, "ride");
  const target = getParam(params.target, "pickup");
  const backPath = getParam(params.backPath, "/orders/create/pol_ride");

  const tone = target === "destination" ? ORANGE : PRIMARY;
  const targetText = target === "destination" ? "tujuan" : service === "send" ? "ambil" : "jemput";

  const actionTitle =
    target === "destination"
      ? service === "send"
        ? "Pilih Lokasi Antar"
        : "Pilih Lokasi Tujuan"
      : service === "send"
      ? "Pilih Lokasi Ambil"
      : "Pilih Lokasi Jemput";

  const selectedCoord = useMemo(() => {
    return makeCoord(toNumber(params.lat), toNumber(params.lng));
  }, [params.lat, params.lng]);

  const pickupCoord = useMemo(() => {
    return makeCoord(toNumber(params.pickupLat), toNumber(params.pickupLng));
  }, [params.pickupLat, params.pickupLng]);

  const initialCoord = useMemo(() => {
    if (selectedCoord) return clampCoord(selectedCoord);
    if (target === "destination" && pickupCoord) return clampCoord(pickupCoord);
    return INDRAMAYU_CENTER;
  }, [selectedCoord, pickupCoord, target]);

  const html = useMemo(() => buildMapHtml(initialCoord), [initialCoord]);

  const [coord, setCoord] = useState(initialCoord);
  const [label, setLabel] = useState(getParam(params.label, ""));
  const [note, setNote] = useState(getParam(params.note, ""));
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [resolvingName, setResolvingName] = useState(false);
  const [hasNetworkHint, setHasNetworkHint] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(true);

  const subtitle =
    target === "destination"
      ? "Geser peta ke titik tujuan. Area dikunci di Indramayu supaya titik tidak loncat jauh."
      : "Geser peta ke titik jemput/ambil. Pakai GPS untuk titik posisi sekarang.";

  useEffect(() => {
    mountedRef.current = true;
    autoLabelRef.current = !getParam(params.label, "").trim();

    return () => {
      mountedRef.current = false;
      if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carryParams = () => {
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
      "merchantId",
      "selectedMenuId",
      "cartJson",
      "viewMode",
    ];

    const next = { service };

    keys.forEach((key) => {
      const value = getParam(params[key], "");
      if (value !== "") next[key] = value;
    });

    return next;
  };

  const scheduleReverseName = (nextCoord) => {
    if (!nextCoord || !autoLabelRef.current) return;

    if (reverseTimerRef.current) {
      clearTimeout(reverseTimerRef.current);
    }

    reverseTimerRef.current = setTimeout(async () => {
      try {
        setResolvingName(true);
        const name = await reverseName(nextCoord);

        if (!mountedRef.current || !autoLabelRef.current) return;
        if (name) setLabel(name);
      } finally {
        if (mountedRef.current) setResolvingName(false);
      }
    }, 650);
  };

  const setMapCenter = (nextCoord, zoom = 16) => {
    const safe = clampCoord(nextCoord);

    webRef.current?.injectJavaScript(`
      if (window.setSipolinCenter) {
        window.setSipolinCenter(${safe.latitude}, ${safe.longitude}, ${zoom});
      }
      true;
    `);

    setCoord((prev) => (isSameCoord(prev, safe) ? prev : safe));
    scheduleReverseName(safe);
  };

  const resetToIndramayu = () => {
    autoLabelRef.current = true;

    webRef.current?.injectJavaScript(`
      if (window.resetSipolinIndramayu) {
        window.resetSipolinIndramayu();
      }
      true;
    `);

    setCoord(INDRAMAYU_CENTER);
    scheduleReverseName(INDRAMAYU_CENTER);
  };

  const useMyLocation = async () => {
    setLocating(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Izin lokasi ditolak",
          "Aktifkan izin lokasi supaya bisa mengambil titik GPS sekarang."
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const next = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      if (!isInsideIndramayu(next)) {
        Alert.alert(
          "Lokasi di luar area layanan",
          "GPS kamu terbaca di luar area Indramayu. Peta akan diarahkan ke area Indramayu dulu."
        );
        resetToIndramayu();
        return;
      }

      autoLabelRef.current = true;
      setMapCenter(next, 17);
    } catch (error) {
      Alert.alert("Gagal mengambil lokasi", error?.message || "Coba ulang lagi.");
    } finally {
      setLocating(false);
    }
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data || "{}");

      if (data.type === "ready") {
        setMapReady(true);
      }

      if (
        ["ready", "center", "tap", "setCenter", "reset"].includes(data.type) &&
        Number.isFinite(Number(data.latitude)) &&
        Number.isFinite(Number(data.longitude))
      ) {
        const next = clampCoord({
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        });

        setCoord((prev) => (isSameCoord(prev, next) ? prev : next));
        scheduleReverseName(next);
      }
    } catch {
      // ignore non-json message
    }
  };

  const handleLabelChange = (text) => {
    setLabel(text);
    autoLabelRef.current = text.trim().length === 0;
  };

  const handleConfirm = () => {
    const finalCoord = clampCoord(coord);

    if (!finalCoord) {
      Alert.alert("Titik belum dipilih", "Geser peta atau pakai lokasi sekarang dulu.");
      return;
    }

    const safeLabel =
      label.trim() ||
      `Titik ${targetText} terpilih (${finalCoord.latitude.toFixed(5)}, ${finalCoord.longitude.toFixed(5)})`;

    router.replace({
      pathname: backPath,
      params: {
        ...carryParams(),
        [`${target}Label`]: safeLabel,
        [`${target}Lat`]: String(finalCoord.latitude),
        [`${target}Lng`]: String(finalCoord.longitude),
        [`${target}Note`]: note.trim(),
      },
    });
  };

  return (
    <SafeAreaView style={S.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_DK} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <LinearGradient
          colors={[PRIMARY_DK, PRIMARY]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={S.header}
        >
          <View style={S.headerTop}>
            <TouchableOpacity
              style={S.headerButton}
              activeOpacity={0.82}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={21} color={WHITE} />
            </TouchableOpacity>

            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={S.headerEyebrow}>{service === "send" ? "Pol-Send" : "Pol-Ride"}</Text>
              <Text style={S.headerTitle}>{actionTitle}</Text>
            </View>

            <View style={S.headerIcon}>
              <Ionicons
                name={service === "send" ? "bag-handle" : "bicycle"}
                size={22}
                color={PRIMARY}
              />
            </View>
          </View>

          {!mapExpanded && (
            <View style={S.tipCard}>
              <View style={S.tipIcon}>
                <MaterialCommunityIcons name="map-marker-radius-outline" size={20} color={PRIMARY} />
              </View>
              <Text style={S.tipText}>{subtitle}</Text>
            </View>
          )}
        </LinearGradient>

        <View style={[S.mapWrap, mapExpanded && S.mapWrapExpanded]}>
          {!mapReady && (
            <View style={S.mapLoading}>
              <ActivityIndicator color={PRIMARY} />
              <Text style={S.mapLoadingText}>
                {hasNetworkHint ? "Butuh internet untuk memuat OpenStreetMap..." : "Menyiapkan peta..."}
              </Text>
            </View>
          )}

          <WebView
            ref={webRef}
            originWhitelist={["*"]}
            source={{ html }}
            style={S.webview}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            geolocationEnabled
            scrollEnabled={false}
            nestedScrollEnabled={false}
            bounces={false}
            onError={() => setHasNetworkHint(true)}
            onHttpError={() => setHasNetworkHint(true)}
            setSupportMultipleWindows={false}
            androidLayerType="hardware"
          />

          <View pointerEvents="none" style={S.centerPinWrap}>
            <View style={[S.pinCircle, { backgroundColor: tone }]}>
              <Ionicons name="location-sharp" size={29} color={WHITE} />
            </View>
            <View style={[S.pinStem, { borderTopColor: tone }]} />
            <View style={S.pinShadow} />
          </View>

          <View pointerEvents="none" style={S.precisionBadge}>
            <Feather name="move" size={14} color={BLUE} />
            <Text style={S.precisionText}>Geser peta untuk presisi</Text>
          </View>

          <View style={S.mapActions}>
            <TouchableOpacity
              style={S.mapActionButton}
              activeOpacity={0.86}
              onPress={useMyLocation}
              disabled={locating}
            >
              {locating ? (
                <ActivityIndicator size="small" color={PRIMARY} />
              ) : (
                <Feather name="crosshair" size={18} color={PRIMARY} />
              )}
              <Text style={S.mapActionText}>Lokasi saya</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={S.mapActionButton}
              activeOpacity={0.86}
              onPress={resetToIndramayu}
            >
              <Feather name="refresh-cw" size={17} color={PRIMARY} />
              <Text style={S.mapActionText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={S.mapActionButton}
              activeOpacity={0.86}
              onPress={() => setMapExpanded((prev) => !prev)}
            >
              <Feather name={mapExpanded ? "minimize-2" : "maximize-2"} size={17} color={PRIMARY} />
              <Text style={S.mapActionText}>{mapExpanded ? "Detail" : "Peta besar"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[S.bottomCard, mapExpanded && S.bottomCardCompact]}>
          <View style={S.dragHandle} />

          <View style={S.coordRow}>
            <View style={[S.smallIcon, { backgroundColor: target === "destination" ? "#fff7ed" : "#ecfdf5" }]}>
              <Feather name={target === "destination" ? "map-pin" : "navigation"} size={18} color={tone} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={S.coordLabel}>Titik {targetText} dipilih</Text>
              <Text style={S.coordText}>{formatCoord(coord)}</Text>
              {resolvingName ? (
                <Text style={S.resolvingText}>Membaca nama lokasi...</Text>
              ) : null}
            </View>
          </View>

          {!mapExpanded && (
            <>
              <Text style={S.inputLabel}>Nama lokasi</Text>
              <TextInput
                value={label}
                onChangeText={handleLabelChange}
                placeholder="Contoh: Gerbang Polindra / Kopi Kenangan / Alun-alun"
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
            </>
          )}

          {mapExpanded && (
            <View style={S.compactHint}>
              <Feather name="info" size={14} color={BLUE} />
              <Text style={S.compactHintText}>
                Peta sedang diperbesar. Tap tombol “Detail” untuk isi nama/catatan lokasi.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[S.confirmButton, { backgroundColor: tone }]}
            activeOpacity={0.9}
            onPress={handleConfirm}
          >
            <Text style={S.confirmText}>Pakai Titik Ini</Text>
            <Feather name="check" size={19} color={WHITE} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BG },

  header: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 9,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
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
  headerEyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: WHITE,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 1,
  },
  tipCard: {
    marginTop: 11,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tipIcon: {
    width: 35,
    height: 35,
    borderRadius: 13,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    flex: 1,
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },

  mapWrap: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 8,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  mapWrapExpanded: {
    flex: 1.8,
  },
  webview: {
    flex: 1,
    backgroundColor: "#eef2f7",
  },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapLoadingText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    paddingHorizontal: 24,
  },

  centerPinWrap: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -24,
    marginTop: -55,
    width: 48,
    height: 70,
    alignItems: "center",
  },
  pinCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  pinStem: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -3,
  },
  pinShadow: {
    width: 26,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.20)",
    marginTop: 3,
  },

  precisionBadge: {
    position: "absolute",
    left: 12,
    top: 12,
    backgroundColor: WHITE,
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  precisionText: {
    color: INK_MID,
    fontSize: 11,
    fontWeight: "900",
  },
  mapActions: {
    position: "absolute",
    right: 12,
    top: 12,
    gap: 8,
  },
  mapActionButton: {
    minHeight: 42,
    borderRadius: 15,
    backgroundColor: WHITE,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  mapActionText: {
    color: INK,
    fontSize: 11,
    fontWeight: "900",
  },

  bottomCard: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 17,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 15,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 12,
  },
  bottomCardCompact: {
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  compactHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginBottom: 10,
  },
  compactHintText: {
    flex: 1,
    color: INK_MID,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 16,
  },
  dragHandle: {
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 11,
  },
  coordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 10,
  },
  smallIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  coordLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
  },
  coordText: {
    color: INK,
    fontSize: 13.5,
    fontWeight: "900",
    marginTop: 2,
  },
  resolvingText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  inputLabel: {
    color: INK,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
  },
  input: {
    minHeight: 46,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 13,
    color: INK,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  noteInput: {
    minHeight: 64,
    paddingTop: 11,
    fontWeight: "600",
  },
  confirmButton: {
    height: 51,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  confirmText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "900",
  },
});
