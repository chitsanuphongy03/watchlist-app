import { Colors, FontFamily } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_WIDTH = SCREEN_WIDTH - 32; // 16px margin each side
const TAB_BAR_HEIGHT = 64;

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  index: { active: "list", inactive: "list-outline" },
  search: { active: "search", inactive: "search-outline" },
  history: { active: "time", inactive: "time-outline" },
  settings: { active: "settings", inactive: "settings-outline" },
};

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const tabCount = state.routes.length;
  const tabWidth = TAB_BAR_WIDTH / tabCount;

  // Animated pill indicator position
  const indicatorAnim = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: state.index,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [state.index, indicatorAnim]);

  const indicatorTranslateX = indicatorAnim.interpolate({
    inputRange: state.routes.map((_, i) => i),
    outputRange: state.routes.map((_, i) => i * tabWidth + 4),
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Animated pill indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: tabWidth - 8,
              transform: [{ translateX: indicatorTranslateX }],
            },
          ]}
        />

        {/* Tab items */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;

          const iconConfig = TAB_ICONS[route.name] || {
            active: "ellipse",
            inactive: "ellipse-outline",
          };
          const iconName = isFocused ? iconConfig.active : iconConfig.inactive;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              if (Platform.OS === "ios") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <Ionicons
                name={iconName as any}
                size={22}
                color={isFocused ? Colors.dark.text : Colors.dark.textMuted}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? Colors.dark.text : Colors.dark.textMuted,
                    fontFamily: isFocused
                      ? FontFamily.thaiSemiBold
                      : FontFamily.thaiRegular,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    width: TAB_BAR_WIDTH,
    height: TAB_BAR_HEIGHT,
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    alignItems: "center",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    // Subtle border
    borderWidth: 0.5,
    borderColor: Colors.dark.border,
  },
  indicator: {
    position: "absolute",
    height: TAB_BAR_HEIGHT - 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: 6,
    left: 0,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 3,
  },
  label: {
    fontSize: 10,
  },
});
