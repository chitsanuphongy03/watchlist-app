import { Accent, Colors, FontFamily } from "@/constants/theme";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface AnimatedRankProps {
  rank: number;
}

export function AnimatedRank({ rank }: AnimatedRankProps) {
  const highlight = useSharedValue(0);

  useEffect(() => {
    highlight.value = 0;

    const timeout = setTimeout(() => {
      highlight.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 500 }),
      );
    }, 400);

    return () => clearTimeout(timeout);
  }, [rank, highlight]);

  const animatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      highlight.value,
      [0, 1],
      [Colors.dark.text, Accent.primary],
    );

    return {
      color,
    };
  });

  return (
    <Animated.Text style={[styles.rankText, animatedStyle]}>
      {rank}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  rankText: {
    fontSize: 30,
    fontFamily: FontFamily.heavy,
    width: 50,
    textAlign: "center",
  },
});
