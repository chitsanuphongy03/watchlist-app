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
import type { SearchResult } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SearchResultCardProps {
  item: SearchResult;
  onPress?: () => void;
  onAdd?: () => void;
}

export function SearchResultCard({
  item,
  onPress,
  onAdd,
}: SearchResultCardProps) {
  const isInWatchlist = useWatchlistStore((state) =>
    state.items.some(
      (i) => i.sourceId === item.sourceId && i.source === item.source,
    ),
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.posterContainer}>
        {item.posterUrl ? (
          <Image
            source={{ uri: item.posterUrl }}
            style={styles.poster}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Ionicons
              name="image-outline"
              size={28}
              color={Colors.dark.textMuted}
            />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        {item.titleTh && item.titleTh !== item.title && (
          <Text style={styles.titleTh} numberOfLines={1}>
            {item.titleTh}
          </Text>
        )}
        <View style={styles.meta}>
          <Text style={styles.type}>{ContentTypeLabel[item.type]}</Text>
          {item.year && <Text style={styles.year}>· {item.year}</Text>}
          {item.episodes && (
            <Text style={styles.year}>· {item.episodes} ตอน</Text>
          )}
        </View>
        {item.overview && (
          <Text style={styles.overview} numberOfLines={2}>
            {item.overview}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.addButton, isInWatchlist && styles.addButtonDisabled]}
        onPress={onAdd}
        disabled={isInWatchlist}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={isInWatchlist ? "checkmark-circle" : "add-circle"}
          size={32}
          color={isInWatchlist ? Colors.dark.success : Accent.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    ...Shadow.sm,
  },
  posterContainer: {
    width: 70,
    height: 100,
    borderRadius: Radius.sm,
    overflow: "hidden",
    marginRight: Spacing.sm,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  posterPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.dark.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.thaiSemiBold,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  titleTh: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.thaiRegular,
    color: Colors.dark.textSecondary,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  type: {
    fontSize: FontSize.xs,
    color: Accent.primary,
    fontFamily: FontFamily.medium,
  },
  year: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
  },
  overview: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
    lineHeight: 16,
  },
  addButton: {
    marginLeft: Spacing.sm,
  },
  addButtonDisabled: {
    opacity: 0.8,
  },
});
