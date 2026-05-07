import React, { useEffect, useRef } from "react";
import { ActivityIndicator, View, Animated, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Home, MessageSquare, Clock, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Warna tema Gojek/Grab ───
const COLORS = {
  primary: "#00AA5B",       // Hijau Gojek
  primaryDark: "#007A3E",   // Hijau tua untuk gradient
  primaryLight: "#E6F7EE",  // Hijau muda untuk active bg
  inactive: "#9CA3AF",
  white: "#FFFFFF",
  border: "#F0F0F0",
  shadow: "#00AA5B",
};

// ─── Custom Tab Bar ───
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const animValues = useRef(state.routes.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    state.routes.forEach((_, i) => {
      Animated.spring(animValues[i], {
        toValue: state.index === i ? 1 : 0,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }).start();
    });
  }, [state.index]);

  const tabs = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.href !== null && options.href !== undefined
      ? true
      : options.href === null
      ? false
      : true;
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
      {/* Garis aksen hijau di atas */}
      <View style={styles.topAccent} />

      {tabs.map((route, index) => {
        const isFocused = state.index === state.routes.findIndex((r) => r.key === route.key);
        const IconComponent = icons[route.name];
        const label = labels[route.name];

        if (!IconComponent) return null;

        const scale = animValues[state.routes.findIndex((r) => r.key === route.key)].interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.12],
        });

        const translateY = animValues[state.routes.findIndex((r) => r.key === route.key)].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -3],
        });

        const onPress = () => {
          const routeIndex = state.routes.findIndex((r) => r.key === route.key);
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
            activeOpacity={0.7}
            style={styles.tabItem}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                isFocused && styles.iconWrapperActive,
                {
                  transform: [{ scale }, { translateY }],
                },
              ]}
            >
              {/* Lingkaran hijau di belakang ikon aktif */}
              {isFocused && (
                <Animated.View
                  style={[
                    styles.activeBackground,
                    {
                      opacity: animValues[
                        state.routes.findIndex((r) => r.key === route.key)
                      ],
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
                  opacity: animValues[
                    state.routes.findIndex((r) => r.key === route.key)
                  ].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ]}
            >
              {label}
            </Animated.Text>

            {/* Dot indicator di bawah label */}
            {isFocused && (
              <Animated.View
                style={[
                  styles.dotIndicator,
                  {
                    opacity: animValues[
                      state.routes.findIndex((r) => r.key === route.key)
                    ],
                    transform: [
                      {
                        scaleX: animValues[
                          state.routes.findIndex((r) => r.key === route.key)
                        ].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ],
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

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    // Shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    // Shadow Android
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
  iconWrapperActive: {
    // Efek subtle ketika aktif
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

// ─── Main Layout ───
export default function AppLayout() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [token, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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

      {/* Hidden routes */}
      <Tabs.Screen name="chat/[id]" options={{ href: null }} />
      <Tabs.Screen name="pol-ride" options={{ href: null }} />
      <Tabs.Screen name="pol-send" options={{ href: null }} />
      <Tabs.Screen name="orders" options={{ href: null }} />
      <Tabs.Screen name="location" options={{ href: null }} />
      // Di _layout.jsx
<Tabs.Screen
  name="notifications"
  options={{
    href: null, // Sembunyiin dari navbar bawah tapi tetep bisa dibuka lewat icon lonceng di Home
  }}
/>
    </Tabs>
  );
}