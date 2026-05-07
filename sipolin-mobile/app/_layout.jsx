import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router"; 
import { AuthProvider, useAuth } from "../context/AuthContext";

function InitialLayout() {
  const { isLoading, token } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      // FIX NYA DI SINI YAA: 
      // Cukup arahin ke /(app), nanti dia otomatis ngebuka index.jsx
      router.replace('/(app)'); 
    }
  }, [isLoading, token, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 20, fontSize: 16, fontWeight: 'bold' }}>Memeriksa akun...</Text>
        <Text style={{ marginTop: 5, color: '#6B7280' }}>SIPOLIN • Polindra</Text>
      </View>
    );
  }

  // Pakai Stack biar file _layout.jsx di dalem (app) nggak hilang
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}