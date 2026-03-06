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
import { useQuery } from "@tanstack/react-query";

import {
    Accent,
    Colors,
    FontFamily,
    FontSize,
    Spacing,
} from "@/constants/theme";
import { getSeasonNowAnime, searchAnime } from "@/services/jikan";
import {
    getNowPlayingMovies,
    getOnTheAirSeries,
    searchMovies,
    searchSeries,
    searchTokusatsu,
    searchAll as tmdbSearchAll,
} from "@/services/tmdb";
import { useSearchStore } from "@/stores/search-store";
import { useUIStore } from "@/stores/ui-store";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { ContentFilter, SearchResult } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
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

  // Zustand UI State (Sync)
  const query = useSearchStore(useCallback((s) => s.query, []));
  const activeFilter = useSearchStore(useCallback((s) => s.activeFilter, []));
  const debouncedQuery = useSearchStore(
    useCallback((s) => s.debouncedQuery, []),
  );
  const setQuery = useSearchStore(useCallback((s) => s.setQuery, []));
  const setActiveFilter = useSearchStore(
    useCallback((s) => s.setActiveFilter, []),
  );
  const debouncedSearch = useSearchStore(
    useCallback((s) => s.debouncedSearch, []),
  );
  const clearQuery = useSearchStore(useCallback((s) => s.clearQuery, []));
  const showToast = useUIStore(useCallback((s) => s.showToast, []));

  const items = useWatchlistStore(useCallback((state) => state.items, []));
  const addItem = useWatchlistStore(useCallback((state) => state.addItem, []));
  const isInWatchlist = useCallback(
    (sourceId: string, source: string) =>
      items.some((i) => i.sourceId === sourceId && i.source === source),
    [items],
  );

  const hasSearched = debouncedQuery.trim().length >= 2;

  // --- React Query for Discovery ---
  const {
    data: moviesData = [],
    isLoading: isMoviesLoading,
    refetch: refetchMovies,
  } = useQuery({
    queryKey: ["discovery", "movies"],
    queryFn: getNowPlayingMovies,
  });

  const {
    data: seriesData = [],
    isLoading: isSeriesLoading,
    refetch: refetchSeries,
  } = useQuery({
    queryKey: ["discovery", "series"],
    queryFn: getOnTheAirSeries,
  });

  const {
    data: animeData = [],
    isLoading: isAnimeLoading,
    refetch: refetchAnime,
  } = useQuery({
    queryKey: ["discovery", "anime"],
    queryFn: getSeasonNowAnime,
  });

  const {
    data: tokusatsuData = [],
    isLoading: isTokusatsuLoading,
    refetch: refetchTokusatsu,
  } = useQuery({
    queryKey: ["discovery", "tokusatsu"],
    queryFn: searchTokusatsu,
  });

  const isDiscoveryLoading =
    isMoviesLoading || isSeriesLoading || isAnimeLoading || isTokusatsuLoading;

  // --- React Query for Search ---
  const fetchSearchResults = async (q: string, filter: ContentFilter) => {
    let freshResults: SearchResult[] = [];
    switch (filter) {
      case "movie":
        freshResults = await searchMovies(q);
        break;
      case "anime":
        freshResults = await searchAnime(q);
        break;
      case "series":
        freshResults = await searchSeries(q, "series");
        break;
      case "tokusatsu":
        freshResults = await searchSeries(q, "tokusatsu");
        break;
      case "all":
      default: {
        const [tmdbResults, animeResults] = await Promise.all([
          tmdbSearchAll(q),
          searchAnime(q),
        ]);
        freshResults = [...tmdbResults, ...animeResults];
        break;
      }
    }

    const seen = new Set<string>();
    return freshResults.filter((item) => {
      const key = `${item.title.toLowerCase()}_${item.year}_${item.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const { data: searchResults = [], isFetching: isSearchLoading } = useQuery({
    queryKey: ["search", debouncedQuery, activeFilter],
    queryFn: () => fetchSearchResults(debouncedQuery, activeFilter),
    enabled: debouncedQuery.trim().length >= 2,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchMovies(),
      refetchSeries(),
      refetchAnime(),
      refetchTokusatsu(),
    ]);
    setRefreshing(false);
  }, [refetchMovies, refetchSeries, refetchAnime, refetchTokusatsu]);

  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (text.trim().length === 0) {
        clearQuery();
      } else {
        debouncedSearch(text);
      }
    },
    [setQuery, debouncedSearch, clearQuery],
  );

  const handleClear = useCallback(() => {
    clearQuery();
  }, [clearQuery]);

  const handleFilterChange = useCallback(
    (filter: ContentFilter) => {
      setActiveFilter(filter);
    },
    [setActiveFilter],
  );

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
      params: { sourceId: item.sourceId, source: item.source, type: item.type },
    });
  }, []);

  const renderContent = useCallback(() => {
    if (isSearchLoading && hasSearched) {
      return <SearchLoading />;
    }

    if (!hasSearched) {
      if (isDiscoveryLoading) return <DiscoveryLoading />;

      const showMovies = activeFilter === "all" || activeFilter === "movie";
      const showAnime = activeFilter === "all" || activeFilter === "anime";
      const showSeries = activeFilter === "all" || activeFilter === "series";
      const showTokusatsu =
        activeFilter === "all" || activeFilter === "tokusatsu";

      const hasVisibleSections =
        showMovies || showAnime || showSeries || showTokusatsu;

      return (
        <View style={styles.discoveryContainer}>
          {showMovies && (
            <DiscoverySection
              title="หนังน่าดู (Now Playing)"
              data={moviesData}
              onDetailPress={handleDetailPress}
            />
          )}
          {showAnime && (
            <DiscoverySection
              title="อนิเมะซีซั่นนี้ (Season Now)"
              data={animeData}
              onDetailPress={handleDetailPress}
            />
          )}
          {showSeries && (
            <DiscoverySection
              title="ซีรีส์มาใหม่ (On The Air)"
              data={seriesData}
              onDetailPress={handleDetailPress}
            />
          )}
          {showTokusatsu && (
            <DiscoverySection
              title="โทคุซัทสึ"
              data={tokusatsuData}
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

    if (searchResults.length === 0) {
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
    isSearchLoading,
    hasSearched,
    searchResults.length,
    isDiscoveryLoading,
    moviesData,
    animeData,
    seriesData,
    tokusatsuData,
    handleDetailPress,
    handleAddCustom,
    query,
    activeFilter,
  ]);

  const renderFooter = useCallback(() => {
    if (hasSearched && searchResults.length > 0 && !isSearchLoading) {
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
  }, [hasSearched, searchResults.length, handleAddCustom, isSearchLoading]);

  // Use flatlist items only if searched and NOT loading
  const listData = hasSearched && !isSearchLoading ? searchResults : [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>ค้นหา</Text>
      </View>
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={[items, activeFilter]}
        ListHeaderComponent={
          <SearchHeader
            query={query}
            activeFilter={activeFilter}
            hasSearched={hasSearched}
            resultsLength={listData.length}
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
          hasSearched && listData.length === 0 && styles.listContentEmpty,
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
  container: { flex: 1, backgroundColor: Colors.dark.background },
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
  headerContainer: { paddingBottom: Spacing.sm },
  searchBarContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  resultsHeader: { paddingHorizontal: Spacing.md, paddingTop: Spacing.xs },
  resultsCount: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
  },
  loadingContainer: { paddingTop: Spacing.md, gap: Spacing.sm },
  listContent: { paddingBottom: 100 },
  listContentDiscovery: { paddingBottom: 100 },
  listContentEmpty: { flexGrow: 1 },
  discoveryContainer: { marginTop: Spacing.sm, paddingBottom: Spacing.xl },
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
