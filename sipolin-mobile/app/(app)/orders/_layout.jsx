import { Stack } from 'expo-router';

export default function OrdersLayout() {
  return (
    // Stack ini berfungsi buat "ngarungin" layar-layar pesanan
    // biar nggak tumpah ke Tab Bar bawah
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}