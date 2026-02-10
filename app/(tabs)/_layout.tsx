import { Tabs } from "expo-router";
import React from "react";

import { FloatingTabBar } from "@/components/floating-tab-bar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
        tabBarBackground: () => null,
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
