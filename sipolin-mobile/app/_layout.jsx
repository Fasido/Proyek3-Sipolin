import React from 'react';
import { Stack } from 'expo-router';
// Import AuthProvider dari folder context
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Mengatur folder auth (login/register) */}
        <Stack.Screen name="(auth)" />
        {/* Mengatur folder app (dashboard/tabs) */}
        <Stack.Screen name="(app)" />
      </Stack>
    </AuthProvider>
  );
}