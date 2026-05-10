import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ordersAPI } from '../../services/api';

export default function PolRideScreen() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pickupLocation.trim()) {
      Alert.alert('Error', 'Lokasi jemput wajib diisi');
      return;
    }
    
    if (!dropoffLocation.trim()) {
      Alert.alert('Error', 'Lokasi tujuan wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await ordersAPI.createRide({
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        note: note.trim(),
      });

      if (response.data?.success) {
        Alert.alert(
          'Sukses', 
          'Pesanan Pol_Ride berhasil dibuat',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', response.data?.error || 'Gagal membuat pesanan');
      }
    } catch (error) {
      console.error('Error creating Pol_Ride:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Terjadi kesalahan jaringan';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-center text-blue-600">Pol_Ride</Text>
            <Text className="text-gray-500 text-center mt-2">Antar Jemput dalam Kampus</Text>
          </View>

          {/* Form */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Lokasi Jemput <Text className="text-red-500">*</Text></Text>
            <TextInput 
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              placeholder="Contoh: Gedung Rektorat"
              placeholderTextColor="#999"
              value={pickupLocation}
              onChangeText={setPickupLocation}
              editable={!loading}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Lokasi Tujuan <Text className="text-red-500">*</Text></Text>
            <TextInput 
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              placeholder="Contoh: Gedung Teknik Sipil"
              placeholderTextColor="#999"
              value={dropoffLocation}
              onChangeText={setDropoffLocation}
              editable={!loading}
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Catatan (opsional)</Text>
            <TextInput 
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              placeholder="Info tambahan..."
              placeholderTextColor="#999"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            className={`bg-blue-500 p-4 rounded-lg ${loading ? 'opacity-50' : ''}`}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">Buat Pesanan</Text>
            )}
          </TouchableOpacity>

          {/* Info Harga */}
          <View className="mt-6 p-4 bg-blue-50 rounded-lg">
            <Text className="text-blue-800 font-medium text-center">
              💰 Estimasi Harga: Rp 15.000 (Rp 5.000/km)
            </Text>
            <Text className="text-blue-600 text-xs text-center mt-1">
              *Estimasi jarak 3km
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}