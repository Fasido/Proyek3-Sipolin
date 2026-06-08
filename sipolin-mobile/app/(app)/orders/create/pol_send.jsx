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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { ordersAPI } from "../../../../services/api";
import {
  POLSEND_CATEGORIES,
  POLSEND_MERCHANTS,
  POLSEND_MENU_ITEMS,
  findPolsendMenuByParams,
  scorePolsendSearch,
} from "../../../../data/polsendCatalog";

const MAX_FOOD_PRICE = 100000;
const DEFAULT_FOOD_PRICE = 20000;
const FIRST_KM_FARE = 5000;
const NEXT_KM_FARE = 3000;
const SERVICE_PERCENT = 0.1;
const ROAD_FACTOR = 1.25;

const PRIMARY = "#00AA5B";
const PRIMARY_DK = "#007A3E";
const ORANGE = "#F97316";
const PURPLE = "#7C3AED";
const BLUE = "#1A73E8";
const INK = "#0f172a";
const INK_MID = "#334155";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const PAGE_BG = "#f4f6f8";
const WHITE = "#ffffff";
const RED = "#ef4444";
const GREEN_SOFT = "#ecfdf5";

const POLSEND_IMAGES = {
  seblak: require("../../../../assets/polsend/seblak.jpg"),
  esteh: require("../../../../assets/polsend/esteh.jpg"),
  geprek: require("../../../../assets/polsend/geprek.jpg"),
  nasigoreng: require("../../../../assets/polsend/nasigoreng.jpg"),
  martabak: require("../../../../assets/polsend/martabak.jpg"),
  mie: require("../../../../assets/polsend/mie.jpg"),
  kopi: require("../../../../assets/polsend/kopi.jpg"),
  kopken: require("../../../../assets/polsend/kopken.jpg"),
  gacoan: require("../../../../assets/polsend/gacoan.jpg"),
  minimarket: require("../../../../assets/polsend/minimarket.jpg"),
  obat: require("../../../../assets/polsend/obat.jpg"),
  warung: require("../../../../assets/polsend/warung.jpg"),
  cafe: require("../../../../assets/polsend/cafe.jpg"),
  manual: require("../../../../assets/polsend/manual.jpg"),

  "mimi-krasak": require("../../../../assets/polsend/mimi-krasak.jpg"),
  "warung-meta": require("../../../../assets/polsend/warung-meta.jpg"),
  "esteh-ibukota": require("../../../../assets/polsend/esteh-ibukota.jpg"),
  "dimsum-prince": require("../../../../assets/polsend/dimsum-prince.jpg"),
  "seblak-dalesh": require("../../../../assets/polsend/seblak-dalesh.jpg"),
  "seblak-barbar": require("../../../../assets/polsend/seblak-barbar.jpg"),
  "geprek-jago": require("../../../../assets/polsend/geprek-jago.jpg"),
  "geprek-gelby": require("../../../../assets/polsend/geprek-gelby.jpg"),
  "martabak-prapatan": require("../../../../assets/polsend/martabak-prapatan.jpg"),
  "martabak-bariklana": require("../../../../assets/polsend/martabak-bariklana.jpg"),
  "depot-putri-jaya": require("../../../../assets/polsend/depot-putri-jaya.jpg"),
  "nasgor-mas-bro": require("../../../../assets/polsend/nasgor-mas-bro.jpg"),
  "miechat-lohbener": require("../../../../assets/polsend/miechat-lohbener.jpg"),
  "mie-gacoan": require("../../../../assets/polsend/mie-gacoan.jpg"),
  "nasi-kuning-tinih": require("../../../../assets/polsend/nasi-kuning-tinih.jpg"),
  "pedesan-entog-mimi": require("../../../../assets/polsend/pedesan-entog-mimi.jpg"),
  "linda-seafood": require("../../../../assets/polsend/linda-seafood.jpg"),
  "kedai-giprawi": require("../../../../assets/polsend/kedai-giprawi.jpg"),
  "indomaret-lohbener": require("../../../../assets/polsend/indomaret-lohbener.jpg"),
  "surya-toserba": require("../../../../assets/polsend/surya-toserba.jpg"),
  "apotek-k24": require("../../../../assets/polsend/apotek-k24.jpg"),
  "apotek-lohbener-farma": require("../../../../assets/polsend/apotek-lohbener-farma.jpg"),
  "kopi-kenangan": require("../../../../assets/polsend/kopi-kenangan.jpg"),
  "taste-coffee": require("../../../../assets/polsend/taste-coffee.jpg"),
  "mixue-jatibarang": require("../../../../assets/polsend/mixue-jatibarang.jpg"),
};

const getImageSource = (...keys) => {
  for (const key of keys) {
    if (key && POLSEND_IMAGES[String(key)]) return POLSEND_IMAGES[String(key)];
  }
  return POLSEND_IMAGES.warung;
};

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

const makeMerchantPickup = (merchant) => ({
  label: merchant?.name || "",
  latitude: merchant?.latitude ? String(merchant.latitude) : "",
  longitude: merchant?.longitude ? String(merchant.longitude) : "",
  note: merchant?.address || "",
});

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
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
  return Math.max(1, directKm * ROAD_FACTOR);
};

const calculateDeliveryFee = (distanceKm) => {
  if (!distanceKm || distanceKm <= 0) return FIRST_KM_FARE;
  const extraKm = Math.max(0, Math.ceil(distanceKm - 1));
  return FIRST_KM_FARE + extraKm * NEXT_KM_FARE;
};

const formatDistance = (distanceKm) => {
  if (!distanceKm) return "Pilih titik antar";
  if (distanceKm < 1) return "< 1 km";
  return `${distanceKm.toFixed(1)} km`;
};

const safeParseCart = (value) => {
  try {
    const raw = getParam(value, "");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const serializeCart = (cart) =>
  JSON.stringify(
    (cart || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      imageKey: item.imageKey,
      description: item.description,
      qty: item.qty,
    }))
  );

const getCartQty = (cart) => cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
const getCartSubtotal = (cart) =>
  cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);

const buildCartText = (cart) =>
  cart
    .filter((item) => item.qty > 0)
    .map((item) => `${item.qty}x ${item.name} (${formatRupiah(item.price)})`)
    .join(", ");

