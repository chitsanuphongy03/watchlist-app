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

  // Trigger smooth highlight & scale only if rank settles
  useEffect(() => {
    highlight.value = 0; // Reset

    const timeout = setTimeout(() => {
      // Gentle Pulse: Highlight (0 -> 1 -> 0)
      highlight.value = withSequence(
        withTiming(1, { duration: 200 }), // Flash & Scale Up slightly
        withTiming(0, { duration: 500 }), // Fade & Scale Down slowly
      );
    }, 400);

    return () => clearTimeout(timeout);
  }, [rank, highlight]);

  const animatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      highlight.value,
      [0, 1],
      [Accent.primary, Colors.dark.text], // Standard -> Highlight White/Text
    );

    // Subtle scale: 1 -> 1.15
    const scale = 1 + highlight.value * 0.15;

    return {
      color,
      transform: [{ scale }],
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
    fontSize: 30, // Bigger!
    fontFamily: FontFamily.heavy,
    width: 50, // Wider for 3 digits
    textAlign: "center",
    // color handled by animated style
  },
});
