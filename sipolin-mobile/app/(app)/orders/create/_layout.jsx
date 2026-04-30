import { Stack } from 'expo-router';

export default function CreateLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Pilih Tipe' }} />
      <Stack.Screen name="pol_ride" options={{ title: 'Pol_Ride' }} />
      <Stack.Screen name="pol_send" options={{ title: 'Pol_Send' }} />  
    </Stack>
  );
}