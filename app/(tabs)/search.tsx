import { DiscoverySection } from "@/components/discovery-section";
import { EmptyState } from "@/components/empty-state";
import { GradientButton } from "@/components/gradient-button";
import { SearchBar } from "@/components/search-bar";
import { SearchResultCard } from "@/components/search-result-card";
import {
    DiscoverySectionSkeleton,
    SearchResultCardSkeleton,
} from "@/components/skeleton";
import { TypeFilter } from "@/components/type-filter";

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
import React, { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface SearchHeaderProps {
  query: string;
  activeFilter: ContentFilter;
  hasSearched: boolean;
  resultsLength: number;
  onQueryChange: (text: string) => void;
  onClear: () => void;
  onFilterChange: (filter: ContentFilter) => void;
}

const SearchHeader = React.memo(
  ({
    query,
    activeFilter,
    hasSearched,
    resultsLength,
    onQueryChange,
    onClear,
    onFilterChange,
  }: SearchHeaderProps) => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.searchBarContainer}>
          <SearchBar
            value={query}
            onChangeText={onQueryChange}
            onClear={onClear}
          />
        </View>

        <TypeFilter
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
        />

        {hasSearched && resultsLength > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>พบ {resultsLength} รายการ</Text>
          </View>
        )}
      </View>
    );
  },
);
SearchHeader.displayName = "SearchHeader";

// Loading skeletons for different states
function SearchLoading() {
  return (
    <View style={styles.loadingContainer}>
      {Array.from({ length: 5 }).map((_, i) => (
        <SearchResultCardSkeleton key={i} />
      ))}
    </View>
  );
}

function DiscoveryLoading() {
  return (
    <View style={styles.discoveryContainer}>
      {Array.from({ length: 4 }).map((_, i) => (
        <DiscoverySectionSkeleton key={i} />
      ))}
    </View>
  );
}

