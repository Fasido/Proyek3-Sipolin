import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker'; // UPDATE: Import dari sini
import { ordersAPI } from '../../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SERVICES = [
  { label: 'Pol-Ride (Antar Jemput)', value: 'ride' },
  { label: 'Pol-Titip (Jasa Titip)', value: 'titip' },
  { label: 'Pol-Food (Pesan Makan)', value: 'food' },
  { label: 'Lainnya', value: 'other' },
];

export default function CreateOrderScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ride',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!formData.title || !formData.description) {
      setError('Lokasi dan Detail pesanan wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Kita tetap pakai ordersAPI.create sementara, nanti tinggal rename di backend
      const response = await ordersAPI.create(formData);
      Alert.alert('Sukses', 'Pesanan kamu sudah masuk ke sistem!', [
        {
          text: 'Lihat Status',
          onPress: () => router.push(`/(app)/orders/${response.data.id}`),
        },
        {
          text: 'Oke',
          onPress: () => router.push('/(app)/dashboard'),
        },
      ]);
    } catch (error) {
      setError(error.response?.data?.error || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#2563eb" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">Pesan Layanan</Text>
          </View>

          {/* Form Card */}
          <View className="bg-gray-50 rounded-3xl p-6 shadow-sm">
            {/* Title / Alamat */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Lokasi Jemput/Tujuan *</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500"
                placeholder="Contoh: Gedung Lab Informatika ke Kantin"
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                editable={!loading}
              />
            </View>

            {/* Category / Layanan */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Pilih Layanan</Text>
              <View className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  enabled={!loading}
                >
                  {SERVICES.map((service) => (
                    <Picker.Item key={service.value} label={service.label} value={service.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Description / Detail */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Detail Pesanan *</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500"
                placeholder="Sebutkan detail (misal: Titip seblak level 5, atau Pakai helm sendiri)"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={4}
                editable={!loading}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleCreate}
              disabled={loading}
              className="bg-blue-600 rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-blue-500"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Konfirmasi Pesanan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}