import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { store } from "@src/store";
import { useAppDispatch, useAppSelector } from "@src/store/hooks";
import { hydrateSession } from "@src/store/slices/authSlice";
import { colors } from "@src/theme/colors";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const segments = useSegments();
  const { user, hasHydrated } = useAppSelector((s) => s.auth);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    dispatch(hydrateSession());
  }, [dispatch]);

  useEffect(() => {
    if (!hasHydrated) return;
    setAppReady(true);
    SplashScreen.hideAsync().catch(() => {});
  }, [hasHydrated]);

  useEffect(() => {
    if (!appReady) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [appReady, user, segments, router]);

  if (!appReady) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <StatusBar style="dark" backgroundColor={colors.background} />
          <AuthGate>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
              <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
              <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
              <Stack.Screen name="order/[id]" options={{ presentation: "card" }} />
              <Stack.Screen name="checkout" options={{ presentation: "modal" }} />
              <Stack.Screen name="address/index" options={{ presentation: "card" }} />
              <Stack.Screen name="address/new" options={{ presentation: "modal" }} />
            </Stack>
          </AuthGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
