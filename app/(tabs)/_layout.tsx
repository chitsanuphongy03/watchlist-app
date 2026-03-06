import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { useCallback } from "react";

import { FloatingTabBar } from "@/components/floating-tab-bar";

export default function TabLayout() {
  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => <FloatingTabBar {...props} />,
    [],
  );

  const renderTabBarBackground = useCallback(() => null, []);

  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
        tabBarBackground: renderTabBarBackground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Watchlist",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "ค้นหา",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "ประวัติ",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "ตั้งค่า",
        }}
      />
    </Tabs>
  );
}
