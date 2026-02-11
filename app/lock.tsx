import { PinPad } from "@/components/pin-pad";
import {
    Accent,
    Colors,
    FontFamily,
    FontSize,
    Spacing,
} from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LockScreen() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const {
    verifyPin,
    authenticateWithBiometric,
    isBiometricEnabled,
    isBiometricAvailable,
  } = useAuthStore();

  const showBiometricButton = isBiometricAvailable;

  const handleBiometric = useCallback(async () => {
    const success = await authenticateWithBiometric();
    if (success) {
      router.replace("/(tabs)");
    }
  }, [authenticateWithBiometric]);

  useEffect(() => {
    if (isBiometricAvailable && isBiometricEnabled) {
      handleBiometric();
    }
  }, [isBiometricAvailable, isBiometricEnabled, handleBiometric]);

  const handlePinChange = useCallback(
    async (newPin: string) => {
      setError(false);
      setPin(newPin);

      if (newPin.length === 6) {
        const valid = await verifyPin(newPin);
        if (valid) {
          router.replace("/(tabs)");
        } else {
          setError(true);
          setTimeout(() => {
            setPin("");
            setError(false);
          }, 500);
        }
      }
    },
    [verifyPin],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Animated.View entering={FadeIn.duration(500)} style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="film" size={48} color={Accent.primary} />
        </View>

        <Text style={styles.title}>Watchlist</Text>
        <Text style={styles.subtitle}>ใส่ PIN เพื่อเข้าใช้งาน</Text>

        <View style={styles.pinPadContainer}>
          <PinPad
            pin={pin}
            onPinChange={handlePinChange}
            onBiometric={handleBiometric}
            showBiometric={showBiometricButton}
            error={error}
          />
        </View>

        {error && <Text style={styles.errorText}>PIN ไม่ถูกต้อง</Text>}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Accent.primary + "30",
  },
  title: {
    fontSize: FontSize.xxl,
    fontFamily: FontFamily.bold,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xxl,
  },
  pinPadContainer: {
    alignItems: "center",
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.dark.error,
    marginTop: Spacing.md,
    fontFamily: FontFamily.medium,
  },
});
