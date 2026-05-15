import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  View,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Tabs, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Home, MessageSquare, Clock, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Warna tema Sipolin ───
const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  primaryLight: "#ECFDF5",
  inactive: "#9CA3AF",
  white: "#FFFFFF",
  border: "#F0F0F0",
  shadow: "#10B981",
};

// ─── Custom Tab Bar ───
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const animValues = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    state.routes.forEach((_, i) => {
      Animated.spring(animValues[i], {
        toValue: state.index === i ? 1 : 0,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }).start();
    });
  }, [state.index, state.routes, animValues]);

  const visibleTabs = state.routes.filter((route) => {
    const options = descriptors[route.key]?.options || {};
    return options.href !== null;
  });

  const icons = {
    index: Home,
    "chat/index": MessageSquare,
    history: Clock,
    profile: User,
  };

  const labels = {
    index: "Home",
    "chat/index": "Chat",
    history: "Histori",
    profile: "Profil",
  };

  return (
    <View
      style={[
        styles.tabBar,
        {
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        },
      ]}
    >
      <View style={styles.topAccent} />

      {visibleTabs.map((route) => {
        const routeIndex = state.routes.findIndex((r) => r.key === route.key);
        const isFocused = state.index === routeIndex;
        const IconComponent = icons[route.name];
        const label = labels[route.name];

        if (!IconComponent) return null;

        const scale = animValues[routeIndex].interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.12],
        });

        const translateY = animValues[routeIndex].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -3],
        });

        const labelOpacity = animValues[routeIndex].interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1],
        });

        const dotScale = animValues[routeIndex].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        });

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.75}
            style={styles.tabItem}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [{ scale }, { translateY }],
                },
              ]}
            >
              {isFocused && (
                <Animated.View
                  style={[
                    styles.activeBackground,
                    {
                      opacity: animValues[routeIndex],
                    },
                  ]}
                />
              )}

              <IconComponent
                size={22}
                color={isFocused ? COLORS.primary : COLORS.inactive}
                strokeWidth={isFocused ? 2.5 : 1.8}
              />
            </Animated.View>

            <Animated.Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                {
                  opacity: labelOpacity,
                },
              ]}
            >
              {label}
            </Animated.Text>

            {isFocused && (
              <Animated.View
                style={[
                  styles.dotIndicator,
                  {
                    opacity: animValues[routeIndex],
                    transform: [{ scaleX: dotScale }],
                  },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main Layout ───
export default function AppLayout() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!token) return null;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="chat/index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />

      <Tabs.Screen name="chat/[id]" options={{ href: null }} />
      <Tabs.Screen name="orders" options={{ href: null }} />
      <Tabs.Screen name="location" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,

    elevation: 12,
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: "15%",
    right: "15%",
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  iconWrapper: {
    width: 44,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    position: "relative",
  },
  activeBackground: {
    position: "absolute",
    inset: 0,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
  tabLabelInactive: {
    color: COLORS.inactive,
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
});