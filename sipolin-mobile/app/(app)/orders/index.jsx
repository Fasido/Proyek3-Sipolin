import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ordersAPI } from '../../../services/api';

export default function OrdersListScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const result = await ordersAPI.list();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getTypeIcon = (type) => {
    return type === 'pol_ride' ? '🚗' : '🍔';
  };

  const getTypeName = (type) => {
    return type === 'pol_ride' ? 'Pol_Ride' : 'Pol_Send';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Memuat pesanan...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {orders.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-4xl mb-4">📦</Text>
          <Text className="text-gray-500 text-center">Belum ada pesanan</Text>
          <Text className="text-gray-400 text-center text-sm mt-1">
            Klik + untuk buat pesanan baru
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="border-b border-gray-100 p-4"
              onPress={() => router.push(`/orders/${item.id}`)}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center flex-1">
                  <Text className="text-2xl mr-3">{getTypeIcon(item.type)}</Text>
                  <View className="flex-1">
                    <Text className="font-bold text-lg">{getTypeName(item.type)}</Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {item.type === 'pol_ride' ? item.pickup : item.destination}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-green-600">
                    {formatPrice(item.price)}
                  </Text>
                  <View className={`${getStatusColor(item.status)} px-2 py-1 rounded-full mt-1`}>
                    <Text className="text-white text-xs capitalize">{item.status}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}