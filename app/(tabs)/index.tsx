import { EmptyState } from "@/components/empty-state";
import { NextUpCard } from "@/components/next-up-card";
import { TypeFilter } from "@/components/type-filter";
import { WatchlistCard } from "@/components/watchlist-card";
import { Colors, FontFamily, FontSize, Spacing } from "@/constants/theme";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { WatchlistItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

function SwipeableCard({
  item,
  index,
  filteredLength,
  onPress,
  onMoveUp,
  onMoveDown,
  onMarkWatched,
  onDelete,
  drag,
  isActive,
}: {
  item: WatchlistItem;
  index: number;
  filteredLength: number;
  onPress: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMarkWatched: () => void;
  onDelete: () => void;
  drag: () => void;
  isActive: boolean;
}) {
  const swipeableRef = useRef<Swipeable>(null);
  const heightAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [exitType, setExitType] = useState<"watched" | "delete" | null>(null);

  const animateExit = useCallback(
    (type: "watched" | "delete", callback: () => void) => {
      setExitType(type);

      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(heightAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start(() => {
          callback();
        });
      }, 500);
    },
    [heightAnim, fadeAnim, overlayOpacity],
  );

  const renderLeftActions = useCallback(
    (
      _progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>,
    ) => {
      const scale = dragX.interpolate({
        inputRange: [0, 80, 120],
        outputRange: [0.5, 1, 1.2],
        extrapolate: "clamp",
      });
      const opacity = dragX.interpolate({
        inputRange: [0, 60],
        outputRange: [0, 1],
        extrapolate: "clamp",
      });

      return (
        <Animated.View
          style={[styles.swipeAction, styles.swipeRight, { opacity }]}
        >
          <Animated.View
            style={{ transform: [{ scale }], alignItems: "center" }}
          >
            <View style={styles.swipeIconCircle}>
              <Ionicons name="checkmark" size={24} color="#FFF" />
            </View>
            <Text style={styles.swipeTextGreen}>ดูแล้ว</Text>
          </Animated.View>
        </Animated.View>
      );
    },
    [],
  );

  const renderRightActions = useCallback(
    (
      _progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>,
    ) => {
      const scale = dragX.interpolate({
        inputRange: [-120, -80, 0],
        outputRange: [1.2, 1, 0.5],
        extrapolate: "clamp",
      });
      const opacity = dragX.interpolate({
        inputRange: [-60, 0],
        outputRange: [1, 0],
        extrapolate: "clamp",
      });

      return (
        <Animated.View
          style={[styles.swipeAction, styles.swipeLeft, { opacity }]}
        >
          <Animated.View
            style={{ transform: [{ scale }], alignItems: "center" }}
          >
            <View style={styles.swipeIconCircleRed}>
              <Ionicons name="trash" size={22} color="#FFF" />
            </View>
            <Text style={styles.swipeTextRed}>ลบ</Text>
          </Animated.View>
        </Animated.View>
      );
    },
    [],
  );

  return (
    <ScaleDecorator activeScale={1.03}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          maxHeight: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200],
          }),
          overflow: "hidden",
        }}
      >
        <Swipeable
          ref={swipeableRef}
          renderLeftActions={renderLeftActions}
          renderRightActions={renderRightActions}
          onSwipeableOpen={(direction) => {
            swipeableRef.current?.close();
            if (direction === "left") {
              animateExit("watched", onMarkWatched);
            } else {
              animateExit("delete", onDelete);
            }
          }}
          leftThreshold={100}
          rightThreshold={100}
          overshootLeft={false}
          overshootRight={false}
          friction={1.5}
          activeOffsetX={[-5, 5]}
        >
          <WatchlistCard
            item={item}
            onPress={onPress}
            onLongPress={drag} // Trigger drag on long press
            disabled={isActive} // Disable press when dragging
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isFirst={index === 0}
            isLast={index === filteredLength - 1}
          />
        </Swipeable>

        {exitType && (
          <Animated.View
            style={[
              styles.exitOverlay,
              {
                opacity: overlayOpacity,
                backgroundColor:
                  exitType === "watched"
                    ? "rgba(48, 209, 88, 0.2)"
                    : "rgba(255, 69, 58, 0.2)",
              },
            ]}
          >
            <View
              style={[
                styles.exitIconCircle,
                {
                  backgroundColor:
                    exitType === "watched"
                      ? Colors.dark.statusWatched
                      : Colors.dark.error,
                },
              ]}
            >
              <Ionicons
                name={exitType === "watched" ? "checkmark" : "trash"}
                size={22}
                color="#FFF"
              />
            </View>
            <Text
              style={[
                styles.exitText,
                {
                  color:
                    exitType === "watched"
                      ? Colors.dark.statusWatched
                      : Colors.dark.error,
                },
              ]}
            >
              {exitType === "watched" ? "ดูแล้ว!" : "ลบแล้ว!"}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </ScaleDecorator>
  );
}

