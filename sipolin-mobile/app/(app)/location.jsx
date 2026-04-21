import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { usersAPI } from '../../services/api';
import { BlurView } from 'expo-blur';
import { ChevronLeft, MapPin } from 'lucide-react-native';

export default function MyLocationScreen() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    (async () => {
      // 1. Minta Izin GPS Bawaan HP
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Izin lokasi ditolak. Buka pengaturan HP untuk mengizinkan.');
        setLoading(false);
        return;
      }

      // 2. Ambil Kordinat Saat Ini (GPS Lokal)
      try {
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(loc.coords);

        // 3. Kirim ke Backend (DIPISAH TRY-CATCH-NYA)
        try {
          await usersAPI.updateLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } catch (apiError) {
          // Kalau error 403 (bukan driver), biarin aja. Peta tetep jalan!
          console.log("Info: Gagal kirim ke server (Biasanya karena login sebagai Customer/Mahasiswa).");
        }

      } catch (error) {
        console.log("Gagal ambil lokasi GPS:", error);
        setErrorMsg('Gagal mendapatkan lokasi dari HP. Pastikan GPS menyala.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);   

  // Kalo lagi loading minta izin
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Menyiapkan GPS...</Text>
      </View>
    );
  }

  // Kalo izin ditolak
  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#ef4444', textAlign: 'center', padding: 20 }}>{errorMsg}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnFallback}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Peta Full Screen */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: location?.latitude || -6.200000, // Default kalo null
          longitude: location?.longitude || 106.816666,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {location && (
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="Lokasi Saya"
            description="Ini adalah posisi Anda saat ini"
          />
        )}
      </MapView>

      {/* Tombol Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ChevronLeft color="#fff" size={24} />
      </TouchableOpacity>

      {/* Glassmorphism Card Info */}
      <View style={styles.cardContainer}>
        <BlurView intensity={40} tint="dark" style={styles.glassCard}>
          <View style={styles.iconBox}>
            <MapPin color="#3b82f6" size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Live Location Aktif</Text>
            <Text style={styles.cardSub}>Posisi Anda sedang dibagikan ke server SIPOLIN.</Text>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  map: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnFallback: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cardContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardSub: { color: '#94a3b8', fontSize: 12, lineHeight: 18 },
});