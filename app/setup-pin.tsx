/**
 * Setup PIN Screen
 * First-time PIN creation with confirmation
 */

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
import React, { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

type Step = "create" | "confirm";

export default function SetupPinScreen() {
  const [step, setStep] = useState<Step>("create");
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState(false);
  const { setupPin } = useAuthStore();

  const handlePinChange = useCallback(
    async (newPin: string) => {
      setError(false);
      setPin(newPin);

      if (newPin.length === 6) {
        if (step === "create") {
          setFirstPin(newPin);
          setPin("");
          setStep("confirm");
        } else {
          // Confirm step
          if (newPin === firstPin) {
            const success = await setupPin(newPin);
            if (success) {
              router.replace("/(tabs)");
            }
          } else {
            setError(true);
            setTimeout(() => {
              setPin("");
              setError(false);
            }, 500);
          }
        }
      }
    },
    [step, firstPin, setupPin],
  );

  const handleBack = useCallback(() => {
    if (step === "confirm") {
      setStep("create");
      setPin("");
      setFirstPin("");
      setError(false);
    }
  }, [step]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Animated.View entering={FadeIn.duration(500)} style={styles.content}>
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={40} color={Accent.primary} />
        </View>

        <Text style={styles.title}>
          {step === "create" ? "ตั้ง PIN" : "ยืนยัน PIN"}
        </Text>
        <Text style={styles.subtitle}>
          {step === "create"
            ? "ตั้ง PIN 6 หลัก เพื่อปกป้องข้อมูลของคุณ"
            : "ใส่ PIN อีกครั้งเพื่อยืนยัน"}
        </Text>

        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View
            style={[styles.stepDot, step === "confirm" && styles.stepDotActive]}
          />
        </View>

        <View style={styles.pinPadContainer}>
          <PinPad pin={pin} onPinChange={handlePinChange} error={error} />
        </View>

        {error && (
          <Text style={styles.errorText}>PIN ไม่ตรงกัน กรุณาลองใหม่</Text>
        )}

        {step === "confirm" && (
          <Animated.View entering={FadeIn}>
            <Text style={styles.backText} onPress={handleBack}>
              ← กลับไปตั้ง PIN ใหม่
            </Text>
          </Animated.View>
        )}
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
    paddingHorizontal: Spacing.xl,
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
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xxl,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.pinDot,
  },
  stepDotActive: {
    backgroundColor: Accent.primary,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: Colors.dark.border,
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
  backText: {
    fontSize: FontSize.sm,
    color: Accent.primary,
    marginTop: Spacing.lg,
    fontFamily: FontFamily.medium,
  },
});
