import {
    Accent,
    Colors,
    FontFamily,
    FontSize,
    Radius,
    Shadow,
} from "@/constants/theme";
import type { WatchStatus } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

interface StatusToggleProps {
  status: WatchStatus;
  onStatusChange: (status: WatchStatus) => void;
  disabled?: boolean;
}

const SWITCH_HEIGHT = 56;
const PADDING = 4;

export function StatusToggle({
  status,
  onStatusChange,
  disabled,
}: StatusToggleProps) {
  const animValue = useSharedValue(status === "watched" ? 1 : 0);

  useEffect(() => {
    animValue.value = withSpring(status === "watched" ? 1 : 0, {
      mass: 0.8,
      damping: 15,
      stiffness: 120,
    });
  }, [status, animValue]);

  const handlePress = () => {
    if (disabled) return;
    const newStatus = status === "watched" ? "not_watched" : "watched";
    onStatusChange(newStatus);
  };

  const knobStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animValue.value,
      [0, 1],
      [Accent.primary, Colors.dark.success],
    );

    return {
      left: `${interpolate(animValue.value, [0, 1], [0.5, 50.5])}%`,
      backgroundColor,
    };
  });

  const textStyleLeft = useAnimatedStyle(() => {
    const color = interpolateColor(
      animValue.value,
      [0, 0.6],
      ["#FFFFFF", Colors.dark.textMuted],
    );
    return { color };
  });

  const textStyleRight = useAnimatedStyle(() => {
    const color = interpolateColor(
      animValue.value,
      [0.4, 1],
      [Colors.dark.textMuted, "#FFFFFF"],
    );
    return { color };
  });

  const iconStyleLeft = useAnimatedStyle(() => {
    const opacity = interpolate(animValue.value, [0, 0.5], [1, 0]);
    return { opacity };
  });

  const iconStyleRight = useAnimatedStyle(() => {
    const opacity = interpolate(animValue.value, [0.5, 1], [0, 1]);
    return { opacity };
  });

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={styles.container}
    >
      <View style={styles.track}>
        {/* Animated Knob */}
        <Animated.View style={[styles.knob, knobStyle]}>
          {/* Optional: Add an icon inside the knob that fades/switches? */}
        </Animated.View>

        {/* Labels Layer */}
        <View style={styles.labelsContainer}>
          {/* Left Label */}
          <View style={styles.labelWrapper}>
            <Animated.View style={[styles.iconWrapper, iconStyleLeft]}>
              <Ionicons name="list" size={16} color="#FFFFFF" />
            </Animated.View>
            <Animated.Text style={[styles.label, textStyleLeft]}>
              อยู่ในลิสต์
            </Animated.Text>
          </View>

          {/* Right Label */}
          <View style={styles.labelWrapper}>
            <Animated.Text style={[styles.label, textStyleRight]}>
              ดูแล้ว
            </Animated.Text>
            <Animated.View style={[styles.iconWrapper, iconStyleRight]}>
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            </Animated.View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SWITCH_HEIGHT,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    justifyContent: "center",
  },
  track: {
    flex: 1,
    flexDirection: "row",
    position: "relative",
  },
  knob: {
    position: "absolute",
    top: PADDING,
    bottom: PADDING,
    width: "49%",
    borderRadius: Radius.full,
    ...Shadow.md,
  },
  labelsContainer: {
    flex: 1,
    flexDirection: "row",
    zIndex: 1,
  },
  labelWrapper: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.thaiBold,
  },
  iconWrapper: {},
});
