import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ordersAPI } from "../../../../services/api";

const MAX_FOOD_PRICE = 100000;

export default function PolSendScreen() {
  const [foodName, setFoodName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [foodPrice, setFoodPrice] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Derived / helpers ──────────────────────────────────────────────────
  const parsedPrice = foodPrice === "" ? 20000 : parseInt(foodPrice, 10);
  const priceIsValid =
    foodPrice === "" ||
    (!Number.isNaN(parsedPrice) && parsedPrice > 0 && parsedPrice <= MAX_FOOD_PRICE);

  const estimatedTotal = () => {
    const base = Number.isNaN(parsedPrice) ? 20000 : parsedPrice;
    return base + 5000 + base * 0.1;
  };

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = () => {
    if (!foodName.trim()) {
      Alert.alert("Error", "Nama makanan wajib diisi");
      return false;
    }
    if (!restaurantName.trim()) {
      Alert.alert("Error", "Nama restoran/kantin wajib diisi");
      return false;
    }
    if (foodPrice !== "" && Number.isNaN(parseInt(foodPrice, 10))) {
      Alert.alert("Error", "Harga makanan harus berupa angka");
      return false;
    }
    if (foodPrice !== "" && parseInt(foodPrice, 10) > MAX_FOOD_PRICE) {
      Alert.alert(
        "Error",
        `Harga makanan maksimal Rp ${MAX_FOOD_PRICE.toLocaleString("id-ID")}`
      );
      return false;
    }
    if (foodPrice !== "" && parseInt(foodPrice, 10) <= 0) {
      Alert.alert("Error", "Harga makanan harus lebih dari 0");
      return false;
    }
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const price = foodPrice === "" ? 20000 : parseInt(foodPrice, 10);

      const response = await ordersAPI.createSend({
        foodName: foodName.trim(),
        restaurantName: restaurantName.trim(),
        foodPrice: price,
        note: note.trim(),
      });

      const order = response?.data?.data || response?.data?.order || response?.data || null;
      const orderId = order?.id;

      if (response.data?.success || orderId) {
        Alert.alert("Pesanan Dibuat!", "Pesanan masuk dan sedang menunggu driver.", [
          {
            text: "Lihat Detail",
            onPress: () =>
              orderId
                ? router.replace(`/orders/${orderId}`)
                : router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", response.data?.error || "Gagal membuat pesanan");
      }
    } catch (error) {
      console.error("Error creating Pol_Send:", error);
      const msg =
        error.response?.data?.error ||
        error.message ||
        "Terjadi kesalahan jaringan";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  // ── UI helpers ─────────────────────────────────────────────────────────
  const inputStyle = (hasError = false) => ({
    borderWidth: 1,
    borderColor: hasError ? "#ef4444" : loading ? "#d1d5db" : "#6ee7b7",
    borderRadius: 10,
    padding: 12,
    backgroundColor: hasError ? "#fff1f2" : "#f0fdf4",
    color: "#111827",
    fontSize: 14,
  });

  const labelStyle = {
    color: "#374151",
    marginBottom: 6,
    fontWeight: "600",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* ── Header ── */}
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#d1fae5",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 26 }}>🍱</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#059669" }}>
              Pol_Send
            </Text>
            <Text style={{ color: "#6b7280", marginTop: 4, fontSize: 13 }}>
              Jastip Makanan dari Kantin
            </Text>
          </View>

          {/* ── Nama Makanan ── */}
          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>
              Nama Makanan <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <TextInput
              style={inputStyle()}
              placeholder="Contoh: Nasi Goreng Spesial"
              placeholderTextColor="#9ca3af"
              value={foodName}
              onChangeText={setFoodName}
              editable={!loading}
            />
          </View>

          {/* ── Nama Restoran ── */}
          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>
              Nama Restoran/Kantin <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <TextInput
              style={inputStyle()}
              placeholder="Contoh: Kantin Teknik"
              placeholderTextColor="#9ca3af"
              value={restaurantName}
              onChangeText={setRestaurantName}
              editable={!loading}
            />
          </View>

          {/* ── Harga Makanan ── */}
          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>
              Harga Makanan{" "}
              <Text style={{ color: "#9ca3af", fontWeight: "400" }}>
                (opsional)
              </Text>
            </Text>
            <TextInput
              style={inputStyle(!priceIsValid)}
              placeholder="Contoh: 15000"
              placeholderTextColor="#9ca3af"
              value={foodPrice}
              onChangeText={setFoodPrice}
              keyboardType="numeric"
              editable={!loading}
            />
            {!priceIsValid ? (
              <Text style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>
                Harus berupa angka antara 1 – Rp 100.000
              </Text>
            ) : (
              <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>
                Kosongkan untuk default Rp 20.000 · maks. Rp 100.000
              </Text>
            )}
          </View>

          {/* ── Catatan ── */}
          <View style={{ marginBottom: 28 }}>
            <Text style={labelStyle}>
              Catatan{" "}
              <Text style={{ color: "#9ca3af", fontWeight: "400" }}>
                (opsional)
              </Text>
            </Text>
            <TextInput
              style={[inputStyle(), { height: 80, textAlignVertical: "top" }]}
              placeholder="Level pedas, tambah telur, dll..."
              placeholderTextColor="#9ca3af"
              value={note}
              onChangeText={setNote}
              multiline
              editable={!loading}
            />
          </View>

          {/* ── Estimasi Harga ── */}
          <View
            style={{
              backgroundColor: "#ecfdf5",
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#a7f3d0",
            }}
          >
            <Text
              style={{
                color: "#065f46",
                fontWeight: "700",
                textAlign: "center",
                fontSize: 15,
              }}
            >
              💰 Estimasi Total: Rp{" "}
              {(Number.isNaN(parsedPrice)
                ? estimatedTotal()
                : estimatedTotal()
              ).toLocaleString("id-ID")}
            </Text>
            <Text
              style={{
                color: "#10b981",
                fontSize: 11,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Harga makanan + fee jastip 10% + Rp 5.000
            </Text>
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !priceIsValid}
            style={{
              backgroundColor:
                loading || !priceIsValid ? "#a7f3d0" : "#10b981",
              borderRadius: 12,
              paddingVertical: 15,
              alignItems: "center",
              shadowColor: "#10b981",
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>
                Buat Pesanan
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
