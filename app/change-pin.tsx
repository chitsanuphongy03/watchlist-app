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

type Step = "verify" | "create" | "confirm";

export default function ChangePinScreen() {
  const [step, setStep] = useState<Step>("verify");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { verifyPin, setupPin } = useAuthStore();

  const handlePinChange = useCallback(
    async (input: string) => {
      setError(false);
      setPin(input);

      if (input.length === 6) {
        if (step === "verify") {
          const isValid = await verifyPin(input);
          if (isValid) {
            setStep("create");
            setPin("");
          } else {
            setError(true);
            setErrorMessage("PIN เดิมไม่ถูกต้อง");
            setTimeout(() => {
              setPin("");
              setError(false);
            }, 500);
          }
        } else if (step === "create") {
          setNewPin(input);
          setPin("");
          setStep("confirm");
        } else if (step === "confirm") {
          if (input === newPin) {
            const success = await setupPin(input);
            if (success) {
              router.back();
            }
          } else {
            setError(true);
            setErrorMessage("PIN ไม่ตรงกัน กรุณาลองใหม่");
            setTimeout(() => {
              setPin("");
              setError(false);
              setPin("");
              setError(false);
            }, 500);
          }
        }
      }
    },
    [step, newPin, verifyPin, setupPin],
  );

  const handleBack = useCallback(() => {
    if (step === "confirm") {
      setStep("create");
      setPin("");
      setNewPin("");
      setError(false);
    } else if (step === "create") {
      setStep("verify");
      setPin("");
      setError(false);
    } else {
      router.back();
    }
  }, [step]);

  const getTitle = () => {
    switch (step) {
      case "verify":
        return "ใส่ PIN เดิม";
      case "create":
        return "ตั้ง PIN ใหม่";
      case "confirm":
        return "ยืนยัน PIN ใหม่";
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case "verify":
        return "เพื่อยืนยันว่าเป็นคุณ";
      case "create":
        return "กรุณาใส่ PIN 6 หลักใหม่";
      case "confirm":
        return "ใส่ PIN ใหม่อีกครั้งเพื่อยืนยัน";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
        </Text>
      </View>

      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.content}
        key={step}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={step === "verify" ? "lock-open" : "key"}
            size={40}
            color={Accent.primary}
          />
        </View>

        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>

        <Text style={styles.subtitle}>{getSubtitle()}</Text>
        <View style={styles.stepIndicator}>
          <View
            style={[styles.stepDot, step === "verify" && styles.stepDotActive]}
          />
          <View style={styles.stepLine} />
          <View
            style={[styles.stepDot, step === "create" && styles.stepDotActive]}
          />
          <View style={styles.stepLine} />
          <View
            style={[styles.stepDot, step === "confirm" && styles.stepDotActive]}
          />
        </View>

        <View style={styles.pinPadContainer}>
          <PinPad pin={pin} onPinChange={handlePinChange} error={error} />
        </View>

        {error && <Text style={styles.errorText}>{errorMessage}</Text>}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginTop: -Spacing.xl,
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
    width: 20,
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
});
