import { EmptyState } from "@/components/empty-state";
import { WatchlistCard } from "@/components/watchlist-card";
import { Colors, FontFamily, FontSize, Spacing } from "@/constants/theme";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { WatchlistItem } from "@/types";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const { items } = useWatchlistStore();

  const historyItems = useMemo(() => {
    return items
      .filter((item) => item.status === "watched")
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [items]);

  const handleItemPress = useCallback((item: WatchlistItem) => {
    router.push({
      pathname: "/detail",
      params: { id: item.id },
    });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: WatchlistItem; index: number }) => (
      <View style={{ marginBottom: 16 }}>
        <WatchlistCard
          item={item}
          onPress={() => handleItemPress(item)}
          hideActions={true}
          hideRank={true}
        />
      </View>
    ),
    [handleItemPress],
  );

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        icon="time-outline"
        title="ยังไม่มีประวัติการรับชม"
        subtitle="เมื่อคุณดูจบแล้ว กดปุ่มเช็คถูกเพื่อย้ายมาที่นี่"
      />
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>ประวัติการรับชม</Text>
        <Text style={styles.subtitle}>
          {historyItems.length} เรื่องที่ดูจบแล้ว
        </Text>
      </View>

      <FlatList
        data={historyItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          historyItems.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.title,
    fontFamily: FontFamily.heavy,
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
