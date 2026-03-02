import { Colors, Radius, Spacing } from "@/constants/theme";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  colors?: [string, string];
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = Radius.sm,
  colors = [Colors.dark.surface, "#2C2C2E"],
}: SkeletonProps) {
  const shimmerTranslateX = useSharedValue(-100);

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(100, {
        duration: 1500,
        easing: Easing.ease,
      }),
      -1,
      false
    );
  }, [shimmerTranslateX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${shimmerTranslateX.value}%` }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors[0],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          shimmerStyle,
          {
            backgroundColor: colors[1],
          },
        ]}
      />
    </View>
  );
}

// Pre-built skeleton layouts for common components

export function WatchlistCardSkeleton() {
  return (
    <View style={cardStyles.container}>
      <Skeleton width={60} height={90} borderRadius={Radius.md} />
      <View style={cardStyles.content}>
        <Skeleton width="70%" height={18} />
        <Skeleton width="40%" height={14} />
        <View style={cardStyles.badge}>
          <Skeleton width={80} height={22} borderRadius={Radius.full} />
        </View>
      </View>
    </View>
  );
}

export function SearchResultCardSkeleton() {
  return (
    <View style={searchStyles.container}>
      <Skeleton width={70} height={100} borderRadius={Radius.sm} />
      <View style={searchStyles.content}>
        <Skeleton width="80%" height={18} />
        <Skeleton width="50%" height={14} />
        <Skeleton width="90%" height={32} />
      </View>
      <Skeleton width={32} height={32} borderRadius={16} />
    </View>
  );
}

export function PosterCardSkeleton() {
  return (
    <View style={posterStyles.container}>
      <Skeleton width={110} height={160} borderRadius={Radius.sm} />
      <View style={posterStyles.title}>
        <Skeleton width={100} height={14} />
      </View>
    </View>
  );
}

export function DiscoverySectionSkeleton() {
  return (
    <View style={sectionStyles.container}>
      <Skeleton width={200} height={24} />
      <View style={sectionStyles.row}>
        <PosterCardSkeleton />
        <PosterCardSkeleton />
        <PosterCardSkeleton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  shimmer: {
    width: "30%",
    height: "100%",
    opacity: 0.5,
  },
});

const cardStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  badge: {
    marginTop: 4,
  },
});

const searchStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  content: {
    flex: 1,
    gap: 6,
  },
});

const posterStyles = StyleSheet.create({
  container: {
    width: 110,
    marginRight: 8,
  },
  title: {
    marginTop: 4,
    alignItems: "center",
  },
});

const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  row: {
    flexDirection: "row",
    marginTop: Spacing.sm,
  },
});
