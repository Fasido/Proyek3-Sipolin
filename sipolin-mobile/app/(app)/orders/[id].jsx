import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ordersAP} from '../../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getDetail(id);
      setOrder(response.data);
    } catch (error) {
      console.error('[Order Detail] Error fetching order:', error);
      Alert.alert('Error', 'Failed to load order');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await ordersAPI.delete(id);
              Alert.alert('Success', 'Order deleted successfully');
              router.push('/(app)/orders');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete order');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">Order not found</Text>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'gray',
      submitted: 'yellow',
      reviewed: 'blue',
      approved: 'green',
      rejected: 'red',
    };
    return colors[status] || 'gray';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'blue',
      medium: 'yellow',
      high: 'orange',
      critical: 'red',
    };
    return colors[priority] || 'gray';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 mb-2">{order.title}</Text>

          {/* Meta Info */}
          <View className="flex-row gap-2 mb-6">
            <View className={`bg-${getStatusColor(order.status)}-100 rounded px-3 py-1`}>
              <Text
                className={`text-xs font-semibold text-${getStatusColor(order.status)}-700 uppercase`}
              >
                {order.status}
              </Text>
            </View>
            <View className={`bg-${getPriorityColor(order.priority)}-100 rounded px-3 py-1`}>
              <Text
                className={`text-xs font-semibold text-${getPriorityColor(order.priority)}-700 uppercase`}
              >
                {order.priority}
              </Text>
            </View>
          </View>

          {/* Details Card */}
          <View className="bg-white rounded-lg p-6 mb-6">
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-600 mb-1">Category</Text>
              <Text className="text-base text-gray-900">{order.category}</Text>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-600 mb-1">Description</Text>
              <Text className="text-base text-gray-900">{order.description}</Text>
            </View>

            {order.comments && (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-1">Comments</Text>
                <Text className="text-base text-gray-900">{order.comments}</Text>
              </View>
            )}

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-600 mb-1">Created</Text>
              <Text className="text-base text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()} at{' '}
                {new Date(order.createdAt).toLocaleTimeString()}
              </Text>
            </View>

            {order.reviewedAt && (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-1">Reviewed</Text>
                <Text className="text-base text-gray-900">
                  {new Date(order.reviewedAt).toLocaleDateString()}
                </Text>
              </View>
            )}

            {order.attachments && order.attachments.length > 0 && (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">Attachments</Text>
                {order.attachments.map((attachment, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-gray-100 rounded-lg p-3 mb-2 flex-row items-center"
                  >
                    <Text className="text-blue-600 flex-1">📎 {attachment}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {order.status === 'draft' && (
            <>
              <TouchableOpacity
                onPress={() => router.push(`/(app)/orders/edit/${order.id}`)}
                className="bg-blue-600 rounded-lg py-3 mb-3"
              >
                <Text className="text-white font-semibold text-center">Edit Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(`/(app)/orders/submit/${order.id}`)}
                className="bg-green-600 rounded-lg py-3 mb-3"
              >
                <Text className="text-white font-semibold text-center">Submit Order</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            className="bg-red-600 rounded-lg py-3 mb-8"
          >
            <Text className="text-white font-semibold text-center">
              {deleting ? 'Deleting...' : 'Delete Order'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
