import {
  Colors,
  FontFamily,
  FontSize,
  Radius,
  WatchStatusLabel,
} from "@/constants/theme";
import type { WatchStatus } from "@/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatusBadgeProps {
  status: WatchStatus;
  size?: "sm" | "md";
}

const statusColors: Record<WatchStatus, string> = {
  not_watched: Colors.dark.statusNotWatched,
  watching: Colors.dark.statusWatching,
  watched: Colors.dark.statusWatched,
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const color = statusColors[status];
  const isSm = size === "sm";

  return (
    <View
      style={[
        styles.container,
        { borderColor: color },
        isSm && styles.containerSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }, isSm && styles.textSm]}>
        {WatchStatusLabel[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  containerSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.thaiMedium,
  },
  textSm: {
    fontSize: 10,
  },
});
