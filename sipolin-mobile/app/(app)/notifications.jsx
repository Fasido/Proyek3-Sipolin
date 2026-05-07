import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Package, Car, Info, ChevronRight } from 'lucide-react-native';
import { notificationsAPI } from '../../services/api';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data.data || response.data);
    } catch (error) {
      console.error("Gagal ambil notif:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_STATUS': return <Car color="#00AA13" size={24} />;
      case 'PROMO': return <Package color="#EE4D2D" size={24} />;
      default: return <Info color="#2563eb" size={24} />;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, !item.isRead && styles.unreadCard]}
      onPress={() => {
        notificationsAPI.markAsRead(item.id);
        // Jika notif tentang order, arahkan ke detail order
        if(item.orderId) router.push(`/orders/${item.orderId}`);
      }}
    >
      <View style={styles.iconContainer}>
        {getIcon(item.type)}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      {!item.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifikasi</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00AA13" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              fetchNotifications();
            }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Bell size={64} color="#ccc" />
              <Text style={styles.emptyText}>Belum ada notifikasi nih.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  card: { 
    flexDirection: 'row', 
    padding: 16, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
    alignItems: 'center' 
  },
  unreadCard: { backgroundColor: '#F0FDF4' },
  iconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  message: { fontSize: 13, color: '#4B5563', marginBottom: 4 },
  time: { fontSize: 11, color: '#9CA3AF' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00AA13' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#9CA3AF' }
});