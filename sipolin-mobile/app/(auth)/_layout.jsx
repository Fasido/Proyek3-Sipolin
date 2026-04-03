import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Kita kasih tau kalau sekarang namanya login, bukan index */}
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}