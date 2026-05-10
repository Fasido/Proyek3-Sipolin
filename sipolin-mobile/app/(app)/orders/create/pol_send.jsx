import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ordersAPI } from '../../services/api';

export default function PolSendScreen() {
  const [foodName, setFoodName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!foodName.trim()) {
      Alert.alert('Error', 'Nama makanan wajib diisi');
      return;
    }
    
    if (!restaurantName.trim()) {
      Alert.alert('Error', 'Nama restoran wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const price = foodPrice ? parseInt(foodPrice) : 20000;
      
      const response = await ordersAPI.createSend({
        foodName: foodName.trim(),
        restaurantName: restaurantName.trim(),
        foodPrice: price,
        note: note.trim(),
      });

      if (response.data?.success) {
        Alert.alert(
          'Sukses', 
          'Pesanan Pol_Send berhasil dibuat',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', response.data?.error || 'Gagal membuat pesanan');
      }
    } catch (error) {
      console.error('Error creating Pol_Send:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Terjadi kesalahan jaringan';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Hitung estimasi harga
  const calculateEstimatedPrice = () => {
    const hargaMakanan = foodPrice ? parseInt(foodPrice) : 20000;
    const jastipFee = 5000 + (hargaMakanan * 0.1);
    return hargaMakanan + jastipFee;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-center text-green-600">Pol_Send</Text>
            <Text className="text-gray-500 text-center mt-2">Jastip Makanan dari Kantin</Text>
          </View>

          {/* Form */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Nama Makanan <Text className="text-red-500">*</Text></Text>
            <TextInput 
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              placeholder="Contoh: Nasi Goreng Spesial"
              placeholderTextColor="#999"
              value={foodName}
              onChangeText={setFoodName}
              editable={!loading}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Nama Restoran/Kantin <Text className="text-red-500">*</Text></Text>
            <TextInput 
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              placeholder="Contoh: Kantin Teknik"
              placeholderTextColor="#999"
              value={restaurantName}
              onChangeText={setRestaurantName}
              editable={!loading}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Harga Makanan (opsional)</Text>
            <TextInput 
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              placeholder="Contoh: 20000"
              placeholderTextColor="#999"
              value={foodPrice}
              onChangeText={setFoodPrice}
              keyboardType="numeric"
              editable={!loading}
            />
            <Text className="text-xs text-gray-500 mt-1">*Default Rp 20.000 jika kosong</Text>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Catatan (opsional)</Text>
            <TextInput 
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              placeholder="Level pedas, tambah telur, dll..."
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
            className={`bg-green-500 p-4 rounded-lg ${loading ? 'opacity-50' : ''}`}
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
          <View className="mt-6 p-4 bg-green-50 rounded-lg">
            <Text className="text-green-800 font-medium text-center">
              💰 Estimasi Total: Rp {calculateEstimatedPrice().toLocaleString('id-ID')}
            </Text>
            <Text className="text-green-600 text-xs text-center mt-1">
              (Harga makanan + fee jastip 10% + Rp 5.000)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}