import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ordersAPI } from '../../../../services/api';
import { router } from 'expo-router';

export default function PolSendForm() {
  const [foodName, setFoodName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!foodName || !restaurantName) {
      Alert.alert('Error', 'Nama makanan dan restoran wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const result = await ordersAPI.createSend({
        foodName,
        restaurantName,
        foodPrice: foodPrice ? parseInt(foodPrice) : 20000,
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
        <Text className="text-2xl font-bold text-center mb-6">Form Pol_Send</Text>
        <Text className="text-gray-500 text-center mb-6">Jastip Makanan dari Kantin</Text>
        
        <Text className="text-gray-700 mb-1 font-medium">Nama Makanan *</Text>
        <TextInput 
          className="border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50"
          placeholder="Contoh: Nasi Goreng Spesial"
          placeholderTextColor="#999"
          value={foodName}
          onChangeText={setFoodName}
        />
        
        <Text className="text-gray-700 mb-1 font-medium">Nama Restoran *</Text>
        <TextInput 
          className="border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50"
          placeholder="Contoh: Kantin Teknik"
          placeholderTextColor="#999"
          value={restaurantName}
          onChangeText={setRestaurantName}
        />
        
        <Text className="text-gray-700 mb-1 font-medium">Harga Makanan (opsional)</Text>
        <TextInput 
          className="border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50"
          placeholder="Contoh: 20000"
          placeholderTextColor="#999"
          value={foodPrice}
          onChangeText={setFoodPrice}
          keyboardType="numeric"
        />
        
        <Text className="text-gray-700 mb-1 font-medium">Catatan (opsional)</Text>
        <TextInput 
          className="border border-gray-300 rounded-lg p-3 mb-6 bg-gray-50"
          placeholder="Level pedas, tambah telur, dll..."
          placeholderTextColor="#999"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        
        <TouchableOpacity 
          className={`bg-green-500 p-4 rounded-lg ${loading ? 'opacity-50' : ''}`}
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