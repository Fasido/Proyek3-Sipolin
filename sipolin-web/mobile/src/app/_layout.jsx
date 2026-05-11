// mobile/src/app/_layout.jsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { tokenStorage } from "../services/api";
import { useRouter, useSegments } from "expo-router";

// ─── Auth Guard ───────────────────────────────────────────────────────────────

function useAuthGuard() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    (async () => {
      const token = await tokenStorage.get();
      const inAuthGroup = segments[0] === "auth";
      const inPublic = segments[0] === "index" || segments.length === 0;

      if (!token && !inAuthGroup) {
        router.replace("/auth/login");
      } else if (token && inAuthGroup) {
        router.replace("/home");
      }
    })();
  }, [segments]);
}

// ─── Root Layout ─────────────────────────────────────────────────────────────

export default function RootLayout() {
  useAuthGuard();

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Public */}
        <Stack.Screen name="index" />

        {/* Auth */}
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />

        {/* Main */}
        <Stack.Screen name="home/index" />

        {/* Orders */}
        <Stack.Screen name="orders/index" />
        <Stack.Screen name="orders/create/index" />
        <Stack.Screen
          name="orders/create/pol-ride"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="orders/create/pol-send"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="orders/create/nitip-apa-aja"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen name="orders/[id]" />
        <Stack.Screen
          name="orders/tracking/[id]"
          options={{ presentation: "fullScreenModal" }}
        />

        {/* Profile */}
        <Stack.Screen name="profile/index" />
      </Stack>
    </>
  );
}
