import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function ChooseOrderType() {
  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-center mb-8">
        Pilih Tipe Pesanan
      </Text>
      
      <TouchableOpacity 
        className="bg-blue-500 p-4 rounded-xl mb-4"
        onPress={() => router.push('/orders/create/pol_ride')}
      >
        <Text className="text-white text-lg font-bold text-center">
          🚗 Pol_Ride
        </Text>
        <Text className="text-white text-center mt-1">
          Antar Jemput dalam Kampus
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="bg-green-500 p-4 rounded-xl"
        onPress={() => router.push('/orders/create/pol_send')}
      >
        <Text className="text-white text-lg font-bold text-center">
          🍔 Pol_Send
        </Text>
        <Text className="text-white text-center mt-1">
          Jastip Makanan dari Kantin
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}