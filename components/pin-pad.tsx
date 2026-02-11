import {
    Accent,
    Colors,
    FontFamily,
    FontSize,
    Radius,
    Spacing,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const BUTTON_SIZE = Math.min((width - Spacing.xl * 4) / 3, 72);

interface PinPadProps {
  pin: string;
  maxLength?: number;
  onPinChange: (pin: string) => void;
  onBiometric?: () => void;
  showBiometric?: boolean;
  error?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function PinPad({
  pin,
  maxLength = 6,
  onPinChange,
  onBiometric,
  showBiometric = false,
  error = false,
}: PinPadProps) {
  const shakeX = useSharedValue(0);

  React.useEffect(() => {
    if (error) {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [error, shakeX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handlePress = useCallback(
    (num: string) => {
      if (pin.length < maxLength) {
        onPinChange(pin + num);
      }
    },
    [pin, maxLength, onPinChange],
  );

  const handleDelete = useCallback(() => {
    onPinChange(pin.slice(0, -1));
  }, [pin, onPinChange]);

  const renderDots = () => {
    return (
      <AnimatedView style={[styles.dotsContainer, shakeStyle]}>
        {Array.from({ length: maxLength }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < pin.length && styles.dotFilled,
              error && i < pin.length && styles.dotError,
            ]}
          />
        ))}
      </AnimatedView>
    );
  };

  const renderButton = (
    value: string | "delete" | "biometric",
    key: string,
  ) => {
    if (value === "delete") {
      return (
        <TouchableOpacity
          key={key}
          style={styles.button}
          onPress={handleDelete}
          activeOpacity={0.6}
        >
          <Ionicons
            name="backspace-outline"
            size={28}
            color={Colors.dark.text}
          />
        </TouchableOpacity>
      );
    }

    if (value === "biometric") {
      if (!showBiometric) {
        return (
          <View
            key={key}
            style={[styles.button, { opacity: 0, borderWidth: 0 }]}
          />
        );
      }
      return (
        <TouchableOpacity
          key={key}
          style={styles.button}
          onPress={onBiometric}
          activeOpacity={0.6}
        >
          <Ionicons name="finger-print" size={32} color={Accent.primary} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={key}
        style={styles.button}
        onPress={() => handlePress(value)}
        activeOpacity={0.6}
      >
        <Text style={styles.buttonText}>{value}</Text>
      </TouchableOpacity>
    );
  };

  const rows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["biometric", "0", "delete"],
  ];

  return (
    <View style={styles.container}>
      {renderDots()}
      <View style={styles.pad}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((value, colIndex) =>
              renderButton(
                value as string | "delete" | "biometric",
                `${rowIndex}-${colIndex}`,
              ),
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.dark.pinDot,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  dotFilled: {
    backgroundColor: Accent.primary,
    borderColor: Accent.primary,
  },
  dotError: {
    backgroundColor: Colors.dark.error,
    borderColor: Colors.dark.error,
  },
  pad: {
    alignItems: "center",
    gap: Spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  buttonText: {
    fontSize: FontSize.xxl,
    fontFamily: FontFamily.semibold,
    color: Colors.dark.text,
  },
});