const HeaderButton = ({ onPress, icon = "arrow-left", color = WHITE }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={S.headerBtn}>
    <Feather name={icon} size={21} color={color} />
  </TouchableOpacity>
);

const CategoryChip = ({ item, active, onPress }) => (
  <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={[S.categoryChip, active && S.categoryChipActive]}>
    <Text style={S.categoryEmoji}>{item.emoji || item.icon || "🍽️"}</Text>
    <Text style={[S.categoryText, active && S.categoryTextActive]}>{item.label}</Text>
  </TouchableOpacity>
);

const LocationCard = ({ title, subtitle, location, icon, color, onPress, locked = false }) => {
  const hasValue = Boolean(location?.label);

  return (
    <TouchableOpacity style={S.locationCard} activeOpacity={0.86} onPress={locked ? undefined : onPress}>
      <View style={[S.locationIcon, { backgroundColor: color === ORANGE ? "#fff7ed" : "#ecfdf5" }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={S.locationTitle}>{title}</Text>
        <Text style={[S.locationValue, !hasValue && { color: MUTED, fontWeight: "700" }]} numberOfLines={2}>
          {hasValue ? location.label : subtitle}
        </Text>
        {hasValue && location.note ? <Text style={S.locationNote} numberOfLines={1}>{location.note}</Text> : null}
      </View>
      <View style={S.locationAction}>
        {locked ? <Text style={S.lockedText}>Auto</Text> : null}
        {!locked ? <Text style={[S.locationActionText, { color }]}>{hasValue ? "Ubah" : "Pilih"}</Text> : null}
        {!locked ? <Feather name="chevron-right" size={18} color={color} /> : null}
      </View>
    </TouchableOpacity>
  );
};

const MerchantCard = ({ merchant, onPress }) => (
  <TouchableOpacity activeOpacity={0.9} style={S.merchantCard} onPress={onPress}>
    <Image source={getImageSource(merchant.id, merchant.imageKey, merchant.category)} style={S.merchantImage} />
    <View style={S.merchantBody}>
      <View style={S.merchantTopRow}>
        <Text style={S.merchantName} numberOfLines={1}>{merchant.name}</Text>
        <Text style={S.ratingBadge}>★ {merchant.rating || "4.8"}</Text>
      </View>
      <Text style={S.merchantAddress} numberOfLines={1}>{merchant.address}</Text>
      <View style={S.metaRow}>
        <Text style={S.metaText}>{merchant.categoryLabel}</Text>
        <Text style={S.dotText}>•</Text>
        <Text style={S.metaText}>{merchant.distanceLabel || "Dekat"}</Text>
        <Text style={S.dotText}>•</Text>
        <Text style={S.metaText}>{merchant.deliveryTime || "15-30 min"}</Text>
      </View>
      <Text style={S.menuPreview} numberOfLines={1}>
        {(merchant.menus || []).slice(0, 3).map((menu) => menu.name).join(" · ")}
      </Text>
    </View>
  </TouchableOpacity>
);

const RecommendedMenuCard = ({ item, merchant, onPress }) => (
  <TouchableOpacity activeOpacity={0.9} style={S.recoCard} onPress={onPress}>
    <Image source={getImageSource(item.imageKey, merchant?.id, merchant?.imageKey, item.category)} style={S.recoImage} />
    <View style={S.recoGradient} />
    <View style={S.recoInfo}>
      <Text style={S.recoName} numberOfLines={2}>{item.name}</Text>
      <Text style={S.recoResto} numberOfLines={1}>{item.resto}</Text>
      <Text style={S.recoPrice}>{formatRupiah(item.price)}</Text>
    </View>
  </TouchableOpacity>
);

const QtyControl = ({ qty, onMinus, onPlus }) => {
  if (!qty) {
    return (
      <TouchableOpacity activeOpacity={0.85} style={S.addBtn} onPress={onPlus}>
        <Feather name="plus" size={18} color={WHITE} strokeWidth={3} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={S.qtyControl}>
      <TouchableOpacity activeOpacity={0.82} style={S.qtyBtn} onPress={onMinus}>
        <Feather name="minus" size={14} color={PRIMARY} strokeWidth={3} />
      </TouchableOpacity>
      <Text style={S.qtyText}>{qty}</Text>
      <TouchableOpacity activeOpacity={0.82} style={S.qtyBtn} onPress={onPlus}>
        <Feather name="plus" size={14} color={PRIMARY} strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );
};

const MenuRow = ({ menu, qty, merchant, onPlus, onMinus }) => (
  <View style={S.menuRow}>
    <Image source={getImageSource(menu.imageKey, merchant?.id, merchant?.imageKey, merchant?.category)} style={S.menuImage} />
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={S.menuName} numberOfLines={1}>{menu.name}</Text>
        {menu.isPopular ? <Text style={S.popularPill}>Favorit</Text> : null}
      </View>
      <Text style={S.menuDesc} numberOfLines={2}>{menu.description || "Menu tersedia"}</Text>
      <Text style={S.menuPrice}>{formatRupiah(menu.price)}</Text>
    </View>
    <QtyControl qty={qty} onPlus={onPlus} onMinus={onMinus} />
  </View>
);

export default function PolSendScreen() {
  const params = useLocalSearchParams();

  const [screen, setScreen] = useState("catalog");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("semua");
  const [selectedMerchantId, setSelectedMerchantId] = useState(() => getParam(params.merchantId, ""));
  const [cart, setCart] = useState(() => safeParseCart(params.cartJson));
  const [destination, setDestination] = useState(() => makeLocation(params, "destination"));
  const [note, setNote] = useState(() => getParam(params.generalNote, ""));
  const [loading, setLoading] = useState(false);

  const [manualFoodName, setManualFoodName] = useState(() => getParam(params.foodName, ""));
  const [manualRestaurantName, setManualRestaurantName] = useState(() => getParam(params.restaurantName, ""));
  const [manualFoodPrice, setManualFoodPrice] = useState(() => getParam(params.foodPrice, ""));
  const [manualPickup, setManualPickup] = useState(() => makeLocation(params, "pickup"));

  const paramsKey = JSON.stringify({
    merchantId: getParam(params.merchantId, ""),
    selectedMenuId: getParam(params.selectedMenuId, ""),
    viewMode: getParam(params.viewMode, ""),
    cartJson: getParam(params.cartJson, ""),
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

  const selectedMerchant = useMemo(() => {
    if (!selectedMerchantId) return null;
    return POLSEND_MERCHANTS.find((merchant) => merchant.id === selectedMerchantId) || null;
  }, [selectedMerchantId]);

  const cartMerchantPickup = useMemo(() => makeMerchantPickup(selectedMerchant), [selectedMerchant]);
  const cartSubtotal = useMemo(() => getCartSubtotal(cart), [cart]);
  const cartQty = useMemo(() => getCartQty(cart), [cart]);
  const deliveryDistanceKm = useMemo(
    () => estimateRouteDistanceKm(cartMerchantPickup, destination),
    [cartMerchantPickup, destination]
  );
  const deliveryFee = useMemo(() => calculateDeliveryFee(deliveryDistanceKm), [deliveryDistanceKm]);
  const serviceFee = useMemo(() => Math.round(cartSubtotal * SERVICE_PERCENT), [cartSubtotal]);
  const estimatedTotal = useMemo(
    () => Math.round(cartSubtotal + serviceFee + deliveryFee),
    [cartSubtotal, serviceFee, deliveryFee]
  );

  const manualParsedPrice = manualFoodPrice === "" ? DEFAULT_FOOD_PRICE : parseInt(manualFoodPrice, 10);
  const manualPickupDistanceKm = useMemo(
    () => estimateRouteDistanceKm(manualPickup, destination),
    [manualPickup, destination]
  );
  const manualDeliveryFee = useMemo(() => calculateDeliveryFee(manualPickupDistanceKm), [manualPickupDistanceKm]);
  const manualServiceFee = useMemo(() => {
    const base = Number.isNaN(manualParsedPrice) ? DEFAULT_FOOD_PRICE : manualParsedPrice;
    return Math.round(base * SERVICE_PERCENT);
  }, [manualParsedPrice]);
  const manualEstimatedTotal = useMemo(() => {
    const base = Number.isNaN(manualParsedPrice) ? DEFAULT_FOOD_PRICE : manualParsedPrice;
    return Math.round(base + manualServiceFee + manualDeliveryFee);
  }, [manualParsedPrice, manualServiceFee, manualDeliveryFee]);

  useEffect(() => {
    const nextDestination = makeLocation(params, "destination");
    const nextPickup = makeLocation(params, "pickup");
    const nextViewMode = getParam(params.viewMode, "");
    const nextMerchantId = getParam(params.merchantId, "");
    const nextCart = safeParseCart(params.cartJson);
    const nextFood = getParam(params.foodName, "");
    const nextResto = getParam(params.restaurantName, "");
    const nextPrice = getParam(params.foodPrice, "");
    const selectedMenuId = getParam(params.selectedMenuId, "");

    setDestination(nextDestination);
    setNote(getParam(params.generalNote, ""));

    if (nextPickup.label || nextPickup.latitude || nextPickup.longitude) setManualPickup(nextPickup);
    if (nextFood) setManualFoodName(nextFood);
    if (nextResto) setManualRestaurantName(nextResto);
    if (nextPrice) setManualFoodPrice(nextPrice);

    if (nextMerchantId) {
      setSelectedMerchantId(nextMerchantId);
      setScreen(nextViewMode === "checkout" ? "checkout" : "merchant");
    }

    if (nextCart.length > 0) {
      setCart(nextCart);
    } else if (selectedMenuId || (nextFood && nextResto)) {
      const matched = selectedMenuId
        ? POLSEND_MENU_ITEMS.find((item) => item.id === selectedMenuId)
        : findPolsendMenuByParams({ foodName: nextFood, restaurantName: nextResto });

      if (matched) {
        setSelectedMerchantId(matched.merchantId);
        setCart((prev) => {
          if (prev.some((item) => item.id === matched.id)) return prev;
          return [
            ...prev,
            {
              id: matched.id,
              name: matched.name,
              price: matched.price,
              imageKey: matched.imageKey,
              description: matched.description,
              qty: 1,
            },
          ];
        });
        setScreen(nextViewMode === "checkout" ? "checkout" : "merchant");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  const filteredMerchants = useMemo(() => {
    const q = query.trim();

    return POLSEND_MERCHANTS
      .map((merchant) => ({
        ...merchant,
        _searchScore: q ? scorePolsendSearch({ ...merchant, type: "merchant", resto: merchant.categoryLabel }, q) : 1,
      }))
      .filter((merchant) => {
        const categoryOk = (activeCategory === "semua" || activeCategory === "all") || merchant.category === activeCategory;
        const queryOk = !q || merchant._searchScore > 0;
        return categoryOk && queryOk;
      })
      .sort((a, b) => {
        if (q && b._searchScore !== a._searchScore) return b._searchScore - a._searchScore;
        return Number(b.rating || 0) - Number(a.rating || 0);
      });
  }, [query, activeCategory]);

  const recommendedMenus = useMemo(() => {
    const q = query.trim();

    return POLSEND_MENU_ITEMS
      .map((item) => ({ ...item, _searchScore: q ? scorePolsendSearch(item, q) : 1 }))
      .filter((item) => {
        const categoryOk = (activeCategory === "semua" || activeCategory === "all") || item.category === activeCategory;
        const queryOk = !q || item._searchScore > 0;
        return categoryOk && queryOk;
      })
      .sort((a, b) => {
        if (q && b._searchScore !== a._searchScore) return b._searchScore - a._searchScore;
        const aPopular = a.isPopular ? 0 : 1;
        const bPopular = b.isPopular ? 0 : 1;
        if (aPopular !== bPopular) return aPopular - bPopular;
        return Number(b.rating || 0) - Number(a.rating || 0);
      })
      .slice(0, 12);
  }, [query, activeCategory]);

  const merchantMenuList = useMemo(() => {
    if (!selectedMerchant) return [];
    const q = query.trim();

    return (selectedMerchant.menus || [])
      .map((menu) => {
        const item = {
          ...menu,
          merchantId: selectedMerchant.id,
          resto: selectedMerchant.name,
          merchantName: selectedMerchant.name,
          category: selectedMerchant.category,
          categoryLabel: selectedMerchant.categoryLabel,
          address: selectedMerchant.address,
          rating: selectedMerchant.rating,
          distanceLabel: selectedMerchant.distanceLabel,
        };
        return { ...menu, _searchScore: q ? scorePolsendSearch(item, q) : 1 };
      })
      .filter((menu) => !q || menu._searchScore > 0)
      .sort((a, b) => {
        if (q && b._searchScore !== a._searchScore) return b._searchScore - a._searchScore;
        const aPopular = a.isPopular ? 0 : 1;
        const bPopular = b.isPopular ? 0 : 1;
        if (aPopular !== bPopular) return aPopular - bPopular;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }, [selectedMerchant, query]);

  const openMerchant = (merchant) => {
    setSelectedMerchantId(merchant.id);
    setQuery("");
    setScreen("merchant");
  };

  const addToCart = (menu, merchant = selectedMerchant) => {
    if (!merchant) return;

    if (selectedMerchantId && selectedMerchantId !== merchant.id && cartQty > 0) {
      Alert.alert(
        "Keranjang beda tempat",
        "Satu pesanan Pol-Send hanya bisa dari satu tempat. Kosongkan keranjang dulu kalau mau pindah tempat.",
        [
          { text: "Batal" },
          {
            text: "Kosongkan",
            style: "destructive",
            onPress: () => {
              setCart([]);
              setSelectedMerchantId(merchant.id);
              addToCart(menu, merchant);
            },
          },
        ]
      );
      return;
    }

    setSelectedMerchantId(merchant.id);
    setCart((prev) => {
      const exists = prev.find((item) => item.id === menu.id);
      if (exists) {
        return prev.map((item) => (item.id === menu.id ? { ...item, qty: item.qty + 1 } : item));
      }

      return [
        ...prev,
        {
          id: menu.id,
          name: menu.name,
          price: menu.price,
          imageKey: menu.imageKey,
          description: menu.description,
          qty: 1,
        },
      ];
    });
  };

  const decreaseCart = (menuId) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === menuId ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const getQtyForMenu = (menuId) => cart.find((item) => item.id === menuId)?.qty || 0;

  const openDestinationPicker = () => {
    if (!selectedMerchant || cartQty <= 0) {
      Alert.alert("Keranjang kosong", "Pilih minimal satu menu dulu.");
      return;
    }

    router.push({
      pathname: "/orders/create/map-picker",
      params: {
        service: "send",
        target: "destination",
        backPath: "/orders/create/pol_send",
        title: "Pilih Lokasi Antar",
        subtitle: "Pilih titik pesanan diantarkan.",
        label: destination.label,
        lat: destination.latitude,
        lng: destination.longitude,
        note: destination.note,
        merchantId: selectedMerchant.id,
        viewMode: "checkout",
        cartJson: serializeCart(cart),
        foodName: buildCartText(cart),
        restaurantName: selectedMerchant.name,
        foodPrice: String(cartSubtotal),
        generalNote: note,
        pickupLabel: selectedMerchant.name,
        pickupLat: selectedMerchant.latitude ? String(selectedMerchant.latitude) : "",
        pickupLng: selectedMerchant.longitude ? String(selectedMerchant.longitude) : "",
        pickupNote: selectedMerchant.address || "",
        destinationLabel: destination.label,
        destinationLat: destination.latitude,
        destinationLng: destination.longitude,
        destinationNote: destination.note,
      },
    });
  };

  const openManualPicker = (target) => {
    const selected = target === "pickup" ? manualPickup : destination;

    router.push({
      pathname: "/orders/create/map-picker",
      params: {
        service: "send",
        target,
        backPath: "/orders/create/pol_send",
        label: selected.label,
        lat: selected.latitude,
        lng: selected.longitude,
        note: selected.note,
        viewMode: "manual",
        foodName: manualFoodName,
        restaurantName: manualRestaurantName,
        foodPrice: manualFoodPrice,
        generalNote: note,
        pickupLabel: manualPickup.label,
        pickupLat: manualPickup.latitude,
        pickupLng: manualPickup.longitude,
        pickupNote: manualPickup.note,
        destinationLabel: destination.label,
        destinationLat: destination.latitude,
        destinationLng: destination.longitude,
        destinationNote: destination.note,
      },
    });
  };

  const validateCartOrder = () => {
    if (!selectedMerchant) {
      Alert.alert("Tempat belum dipilih", "Pilih tempat/warung dulu.");
      return false;
    }
    if (cartQty <= 0) {
      Alert.alert("Keranjang kosong", "Tambahkan minimal satu menu dulu.");
      return false;
    }
    if (!destination.label.trim()) {
      Alert.alert("Lokasi antar belum lengkap", "Pilih lokasi antar dari map dulu.");
      return false;
    }
    return true;
  };

  const handleSubmitCart = async () => {
    if (!validateCartOrder()) return;

    setLoading(true);
    try {
      const cartLines = cart.map((item) => `${item.qty}x ${item.name} = ${formatRupiah(item.price * item.qty)}`);
      const itemSummary = buildCartText(cart);
      const finalNote = [
        "[KERANJANG POL-SEND]",
        ...cartLines,
        `Subtotal menu: ${formatRupiah(cartSubtotal)}`,
        note.trim() ? `Catatan user: ${note.trim()}` : "",
      ].filter(Boolean).join("\n");

      const response = await ordersAPI.createSend({
        foodName: itemSummary,
        itemName: itemSummary,
        restaurantName: selectedMerchant.name,
        foodPrice: cartSubtotal,
        pickupLocation: selectedMerchant.name,
        dropoffLocation: destination.label.trim(),
        pickupLatitude: selectedMerchant.latitude ? Number(selectedMerchant.latitude) : undefined,
        pickupLongitude: selectedMerchant.longitude ? Number(selectedMerchant.longitude) : undefined,
        destinationLatitude: destination.latitude ? Number(destination.latitude) : undefined,
        destinationLongitude: destination.longitude ? Number(destination.longitude) : undefined,
        pickupNote: selectedMerchant.address,
        destinationNote: destination.note?.trim(),
        estimatedDistanceKm: deliveryDistanceKm || 1,
        estimatedDeliveryFee: deliveryFee,
        note: finalNote,
      });

      const order = response?.data?.data || response?.data?.order || response?.data || null;
      const orderId = order?.id;

      if (response.data?.success || orderId) {
        setCart([]);
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
      console.error("Error creating cart Pol-Send:", error);
      const msg = error.response?.data?.error || error.message || "Terjadi kesalahan jaringan";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const validateManualOrder = () => {
    if (!manualFoodName.trim()) {
      Alert.alert("Data belum lengkap", "Nama makanan/barang wajib diisi.");
      return false;
    }
    if (!manualRestaurantName.trim()) {
      Alert.alert("Data belum lengkap", "Nama toko/tempat beli wajib diisi.");
      return false;
    }
    if (!manualPickup.label.trim()) {
      Alert.alert("Lokasi belum lengkap", "Pilih lokasi ambil dari map dulu.");
      return false;
    }
    if (!destination.label.trim()) {
      Alert.alert("Lokasi belum lengkap", "Pilih lokasi antar dari map dulu.");
      return false;
    }
    if (manualFoodPrice !== "" && Number.isNaN(parseInt(manualFoodPrice, 10))) {
      Alert.alert("Harga tidak valid", "Harga harus berupa angka.");
      return false;
    }
    if (manualFoodPrice !== "" && parseInt(manualFoodPrice, 10) > MAX_FOOD_PRICE) {
      Alert.alert("Harga terlalu besar", `Harga maksimal ${formatRupiah(MAX_FOOD_PRICE)}.`);
      return false;
    }
    return true;
  };

  const handleSubmitManual = async () => {
    if (!validateManualOrder()) return;

    setLoading(true);
    try {
      const price = manualFoodPrice === "" ? DEFAULT_FOOD_PRICE : parseInt(manualFoodPrice, 10);

      const response = await ordersAPI.createSend({
        foodName: manualFoodName.trim(),
        itemName: manualFoodName.trim(),
        restaurantName: manualRestaurantName.trim(),
        foodPrice: price,
        pickupLocation: manualPickup.label.trim(),
        dropoffLocation: destination.label.trim(),
        pickupLatitude: manualPickup.latitude ? Number(manualPickup.latitude) : undefined,
        pickupLongitude: manualPickup.longitude ? Number(manualPickup.longitude) : undefined,
        destinationLatitude: destination.latitude ? Number(destination.latitude) : undefined,
        destinationLongitude: destination.longitude ? Number(destination.longitude) : undefined,
        pickupNote: manualPickup.note?.trim(),
        destinationNote: destination.note?.trim(),
        estimatedDistanceKm: manualPickupDistanceKm || 1,
        estimatedDeliveryFee: manualDeliveryFee,
        note: note.trim(),
      });

      const order = response?.data?.data || response?.data?.order || response?.data || null;
      const orderId = order?.id;

      if (response.data?.success || orderId) {
        Alert.alert("Pesanan Dibuat!", "Pesanan manual masuk dan sedang menunggu driver.", [
          {
            text: "Lihat Detail",
            onPress: () => (orderId ? router.replace(`/orders/${orderId}`) : router.back()),
          },
        ]);
      } else {
        Alert.alert("Error", response.data?.error || "Gagal membuat pesanan");
      }
    } catch (error) {
      console.error("Error creating manual Pol-Send:", error);
      const msg = error.response?.data?.error || error.message || "Terjadi kesalahan jaringan";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const goBackInFlow = () => {
    if (screen === "checkout") {
      setScreen("merchant");
      return;
    }
    if (screen === "merchant" || screen === "manual") {
      setScreen("catalog");
      setQuery("");
      return;
    }
    router.back();
  };

  const renderCatalog = () => (
    <>
      <LinearGradient colors={[PURPLE, PRIMARY]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.hero}>
        <View style={S.headerRow}>
          <HeaderButton onPress={() => router.back()} />
          <View style={S.heroIcon}>
            <Ionicons name="bag-handle" size={23} color={PURPLE} />
          </View>
        </View>

        <Text style={S.heroTitle}>Pol-Send</Text>
        <Text style={S.heroSubtitle}>Pilih tempat, tambah menu ke keranjang, lalu driver ambil dan antar.</Text>

        <View style={S.searchBox}>
          <Feather name="search" size={18} color={MUTED} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari gacoan, mie, geprek, apotek..."
            placeholderTextColor="#94a3b8"
            style={S.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <Text style={S.clearText}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.categoryList}>
        {POLSEND_CATEGORIES.map((item) => (
          <CategoryChip
            key={item.id}
            item={item}
            active={activeCategory === item.id}
            onPress={() => setActiveCategory(item.id)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity activeOpacity={0.9} style={S.manualBanner} onPress={() => setScreen("manual")}>
        <Image source={getImageSource("manual", "minimarket")} style={S.manualImage} />
        <View style={{ flex: 1 }}>
          <Text style={S.manualTitle}>Pesan manual</Text>
          <Text style={S.manualSubtitle}>Untuk obat, alat tulis, barang Alfa/Indomaret, atau menu yang belum ada.</Text>
        </View>
        <Feather name="chevron-right" size={20} color={PRIMARY} />
      </TouchableOpacity>

      <View style={S.sectionBlock}>
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Rekomendasi menu</Text>
          <Text style={S.sectionHint}>{recommendedMenus.length} menu</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.recoList}>
          {recommendedMenus.map((item) => {
            const merchant = POLSEND_MERCHANTS.find((m) => m.id === item.merchantId);
            return (
              <RecommendedMenuCard
                key={`${item.merchantId}-${item.id}`}
                item={item}
                merchant={merchant}
                onPress={() => {
                  if (merchant) {
                    openMerchant(merchant);
                    addToCart(item, merchant);
                  }
                }}
              />
            );
          })}
        </ScrollView>
      </View>

      <View style={S.sectionBlock}>
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Pilih tempat</Text>
          <Text style={S.sectionHint}>{filteredMerchants.length} tempat</Text>
        </View>
        {filteredMerchants.map((merchant) => (
          <MerchantCard key={merchant.id} merchant={merchant} onPress={() => openMerchant(merchant)} />
        ))}
        {filteredMerchants.length === 0 ? (
          <View style={S.emptyBox}>
            <Text style={S.emptyTitle}>Tempat tidak ditemukan</Text>
            <Text style={S.emptySubtitle}>Coba kata lain atau pakai Pesan Manual.</Text>
          </View>
        ) : null}
      </View>
    </>
  );

  const renderMerchant = () => {
    if (!selectedMerchant) return null;

    return (
      <>
        <View style={S.detailHeroWrap}>
          <Image source={getImageSource(selectedMerchant.id, selectedMerchant.imageKey)} style={S.detailHeroImage} />
          <LinearGradient colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.06)"]} style={S.detailHeroOverlay} />
          <View style={S.detailHeroTop}>
            <HeaderButton onPress={goBackInFlow} />
            <TouchableOpacity activeOpacity={0.82} style={S.headerBtnLight} onPress={() => setScreen("manual")}>
              <Text style={S.headerBtnLightText}>Manual</Text>
            </TouchableOpacity>
          </View>
          <View style={S.detailHeroText}>
            <Text style={S.detailCategory}>{selectedMerchant.categoryLabel}</Text>
            <Text style={S.detailTitle}>{selectedMerchant.name}</Text>
            <Text style={S.detailSubtitle} numberOfLines={2}>{selectedMerchant.address}</Text>
            <View style={S.detailMetaRow}>
              <Text style={S.detailMeta}>★ {selectedMerchant.rating || "4.8"}</Text>
              <Text style={S.detailMeta}>•</Text>
              <Text style={S.detailMeta}>{selectedMerchant.distanceLabel || "Dekat"}</Text>
              <Text style={S.detailMeta}>•</Text>
              <Text style={S.detailMeta}>{selectedMerchant.deliveryTime || "15-30 min"}</Text>
            </View>
          </View>
        </View>

        <View style={S.detailSearchBox}>
          <Feather name="search" size={17} color={MUTED} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Cari menu di ${selectedMerchant.name}`}
            placeholderTextColor="#94a3b8"
            style={S.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <Text style={S.clearText}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={S.sectionBlock}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>Daftar menu</Text>
            <Text style={S.sectionHint}>{merchantMenuList.length} menu</Text>
          </View>
          {merchantMenuList.map((menu) => (
            <MenuRow
              key={menu.id}
              menu={menu}
              merchant={selectedMerchant}
              qty={getQtyForMenu(menu.id)}
              onPlus={() => addToCart(menu, selectedMerchant)}
              onMinus={() => decreaseCart(menu.id)}
            />
          ))}
        </View>
      </>
    );
  };

  const renderCheckout = () => {
    if (!selectedMerchant) return null;

    return (
      <>
        <LinearGradient colors={[PRIMARY_DK, PRIMARY]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.checkoutHeader}>
          <View style={S.headerRow}>
            <HeaderButton onPress={goBackInFlow} />
            <Text style={S.checkoutHeaderTitle}>Checkout</Text>
            <View style={{ width: 42 }} />
          </View>
          <Text style={S.checkoutTitle}>{selectedMerchant.name}</Text>
          <Text style={S.checkoutSubtitle}>Satu keranjang hanya untuk satu tempat biar ongkir tetap jelas.</Text>
        </LinearGradient>

        <View style={S.card}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>Keranjang</Text>
            <TouchableOpacity onPress={() => setCart([])} activeOpacity={0.8}>
              <Text style={S.clearCart}>Kosongkan</Text>
            </TouchableOpacity>
          </View>
          {cart.map((item) => (
            <View key={item.id} style={S.checkoutItem}>
              <Image source={getImageSource(item.imageKey, selectedMerchant.id, selectedMerchant.imageKey)} style={S.checkoutImage} />
              <View style={{ flex: 1 }}>
                <Text style={S.checkoutItemName}>{item.name}</Text>
                <Text style={S.checkoutItemSub}>{item.qty} x {formatRupiah(item.price)}</Text>
              </View>
              <QtyControl qty={item.qty} onPlus={() => addToCart(item, selectedMerchant)} onMinus={() => decreaseCart(item.id)} />
            </View>
          ))}
        </View>

        <View style={S.card}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>Lokasi</Text>
          </View>
          <LocationCard
            title="Lokasi Ambil / Tempat"
            subtitle="Otomatis dari tempat yang dipilih"
            location={cartMerchantPickup}
            icon="shopping-bag"
            color={PRIMARY}
            locked
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
            onPress={openDestinationPicker}
          />
        </View>

        <View style={S.card}>
          <Text style={S.inputLabel}>Catatan pesanan</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Contoh: level pedas 2, es sedikit, bayar dulu nanti aku ganti"
            placeholderTextColor="#94a3b8"
            style={S.noteInput}
            multiline
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        <View style={S.priceCard}>
          <View>
            <Text style={S.priceLabel}>Estimasi Total</Text>
            <Text style={S.priceSub}>
              Menu {formatRupiah(cartSubtotal)} · Ongkir {formatRupiah(deliveryFee)} · Fee {formatRupiah(serviceFee)}
            </Text>
            <Text style={S.priceDistance}>Jarak {formatDistance(deliveryDistanceKm)}</Text>
          </View>
          <Text style={S.priceValue}>{formatRupiah(estimatedTotal)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[S.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmitCart}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={WHITE} /> : <Text style={S.submitText}>Buat Pesanan</Text>}
        </TouchableOpacity>
      </>
    );
  };

  const renderManual = () => (
    <>
      <LinearGradient colors={[PURPLE, PRIMARY]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.checkoutHeader}>
        <View style={S.headerRow}>
          <HeaderButton onPress={goBackInFlow} />
          <Text style={S.checkoutHeaderTitle}>Pesan Manual</Text>
          <View style={{ width: 42 }} />
        </View>
        <Text style={S.checkoutTitle}>Beli barang bebas</Text>
        <Text style={S.checkoutSubtitle}>Untuk apotek, minimarket, ATK, atau tempat yang belum ada di katalog.</Text>
      </LinearGradient>

      <View style={S.card}>
        <Text style={S.inputLabel}>Nama makanan/barang</Text>
        <TextInput
          value={manualFoodName}
          onChangeText={setManualFoodName}
          placeholder="Contoh: Paracetamol / Charger Type-C / Ayam Geprek"
          placeholderTextColor="#94a3b8"
          style={S.input}
          editable={!loading}
        />

        <Text style={S.inputLabel}>Nama toko/tempat beli</Text>
        <TextInput
          value={manualRestaurantName}
          onChangeText={setManualRestaurantName}
          placeholder="Contoh: Apotek Lohbener / Alfamart / Warung Pak Asep"
          placeholderTextColor="#94a3b8"
          style={S.input}
          editable={!loading}
        />

        <Text style={S.inputLabel}>Estimasi harga barang</Text>
        <TextInput
          value={manualFoodPrice}
          onChangeText={setManualFoodPrice}
          placeholder="Kosongkan untuk default Rp 20.000"
          placeholderTextColor="#94a3b8"
          style={S.input}
          keyboardType="numeric"
          editable={!loading}
        />
      </View>

      <View style={S.card}>
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Lokasi</Text>
        </View>
        <LocationCard
          title="Lokasi Ambil / Toko"
          subtitle="Pilih titik toko/tempat beli di map"
          location={manualPickup}
          icon="shopping-bag"
          color={PRIMARY}
          onPress={() => openManualPicker("pickup")}
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
          onPress={() => openManualPicker("destination")}
        />
      </View>

      <View style={S.card}>
        <Text style={S.inputLabel}>Catatan pesanan</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Contoh: merek obat, warna barang, patokan tempat, dll"
          placeholderTextColor="#94a3b8"
          style={S.noteInput}
          multiline
          textAlignVertical="top"
          editable={!loading}
        />
      </View>

      <View style={S.priceCard}>
        <View>
          <Text style={S.priceLabel}>Estimasi Total</Text>
          <Text style={S.priceSub}>
            Barang {formatRupiah(Number.isNaN(manualParsedPrice) ? DEFAULT_FOOD_PRICE : manualParsedPrice)} · Ongkir {formatRupiah(manualDeliveryFee)} · Fee {formatRupiah(manualServiceFee)}
          </Text>
          <Text style={S.priceDistance}>Jarak {formatDistance(manualPickupDistanceKm)}</Text>
        </View>
        <Text style={S.priceValue}>{formatRupiah(manualEstimatedTotal)}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={[S.submitBtn, loading && { opacity: 0.7 }]}
        onPress={handleSubmitManual}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={WHITE} /> : <Text style={S.submitText}>Buat Pesanan Manual</Text>}
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={S.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={screen === "checkout" ? PRIMARY_DK : PURPLE} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={S.content}>
          {screen === "catalog" ? renderCatalog() : null}
          {screen === "merchant" ? renderMerchant() : null}
          {screen === "checkout" ? renderCheckout() : null}
          {screen === "manual" ? renderManual() : null}
        </ScrollView>

        {screen === "merchant" && cartQty > 0 ? (
          <View style={S.cartBarWrap}>
            <TouchableOpacity activeOpacity={0.92} style={S.cartBar} onPress={() => setScreen("checkout")}>
              <View style={S.cartQtyBadge}>
                <Text style={S.cartQtyText}>{cartQty}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.cartTitle}>Lihat keranjang</Text>
                <Text style={S.cartSub}>{formatRupiah(cartSubtotal)} dari {selectedMerchant?.name}</Text>
              </View>
              <Feather name="chevron-right" size={22} color={WHITE} />
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BG },
  content: { paddingBottom: 120, backgroundColor: PAGE_BG },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnLight: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnLightText: { color: PRIMARY_DK, fontSize: 12, fontWeight: "900" },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { marginTop: 20, color: WHITE, fontSize: 31, fontWeight: "900", letterSpacing: -0.8 },
  heroSubtitle: { color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: "88%" },
  searchBox: {
    marginTop: 18,
    backgroundColor: WHITE,
    borderRadius: 18,
    minHeight: 52,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
  },
  detailSearchBox: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: WHITE,
    borderRadius: 18,
    minHeight: 52,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: { flex: 1, marginLeft: 10, color: INK, fontSize: 14, fontWeight: "700" },
  clearText: { color: MUTED, fontSize: 24, lineHeight: 26, fontWeight: "900", paddingHorizontal: 4 },
  categoryList: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4, gap: 10 },
  categoryChip: {
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  categoryChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  categoryEmoji: { fontSize: 15 },
  categoryText: { fontSize: 12, color: INK_MID, fontWeight: "800" },
  categoryTextActive: { color: WHITE },
  manualBanner: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 12,
    borderRadius: 22,
    backgroundColor: WHITE,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  manualImage: { width: 68, height: 68, borderRadius: 18, marginRight: 12 },
  manualTitle: { color: INK, fontSize: 16, fontWeight: "900" },
  manualSubtitle: { color: MUTED, fontSize: 12, lineHeight: 17, marginTop: 3 },
  sectionBlock: { marginTop: 20, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { color: INK, fontSize: 18, fontWeight: "900", letterSpacing: -0.3 },
  sectionHint: { color: MUTED, fontSize: 12, fontWeight: "800" },
  recoList: { gap: 12, paddingRight: 20 },
  recoCard: {
    width: 158,
    height: 198,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  recoImage: { width: "100%", height: "100%" },
  recoGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.14)" },
  recoInfo: { position: "absolute", left: 12, right: 12, bottom: 12 },
  recoName: { color: WHITE, fontSize: 15, lineHeight: 18, fontWeight: "900" },
  recoResto: { color: "rgba(255,255,255,0.86)", fontSize: 11, fontWeight: "700", marginTop: 3 },
  recoPrice: { color: WHITE, fontSize: 13, fontWeight: "900", marginTop: 7 },
  merchantCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 12,
    flexDirection: "row",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#edf2f7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  merchantImage: { width: 96, height: 96, borderRadius: 20, backgroundColor: "#e2e8f0" },
  merchantBody: { flex: 1, marginLeft: 13, justifyContent: "center" },
  merchantTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  merchantName: { flex: 1, color: INK, fontSize: 16, fontWeight: "900" },
  ratingBadge: { color: ORANGE, fontSize: 12, fontWeight: "900", backgroundColor: "#fff7ed", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  merchantAddress: { color: MUTED, fontSize: 12, fontWeight: "700", marginTop: 5 },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginTop: 7, gap: 5 },
  metaText: { color: INK_MID, fontSize: 11, fontWeight: "800" },
  dotText: { color: MUTED, fontSize: 11, fontWeight: "900" },
  menuPreview: { color: PRIMARY_DK, fontSize: 12, fontWeight: "800", marginTop: 7 },
  emptyBox: { backgroundColor: WHITE, borderRadius: 22, padding: 22, alignItems: "center" },
  emptyTitle: { color: INK, fontSize: 16, fontWeight: "900" },
  emptySubtitle: { color: MUTED, fontSize: 13, marginTop: 5, textAlign: "center" },
  detailHeroWrap: { height: 285, backgroundColor: INK },
  detailHeroImage: { width: "100%", height: "100%" },
  detailHeroOverlay: { ...StyleSheet.absoluteFillObject },
  detailHeroTop: { position: "absolute", top: 16, left: 20, right: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailHeroText: { position: "absolute", left: 20, right: 20, bottom: 22 },
  detailCategory: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.2)", color: WHITE, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, fontSize: 12, fontWeight: "900", overflow: "hidden" },
  detailTitle: { color: WHITE, fontSize: 27, fontWeight: "900", marginTop: 10, letterSpacing: -0.6 },
  detailSubtitle: { color: "rgba(255,255,255,0.86)", fontSize: 13, lineHeight: 18, marginTop: 5 },
  detailMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  detailMeta: { color: WHITE, fontSize: 12, fontWeight: "900" },
  menuRow: {
    backgroundColor: WHITE,
    borderRadius: 22,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#edf2f7",
  },
  menuImage: { width: 78, height: 78, borderRadius: 18, marginRight: 12, backgroundColor: "#e2e8f0" },
  menuName: { flex: 1, color: INK, fontSize: 15, fontWeight: "900" },
  menuDesc: { color: MUTED, fontSize: 12, lineHeight: 17, marginTop: 3, paddingRight: 8 },
  menuPrice: { color: PRIMARY_DK, fontSize: 14, fontWeight: "900", marginTop: 7 },
  popularPill: { color: ORANGE, backgroundColor: "#fff7ed", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, overflow: "hidden", fontSize: 10, fontWeight: "900" },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: PRIMARY },
  qtyControl: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: GREEN_SOFT, borderRadius: 999, padding: 4 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: WHITE, alignItems: "center", justifyContent: "center" },
  qtyText: { color: INK, minWidth: 14, textAlign: "center", fontSize: 14, fontWeight: "900" },
  cartBarWrap: { position: "absolute", left: 16, right: 16, bottom: 18 },
  cartBar: {
    backgroundColor: PRIMARY,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 12,
  },
  cartQtyBadge: { width: 38, height: 38, borderRadius: 19, backgroundColor: WHITE, alignItems: "center", justifyContent: "center", marginRight: 12 },
  cartQtyText: { color: PRIMARY, fontSize: 15, fontWeight: "900" },
  cartTitle: { color: WHITE, fontSize: 15, fontWeight: "900" },
  cartSub: { color: "rgba(255,255,255,0.82)", fontSize: 12, fontWeight: "700", marginTop: 2 },
  checkoutHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  checkoutHeaderTitle: { color: WHITE, fontSize: 16, fontWeight: "900" },
  checkoutTitle: { color: WHITE, fontSize: 26, fontWeight: "900", marginTop: 20, letterSpacing: -0.5 },
  checkoutSubtitle: { color: "rgba(255,255,255,0.86)", fontSize: 13, lineHeight: 19, marginTop: 5 },
  card: { marginHorizontal: 20, marginTop: 18, backgroundColor: WHITE, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: "#edf2f7" },
  checkoutItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  checkoutImage: { width: 54, height: 54, borderRadius: 15, marginRight: 11 },
  checkoutItemName: { color: INK, fontSize: 14, fontWeight: "900" },
  checkoutItemSub: { color: MUTED, fontSize: 12, fontWeight: "700", marginTop: 3 },
  clearCart: { color: RED, fontSize: 12, fontWeight: "900" },
  locationCard: { flexDirection: "row", alignItems: "center", padding: 13, borderRadius: 18, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: BORDER },
  locationIcon: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", marginRight: 12 },
  locationTitle: { color: INK, fontSize: 12, fontWeight: "900", marginBottom: 3 },
  locationValue: { color: INK_MID, fontSize: 13, lineHeight: 18, fontWeight: "800" },
  locationNote: { color: MUTED, fontSize: 11, marginTop: 4, fontWeight: "700" },
  locationAction: { alignItems: "flex-end", marginLeft: 8 },
  locationActionText: { fontSize: 12, fontWeight: "900" },
  lockedText: { color: PRIMARY, fontSize: 11, fontWeight: "900", backgroundColor: GREEN_SOFT, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  routeConnector: { marginLeft: 33, marginVertical: 4, alignItems: "center", alignSelf: "flex-start" },
  routeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: PRIMARY },
  routeLine: { width: 2, height: 18, backgroundColor: BORDER },
  inputLabel: { color: INK, fontSize: 13, fontWeight: "900", marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: BORDER, backgroundColor: "#f8fafc", borderRadius: 16, minHeight: 52, paddingHorizontal: 14, color: INK, fontSize: 14, fontWeight: "700" },
  noteInput: { borderWidth: 1, borderColor: BORDER, backgroundColor: "#f8fafc", borderRadius: 16, minHeight: 96, paddingHorizontal: 14, paddingVertical: 12, color: INK, fontSize: 14, fontWeight: "700" },
  priceCard: { marginHorizontal: 20, marginTop: 18, padding: 17, borderRadius: 24, backgroundColor: "#0f172a", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "800" },
  priceSub: { color: "rgba(255,255,255,0.72)", fontSize: 11, lineHeight: 16, marginTop: 5, maxWidth: 220 },
  priceDistance: { color: "rgba(255,255,255,0.58)", fontSize: 11, fontWeight: "800", marginTop: 4 },
  priceValue: { color: WHITE, fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  submitBtn: { marginHorizontal: 20, marginTop: 16, height: 56, borderRadius: 18, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center", shadowColor: PRIMARY, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 7 },
  submitText: { color: WHITE, fontSize: 16, fontWeight: "900" },
});
