import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ordersAPI } from '../../../../services/api';
import { router } from 'expo-router';

export default function PolRideForm() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pickupLocation || !dropoffLocation) {
      Alert.alert('Error', 'Lokasi jemput dan tujuan wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const result = await ordersAPI.createRide({
        pickupLocation,
        dropoffLocation,
        note,
      });

      if (result.success) {
        Alert.alert('Sukses', result.message);
        router.back();
      } else {
        Alert.alert('Error', result.error || 'Gagal membuat pesanan');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold text-center mb-6">Form Pol_Ride</Text>
        <Text className="text-gray-500 text-center mb-6">Antar Jemput dalam Kampus</Text>
        
        <Text className="text-gray-700 mb-1 font-medium">Lokasi Jemput *</Text>
        <TextInput 
          className="border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50"
          placeholder="Contoh: Gedung Rektorat"
          placeholderTextColor="#999"
          value={pickupLocation}
          onChangeText={setPickupLocation}
        />
        
        <Text className="text-gray-700 mb-1 font-medium">Lokasi Tujuan *</Text>
        <TextInput 
          className="border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50"
          placeholder="Contoh: Gedung Teknik Sipil"
          placeholderTextColor="#999"
          value={dropoffLocation}
          onChangeText={setDropoffLocation}
        />
        
        <Text className="text-gray-700 mb-1 font-medium">Catatan (opsional)</Text>
        <TextInput 
          className="border border-gray-300 rounded-lg p-3 mb-6 bg-gray-50"
          placeholder="Info tambahan..."
          placeholderTextColor="#999"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        
        <TouchableOpacity 
          className={`bg-blue-500 p-4 rounded-lg ${loading ? 'opacity-50' : ''}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? 'Memproses...' : 'Buat Pesanan'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}