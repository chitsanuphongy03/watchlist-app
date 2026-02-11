import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface AnimatedSplashProps {
  onAnimationFinish: () => void;
  isAppReady: boolean;
}

export function AnimatedSplash({
  onAnimationFinish,
  isAppReady,
}: AnimatedSplashProps) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const startAnimation = React.useCallback(() => {
    const hideSplash = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await SplashScreen.hideAsync();
      } catch {}

      scale.value = withTiming(20, { duration: 1000 });
      opacity.value = withTiming(0, { duration: 1000 }, (finished) => {
        if (finished) {
          runOnJS(onAnimationFinish)();
        }
      });
    };

    hideSplash();
  }, [onAnimationFinish, opacity, scale]);

  useEffect(() => {
    if (isAppReady) {
      startAnimation();
    }
  }, [isAppReady, startAnimation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={styles.image}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dark.background,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
  },
  imageContainer: {
    width: 200,
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
