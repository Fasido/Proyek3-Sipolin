import { useMemo, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";

import { ordersAPI } from "../../../../services/api";

const ESTIMATED_DISTANCE_KM = 3;
const BASE_FARE = 5000;
const PRICE_PER_KM = 3000;

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getOrderFromResponse(response) {
  return (
    response?.data?.data ||
    response?.data?.order ||
    response?.data ||
    null
  );
}

export default function PolRideScreen() {
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const estimatedPrice = useMemo(() => {
    return BASE_FARE + ESTIMATED_DISTANCE_KM * PRICE_PER_KM;
  }, []);

  const handleSubmit = async () => {
    if (!pickupLocation.trim()) {
      Alert.alert("Lokasi belum lengkap", "Lokasi jemput wajib diisi.");
      return;
    }

    if (!dropoffLocation.trim()) {
      Alert.alert("Lokasi belum lengkap", "Lokasi tujuan wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await ordersAPI.createRide({
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        estimatedDistanceKm: ESTIMATED_DISTANCE_KM,
        estimatedPrice,
        note: note.trim(),
      });

      const order = getOrderFromResponse(response);
      const orderId = order?.id || response?.data?.id;

      if (!response?.data?.success && !orderId) {
        Alert.alert(
          "Gagal membuat pesanan",
          response?.data?.error || "Pesanan gagal dibuat."
        );
        return;
      }

      if (!orderId) {
        Alert.alert(
          "Pesanan dibuat",
          "Pesanan berhasil masuk database, tapi ID pesanan tidak ditemukan dari backend."
        );
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
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 32,
          }}
        >
          <View className="px-5 pt-4">
            <View className="mb-7">
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.8}
                className="mb-5 h-11 w-11 items-center justify-center rounded-full bg-slate-100"
              >
                <Feather name="arrow-left" size={22} color="#0F172A" />
              </TouchableOpacity>

              <View className="h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 mb-4">
                <Ionicons name="bicycle" size={30} color="#10B981" />
              </View>

              <Text className="text-3xl font-black text-slate-900">
                Pol-Ride
              </Text>
              <Text className="mt-2 text-base leading-6 text-slate-500">
                Antar jemput lokal dengan driver Sipolin.
              </Text>
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-bold text-slate-700">
                Lokasi Jemput <Text className="text-red-500">*</Text>
              </Text>

              <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <Feather name="arrow-up" size={18} color="#10B981" />
                </View>

                <TextInput
                  className="h-14 flex-1 text-base font-semibold text-slate-900"
                  placeholder="Contoh: Gedung Rektorat"
                  placeholderTextColor="#94A3B8"
                  value={pickupLocation}
                  onChangeText={setPickupLocation}
                  editable={!loading}
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-bold text-slate-700">
                Lokasi Tujuan <Text className="text-red-500">*</Text>
              </Text>

              <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                  <Feather name="map-pin" size={18} color="#EA580C" />
                </View>

                <TextInput
                  className="h-14 flex-1 text-base font-semibold text-slate-900"
                  placeholder="Contoh: Gedung Teknik Sipil"
                  placeholderTextColor="#94A3B8"
                  value={dropoffLocation}
                  onChangeText={setDropoffLocation}
                  editable={!loading}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-sm font-bold text-slate-700">
                Catatan
              </Text>

              <View className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                <TextInput
                  className="min-h-[92px] text-base font-medium text-slate-900"
                  placeholder="Contoh: Saya tunggu di depan gerbang"
                  placeholderTextColor="#94A3B8"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  textAlignVertical="top"
                  editable={!loading}
                />
              </View>
            </View>

            <View className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <View className="mb-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-bold text-emerald-700">
                    Estimasi Harga
                  </Text>
                  <Text className="mt-1 text-xs font-medium text-slate-500">
                    Estimasi jarak {ESTIMATED_DISTANCE_KM} km
                  </Text>
                </View>

                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500">
                  <Feather name="tag" size={20} color="white" />
                </View>
              </View>

              <Text className="text-3xl font-black text-slate-900">
                {formatRupiah(estimatedPrice)}
              </Text>

              <View className="mt-4 h-px bg-emerald-100" />

              <View className="mt-4 gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-slate-500">Biaya awal</Text>
                  <Text className="text-sm font-bold text-slate-700">
                    {formatRupiah(BASE_FARE)}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-slate-500">
                    Biaya per km
                  </Text>
                  <Text className="text-sm font-bold text-slate-700">
                    {formatRupiah(PRICE_PER_KM)}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              className={`h-14 items-center justify-center rounded-2xl bg-emerald-500 ${
                loading ? "opacity-60" : ""
              }`}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-black text-white">
                  Cari Driver
                </Text>
              )}
            </TouchableOpacity>

            <Text className="mt-4 text-center text-xs leading-5 text-slate-400">
              Pesanan akan masuk ke database dengan status pending lalu menunggu
              driver menerima order.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}