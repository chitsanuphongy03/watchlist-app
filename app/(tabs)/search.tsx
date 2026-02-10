import { EmptyState } from "@/components/empty-state";
import { GradientButton } from "@/components/gradient-button";
import { SearchBar } from "@/components/search-bar";
import { SearchResultCard } from "@/components/search-result-card";
import { TypeFilter } from "@/components/type-filter";
import { SEARCH_DEBOUNCE_MS } from "@/constants/api";
import {
    Accent,
    Colors,
    FontFamily,
    FontSize,
    Spacing,
} from "@/constants/theme";
import { useSearchStore } from "@/stores/search-store";
import { useUIStore } from "@/stores/ui-store";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { ContentFilter, SearchResult } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useRef } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const {
    query,
    results,
    isLoading,
    activeFilter,
    hasSearched,
    setQuery,
    setActiveFilter,
    searchAll,
    clearResults,
  } = useSearchStore();

  const { items, addItem, isInWatchlist } = useWatchlistStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (text.trim().length >= 2) {
        debounceRef.current = setTimeout(() => {
          searchAll(text);
        }, SEARCH_DEBOUNCE_MS);
      } else if (text.trim().length === 0) {
        clearResults();
      }
    },
    [setQuery, searchAll, clearResults],
  );

  const handleClear = useCallback(() => {
    clearResults();
  }, [clearResults]);

  const handleFilterChange = useCallback(
    (filter: ContentFilter) => {
      setActiveFilter(filter);
    },
    [setActiveFilter],
  );

  const { showToast } = useUIStore();

  const handleAddToWatchlist = useCallback(
    async (item: SearchResult) => {
      if (isInWatchlist(item.sourceId, item.source)) {
        showToast({ message: "เรื่องนี้อยู่ใน Watchlist แล้ว", type: "info" });
        return;
      }
      await addItem(item);
      showToast({ message: `เพิ่ม "${item.title}" แล้ว ✅`, type: "success" });
    },
    [addItem, isInWatchlist, showToast],
  );

  const handleAddCustom = useCallback(() => {
    router.push("/add-custom");
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: SearchResult; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 30).duration(200)}>
        <SearchResultCard
          item={item}
          onAdd={() => handleAddToWatchlist(item)}
        />
      </Animated.View>
    ),
    [handleAddToWatchlist],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Accent.primary} />
          <Text style={styles.loadingText}>กำลังค้นหา...</Text>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <EmptyState
          icon="search-outline"
          title="ค้นหาหนัง อนิเมะ ซีรีส์"
          subtitle="พิมพ์ชื่อเรื่องที่ต้องการค้นหา รองรับทั้งภาษาไทยและอังกฤษ"
        />
      );
    }

    return (
      <EmptyState
        icon="alert-circle-outline"
        title="ไม่พบผลลัพธ์"
        subtitle={`ไม่พบ "${query}" จาก API`}
      >
        <GradientButton
          title="เพิ่มรายการเอง"
          onPress={handleAddCustom}
          size="md"
        />
      </EmptyState>
    );
  }, [isLoading, hasSearched, query, handleAddCustom]);

  const renderFooter = useCallback(() => {
    if (!hasSearched || results.length === 0) return null;
    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>ไม่เจอเรื่องที่ต้องการ?</Text>
        <GradientButton
          title="+ เพิ่มรายการเอง"
          onPress={handleAddCustom}
          size="md"
        />
      </View>
    );
  }, [hasSearched, results.length, handleAddCustom]);

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <SearchBar
            value={query}
            onChangeText={handleQueryChange}
            onClear={handleClear}
          />
        </View>

        {/* Type Filter */}
        <TypeFilter
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Results count */}
        {hasSearched && results.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>พบ {results.length} รายการ</Text>
          </View>
        )}
      </View>
    ),
    [
      query,
      activeFilter,
      hasSearched,
      results.length,
      handleQueryChange,
      handleClear,
      handleFilterChange,
    ],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>ค้นหา</Text>
      </View>
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={items}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          results.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* FAB - Add Custom Item */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddCustom}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  titleContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchTitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.title,
    fontFamily: FontFamily.heavy,
    color: Colors.dark.text,
  },
  headerContainer: {
    paddingBottom: Spacing.sm,
  },
  searchBarContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  resultsHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  resultsCount: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
  },
  loadingContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
  },
  listContent: {
    paddingBottom: 100,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  footerContainer: {
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
  },
  fab: {
    position: "absolute",
    bottom: Spacing.xl,
    right: Spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E91E63", // Accent.primary
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 100,
  },
});
