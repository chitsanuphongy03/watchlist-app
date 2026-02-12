import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import {
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
  NotoSansThai_700Bold,
} from "@expo-google-fonts/noto-sans-thai";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AnimatedSplash } from "@/components/animated-splash";
import { PopupProvider } from "@/components/ui/popup-provider";
import { Colors, FontFamily, FontSize } from "@/constants/theme";
import { saveLastOpened } from "@/services/storage";
import { useAuthStore } from "@/stores/auth-store";
import { useWatchlistStore } from "@/stores/watchlist-store";

SplashScreen.preventAutoHideAsync();

const oldRender = (Text as any).render;
if (oldRender) {
  (Text as any).render = function (...args: any[]) {
    const origin = oldRender.apply(this, args);
    return React.cloneElement(origin, {
      style: [{ fontFamily: FontFamily.regular }, origin.props.style],
    });
  };
}

export const unstable_settings = {
  initialRouteName: "lock",
};

function useProtectedRoute() {
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isPinSet = useAuthStore((s) => s.isPinSet);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const rootSegment = segments[0];
    const inLock = rootSegment === "lock";
    const inSetupPin = rootSegment === "setup-pin";

    if (!isPinSet && !inSetupPin) {
      router.replace("/setup-pin");
    } else if (isPinSet && !isAuthenticated && !inLock) {
      router.replace("/lock");
    } else if (isAuthenticated && (inLock || inSetupPin)) {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.replace("/(tabs)");
      }
    } else {
      hasNavigated.current = false;
    }
  }, [isAuthenticated, isPinSet, isLoading, segments]);
}

export default function RootLayout() {
  const initAuth = useAuthStore((s) => s.initialize);
  const authLoading = useAuthStore((s) => s.isLoading);
  const initWatchlist = useWatchlistStore((s) => s.initialize);
  const initialized = useRef(false);

  const [isSplashFinished, setSplashFinished] = React.useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular: Inter_400Regular,
    Inter_500Medium: Inter_500Medium,
    Inter_600SemiBold: Inter_600SemiBold,
    Inter_700Bold: Inter_700Bold,
    Inter_800ExtraBold: Inter_800ExtraBold,
    NotoSansThai_400Regular: NotoSansThai_400Regular,
    NotoSansThai_500Medium: NotoSansThai_500Medium,
    NotoSansThai_600SemiBold: NotoSansThai_600SemiBold,
    NotoSansThai_700Bold: NotoSansThai_700Bold,
  });

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      try {
        await initAuth();
        await initWatchlist();
        await saveLastOpened();
      } catch (e) {
        console.error("Initialization failed:", e);
      }
    };
    init();
  }, [initAuth, initWatchlist]);

  useEffect(() => {
    if (fontsLoaded && !authLoading) {
    }
  }, [fontsLoaded, authLoading]);

  useProtectedRoute();

  if ((!fontsLoaded && !fontError) || !isSplashFinished) {
    return (
      <AnimatedSplash
        onAnimationFinish={() => setSplashFinished(true)}
        isAppReady={(fontsLoaded || !!fontError) && !authLoading}
      />
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.dark.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="lock" options={{ gestureEnabled: false }} />
        <Stack.Screen name="setup-pin" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen
          name="detail"
          options={{
            presentation: "modal",
            headerShown: true,
            headerTitle: "รายละเอียด",
            headerStyle: { backgroundColor: Colors.dark.background },
            headerTitleStyle: {
              fontFamily: FontFamily.thaiSemiBold,
              fontSize: FontSize.lg,
              color: Colors.dark.text,
            },
            headerTintColor: Colors.dark.text,
            headerShadowVisible: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="add-custom"
          options={{
            presentation: "modal",
            headerShown: true,
            headerTitle: "เพิ่มรายการ",
            headerStyle: { backgroundColor: Colors.dark.background },
            headerTitleStyle: {
              fontFamily: FontFamily.thaiSemiBold,
              fontSize: FontSize.lg,
              color: Colors.dark.text,
            },
            headerTintColor: Colors.dark.text,
            headerShadowVisible: false,
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
      <StatusBar style="light" />
      <PopupProvider />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