export default function SearchScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const query = useSearchStore(useCallback((s) => s.query, []));
  const results = useSearchStore(useCallback((s) => s.results, []));
  const isLoading = useSearchStore(useCallback((s) => s.isLoading, []));
  const activeFilter = useSearchStore(useCallback((s) => s.activeFilter, []));
  const hasSearched = useSearchStore(useCallback((s) => s.hasSearched, []));
  const discovery = useSearchStore(useCallback((s) => s.discovery, []));
  const isDiscoveryLoading = useSearchStore(
    useCallback((s) => s.isDiscoveryLoading, []),
  );
  const setActiveFilter = useSearchStore(
    useCallback((s) => s.setActiveFilter, []),
  );
  const debouncedSearch = useSearchStore(
    useCallback((s) => s.debouncedSearch, []),
  );
  const clearResults = useSearchStore(useCallback((s) => s.clearResults, []));
  const fetchDiscovery = useSearchStore(
    useCallback((s) => s.fetchDiscovery, []),
  );

  const items = useWatchlistStore(useCallback((state) => state.items, []));
  const addItem = useWatchlistStore(useCallback((state) => state.addItem, []));
  const isInWatchlist = useCallback(
    (sourceId: string, source: string) =>
      items.some((i) => i.sourceId === sourceId && i.source === source),
    [items],
  );

  useEffect(() => {
    fetchDiscovery();
  }, [fetchDiscovery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDiscovery(true);
    setRefreshing(false);
  }, [fetchDiscovery]);

  const handleQueryChange = useCallback(
    (text: string) => {
      if (text.trim().length === 0) {
        clearResults();
      } else {
        debouncedSearch(text);
      }
    },
    [debouncedSearch, clearResults],
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

  const showToast = useUIStore(useCallback((s) => s.showToast, []));

  const handleAddToWatchlist = useCallback(
    async (item: SearchResult) => {
      if (isInWatchlist(item.sourceId, item.source)) {
        showToast({ message: "เรื่องนี้อยู่ใน Watchlist แล้ว", type: "info" });
        return;
      }
      await addItem(item);
      showToast({ message: `เพิ่ม "${item.title}" แล้ว `, type: "success" });
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

  const handleDetailPress = useCallback((item: SearchResult) => {
    router.push({
      pathname: "/detail",
      params: {
        sourceId: item.sourceId,
        source: item.source,
        type: item.type,
      },
    });
  }, []);

  const renderContent = useCallback(() => {
    if (isLoading) {
      return <SearchLoading />;
    }

    if (!hasSearched) {
      if (isDiscoveryLoading) {
        return <DiscoveryLoading />;
      }

      // Filter discovery sections based on activeFilter
      const showMovies = activeFilter === "all" || activeFilter === "movie";
      const showAnime = activeFilter === "all" || activeFilter === "anime";
      const showSeries = activeFilter === "all" || activeFilter === "series";
      const showTokusatsu =
        activeFilter === "all" || activeFilter === "tokusatsu";

      // Check if any section will be shown
      const hasVisibleSections =
        showMovies || showAnime || showSeries || showTokusatsu;

      return (
        <View style={styles.discoveryContainer}>
          {showMovies && (
            <DiscoverySection
              title="หนังน่าดู (Now Playing)"
              data={discovery.movies}
              onDetailPress={handleDetailPress}
            />
          )}
          {showAnime && (
            <DiscoverySection
              title="อนิเมะซีซั่นนี้ (Season Now)"
              data={discovery.anime}
              onDetailPress={handleDetailPress}
            />
          )}
          {showSeries && (
            <DiscoverySection
              title="ซีรีส์มาใหม่ (On The Air)"
              data={discovery.series}
              onDetailPress={handleDetailPress}
            />
          )}
          {showTokusatsu && (
            <DiscoverySection
              title="โทคุซัทสึ"
              data={discovery.tokusatsu}
              onDetailPress={handleDetailPress}
            />
          )}
          {!hasVisibleSections && (
            <EmptyState
              icon="filter-outline"
              title="ไม่มีรายการในหมวดหมู่นี้"
              subtitle="ลองเลือกหมวดหมู่อื่น"
            />
          )}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>ไม่เจอเรื่องที่ต้องการ?</Text>
            <GradientButton
              title="+ เพิ่มรายการเอง"
              onPress={handleAddCustom}
              size="md"
            />
          </View>
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <EmptyState
          icon="search-outline"
          title="ไม่พบผลลัพธ์"
          subtitle={`ไม่พบ "${query}" จากแหล่งข้อมูล`}
        >
          <GradientButton
            title="เพิ่มรายการเอง"
            onPress={handleAddCustom}
            size="md"
          />
        </EmptyState>
      );
    }

    return null;
  }, [
    isLoading,
    hasSearched,
    results.length,
    isDiscoveryLoading,
    discovery.movies,
    discovery.anime,
    discovery.series,
    discovery.tokusatsu,
    handleDetailPress,
    handleAddCustom,
    query,
    activeFilter,
  ]);

  const renderFooter = useCallback(() => {
    if (hasSearched && results.length > 0) {
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
    }
    return null;
  }, [hasSearched, results.length, handleAddCustom]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>ค้นหา</Text>
      </View>
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={[items, activeFilter]}
        ListHeaderComponent={
          <SearchHeader
            query={query}
            activeFilter={activeFilter}
            hasSearched={hasSearched}
            resultsLength={results.length}
            onQueryChange={handleQueryChange}
            onClear={handleClear}
            onFilterChange={handleFilterChange}
          />
        }
        ListEmptyComponent={renderContent}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          !hasSearched && styles.listContentDiscovery,
          hasSearched && results.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Accent.primary}
            colors={[Accent.primary]}
          />
        }
      />

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
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  listContent: {
    paddingBottom: 100,
  },
  listContentDiscovery: {
    paddingBottom: 100,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  discoveryContainer: {
    marginTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  footerContainer: {
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
  },
  fab: {
    position: "absolute",
    bottom: 110,
    right: Spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Accent.primary,
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