export default function HomeScreen() {
  const {
    items,
    isLoading,
    contentFilter,
    initialize,
    setContentFilter,
    moveUp,
    moveDown,
    updateStatus,
    removeItem,
    reorder,
  } = useWatchlistStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => contentFilter === "all" || item.type === contentFilter)
      .filter((item) => item.status !== "watched")
      .sort((a, b) => a.rank - b.rank);
  }, [items, contentFilter]);

  const nextItem = useMemo(() => {
    return (
      items
        .filter((item) => item.status !== "watched")
        .sort((a, b) => a.rank - b.rank)[0] || null
    );
  }, [items]);

  const handleItemPress = useCallback((item: WatchlistItem) => {
    router.push({
      pathname: "/detail",
      params: { id: item.id },
    });
  }, []);

  const renderItem = useCallback(
    ({ item, getIndex, drag, isActive }: RenderItemParams<WatchlistItem>) => {
      const index = getIndex() || 0;
      return (
        <SwipeableCard
          item={item}
          index={index}
          filteredLength={filteredItems.length}
          onPress={() => handleItemPress(item)}
          onMoveUp={() => moveUp(item.id)}
          onMoveDown={() => moveDown(item.id)}
          onMarkWatched={() => updateStatus(item.id, "watched")}
          onDelete={() => removeItem(item.id)}
          drag={drag}
          isActive={isActive}
        />
      );
    },
    [
      filteredItems.length,
      handleItemPress,
      moveUp,
      moveDown,
      updateStatus,
      removeItem,
    ],
  );

  const renderHeader = useCallback(
    () => (
      <View>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Watchlist</Text>
            <Text style={styles.itemCount}>
              {items.length} เรื่อง ·{" "}
              {items.filter((i) => i.status === "watched").length} ดูแล้ว
            </Text>
          </View>
        </View>

        {nextItem && (
          <NextUpCard
            item={nextItem}
            onPress={() => handleItemPress(nextItem)}
          />
        )}

        {items.length > 0 && (
          <TypeFilter
            activeFilter={contentFilter}
            onFilterChange={setContentFilter}
          />
        )}

        {filteredItems.length > 0 && (
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>รายการทั้งหมด</Text>
            <Text style={styles.listCount}>{filteredItems.length} เรื่อง</Text>
          </View>
        )}

        {filteredItems.length > 0 && (
          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintText}>
              กดค้างเพื่อย้าย · ปัดซ้าย/ขวาเพื่อจัดการ
            </Text>
          </View>
        )}
      </View>
    ),
    [
      items,
      nextItem,
      contentFilter,
      filteredItems.length,
      handleItemPress,
      setContentFilter,
    ],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    if (items.length === 0) {
      return (
        <EmptyState
          icon="list-outline"
          title="ยังไม่มีรายการใน Watchlist"
          subtitle="ไปที่แท็บค้นหาเพื่อเพิ่มหนัง อนิเมะ ซีรีส์ หรือโทคุซัทสึ"
        />
      );
    }

    return (
      <EmptyState
        icon="filter-outline"
        title="ไม่พบรายการ"
        subtitle="ลองเปลี่ยนตัวกรองดู"
      />
    );
  }, [isLoading, items.length]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <DraggableFlatList
        data={filteredItems}
        onDragEnd={({ data }) => reorder(data)}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        extraData={[items, contentFilter]}
        contentContainerStyle={[
          styles.listContent,
          filteredItems.length === 0 && styles.listContentEmpty,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.title,
    fontFamily: FontFamily.thaiBold,
    color: Colors.dark.text,
  },
  itemCount: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.thaiRegular,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  listTitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.thaiMedium,
    color: Colors.dark.textSecondary,
  },
  listCount: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.thaiRegular,
    color: Colors.dark.textMuted,
  },
  listContent: {
    paddingBottom: 100,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  swipeHint: {
    alignItems: "center",
    paddingBottom: Spacing.xs,
  },
  swipeHintText: {
    fontSize: 10,
    fontFamily: FontFamily.thaiRegular,
    color: Colors.dark.textMuted,
    opacity: 0.6,
  },

  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
  swipeRight: {
    backgroundColor: "rgba(48, 209, 88, 0.15)",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  swipeLeft: {
    backgroundColor: "rgba(255, 69, 58, 0.15)",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  swipeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.statusWatched,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  swipeIconCircleRed: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.error,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  swipeTextGreen: {
    fontSize: 11,
    fontFamily: FontFamily.thaiSemiBold,
    color: Colors.dark.statusWatched,
  },
  swipeTextRed: {
    fontSize: 11,
    fontFamily: FontFamily.thaiSemiBold,
    color: Colors.dark.error,
  },

  exitOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  exitIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  exitText: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.thaiBold,
  },
});
