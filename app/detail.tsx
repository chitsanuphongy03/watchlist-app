import { StatusToggle } from "@/components/status-toggle";
import {
  Accent,
  Colors,
  ContentTypeLabel,
  FontFamily,
  FontSize,
  Radius,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { SearchResult, WatchlistItem, WatchStatus } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useUIStore } from "@/stores/ui-store";

const { width } = Dimensions.get("window");
const POSTER_WIDTH = width * 0.4;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

export default function DetailScreen() {
  const { id, item: itemParam } = useLocalSearchParams<{
    id: string;
    item: string;
  }>();
  const { items, updateStatus, removeItem, addItem } = useWatchlistStore();
  const { showAlert, showToast } = useUIStore();

  const watchlistMatch = useMemo(() => {
    const exactMatch = items.find((i) => i.id === id);
    if (exactMatch) return exactMatch;

    if (itemParam) {
      try {
        const parsed: SearchResult = JSON.parse(itemParam);
        return items.find(
          (i) => i.sourceId === parsed.sourceId && i.source === parsed.source,
        );
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, [items, id, itemParam]);

  const item = useMemo(() => {
    if (watchlistMatch) return watchlistMatch;
    if (itemParam) {
      try {
        return JSON.parse(itemParam) as SearchResult;
      } catch (e) {
        console.error("Failed to parse item param", e);
        return null;
      }
    }
    return null;
  }, [watchlistMatch, itemParam]);

  const isInWatchlist = !!watchlistMatch;

  const handleStatusChange = useCallback(
    async (status: WatchStatus) => {
      if (!item || !isInWatchlist) return;
      await updateStatus(item.id, status);
      showToast({ message: "อัปเดตสถานะแล้ว", type: "success" });
    },
    [item, isInWatchlist, updateStatus, showToast],
  );

  const handleAddToWatchlist = useCallback(async () => {
    if (!item) return;
    await addItem(item as SearchResult);
    showToast({ message: `เพิ่ม "${item.title}" แล้ว `, type: "success" });
  }, [item, addItem, showToast]);

  const handleDelete = useCallback(() => {
    if (!item || !isInWatchlist) return;
    showAlert({
      title: "ลบรายการ",
      message: `ต้องการลบ "${item.title}" ออกจาก Watchlist หรือไม่?`,
      buttons: [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: async () => {
            router.back();
            setTimeout(async () => {
              await removeItem(item.id);
              showToast({ message: "ลบรายการแล้ว", type: "success" });
            }, 300);
          },
        },
      ],
    });
  }, [item, isInWatchlist, removeItem, showAlert, showToast]);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>ไม่พบรายการ</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <LinearGradient
          colors={["transparent", Colors.dark.background]}
          style={styles.headerGradient}
        />
        <View style={styles.posterWrapper}>
          {item.posterUrl ? (
            <Image
              source={{ uri: item.posterUrl }}
              style={styles.poster}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.poster, styles.posterPlaceholder]}>
              <Ionicons
                name="film-outline"
                size={48}
                color={Colors.dark.textMuted}
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        {item.titleTh && item.titleTh !== item.title && (
          <Text style={styles.titleTh}>{item.titleTh}</Text>
        )}
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>
              {ContentTypeLabel[item.type]}
            </Text>
          </View>
          {item.year && (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{item.year}</Text>
            </View>
          )}
          {item.episodes && (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{item.episodes} ตอน</Text>
            </View>
          )}
          {isInWatchlist && (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>
                อันดับ #{(item as WatchlistItem).rank || "-"}
              </Text>
            </View>
          )}
        </View>
        {isInWatchlist ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>สถานะ</Text>
            <StatusToggle
              status={(item as WatchlistItem).status}
              onStatusChange={handleStatusChange}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToWatchlist}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>เพิ่มลง Watchlist</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.overview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>เรื่องย่อ</Text>
            <Text style={styles.overview}>{item.overview}</Text>
          </View>
        )}
        {isInWatchlist && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>หมายเหตุ</Text>
            <Text style={styles.note}>
              {(item as WatchlistItem).note || "ไม่มีหมายเหตุ"}
            </Text>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ข้อมูล</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>แหล่งที่มา</Text>
            <Text style={styles.infoValue}>
              {item.source === "tmdb"
                ? "TMDB"
                : item.source === "jikan"
                  ? "MAL"
                  : "กำหนดเอง"}
            </Text>
          </View>
          {isInWatchlist && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>เพิ่มเมื่อ</Text>
              <Text style={styles.infoValue}>
                {new Date((item as WatchlistItem).addedAt).toLocaleDateString(
                  "th-TH",
                )}
              </Text>
            </View>
          )}
        </View>
        {isInWatchlist && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={Colors.dark.error}
            />
            <Text style={styles.deleteText}>ลบออกจาก Watchlist</Text>
          </TouchableOpacity>
        )}
        <View style={styles.bottomPadding} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  errorText: {
    color: Colors.dark.textMuted,
    textAlign: "center",
    marginTop: 100,
    fontSize: FontSize.md,
    fontFamily: FontFamily.thaiRegular,
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  posterWrapper: {
    ...Shadow.lg,
    borderRadius: Radius.lg,
  },
  poster: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: Radius.lg,
  },
  posterPlaceholder: {
    backgroundColor: Colors.dark.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 4,
  },
  titleTh: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.thaiRegular,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  metaChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  metaChipText: {
    fontSize: FontSize.xs,
    color: Colors.dark.textSecondary,
    fontFamily: FontFamily.medium,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.bold,
    color: Colors.dark.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  overview: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  note: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textSecondary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.border,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
  },
  infoValue: {
    fontSize: FontSize.sm,
    color: Colors.dark.textSecondary,
    fontFamily: FontFamily.medium,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Accent.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    ...Shadow.md,
  },
  addButtonText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: "#FFFFFF",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.dark.error + "40",
  },
  deleteText: {
    fontSize: FontSize.md,
    color: Colors.dark.error,
    fontFamily: FontFamily.medium,
  },
  bottomPadding: {
    height: Spacing.xxl * 2,
  },
});
