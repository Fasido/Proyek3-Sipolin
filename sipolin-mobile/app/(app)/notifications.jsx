import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { notificationsAPI } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const NOTIFICATION_COLORS = {
  report_update: 'blue',
  approval: 'green',
  system: 'gray',
};

const NOTIFICATION_ICONS = {
  report_update: '📝',
  approval: '✅',
  system: '⚙️',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.list(50);
      setNotifications(response.data);
    } catch (error) {
      console.error('[Notifications] Error fetching:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (!isRead) {
      try {
        await notificationsAPI.markAsRead(id);
        setNotifications(
          notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error('[Notifications] Error marking as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(
        notifications.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('[Notifications] Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error('[Notifications] Error deleting:', error);
    }
  };

  const NotificationCard = ({ notification }) => (
    <TouchableOpacity
      onPress={() => handleMarkAsRead(notification.id, notification.isRead)}
      className={`flex-row items-start p-4 mb-2 rounded-lg ${
        notification.isRead ? 'bg-gray-50' : 'bg-blue-50'
      }`}
    >
      <Text className="text-2xl mr-3">
        {NOTIFICATION_ICONS[notification.type] || '📢'}
      </Text>
      <View className="flex-1">
        <Text className={`font-semibold ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
          {notification.title}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">{notification.message}</Text>
        <Text className="text-xs text-gray-500 mt-2">
          {new Date(notification.createdAt).toLocaleDateString()} -{' '}
          {new Date(notification.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(notification.id)}
        className="ml-2"
      >
        <Text className="text-gray-400 text-lg">✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="px-6 py-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
              {unreadCount > 0 && (
                <Text className="text-sm text-gray-600 mt-1">{unreadCount} unread</Text>
              )}
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                className="bg-blue-600 rounded-lg px-3 py-2"
              >
                <Text className="text-white text-sm font-semibold">Mark All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <View className="bg-white rounded-lg overflow-hidden">
              {notifications.map((notification, index) => (
                <View
                  key={notification.id}
                  className={index !== notifications.length - 1 ? 'border-b border-gray-200' : ''}
                >
                  <NotificationCard notification={notification} />
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-lg p-8 text-center">
              <Text className="text-2xl mb-2">🔔</Text>
              <Text className="text-gray-600 font-semibold mb-2">No Notifications</Text>
              <Text className="text-gray-500 text-sm">
                You&apos;re all caught up! Check back later for updates.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
