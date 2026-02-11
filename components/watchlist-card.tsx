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
import type { WatchlistItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { AnimatedRank } from "./animated-rank";
import { StatusBadge } from "./status-badge";

interface WatchlistCardProps {
  item: WatchlistItem;
  onPress?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  onLongPress?: () => void;
  disabled?: boolean;
}

export function WatchlistCard({
  item,
  onPress,
  onLongPress,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  disabled = false,
  hideActions = false,
  hideRank = false,
}: WatchlistCardProps & { hideActions?: boolean; hideRank?: boolean }) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        item.status === "watched" && styles.containerWatched,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {!hideRank && <AnimatedRank rank={item.rank} />}

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
              name="film-outline"
              size={24}
              color={Colors.dark.textMuted}
            />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.metaRow}>
          {item.type && (
            <Text style={styles.type}>{ContentTypeLabel[item.type]}</Text>
          )}
          {item.year && <Text style={styles.metaText}> • {item.year}</Text>}
        </View>

        <StatusBadge status={item.status} />
      </View>

      {!hideActions && (
        <TouchableOpacity
          onLongPress={onLongPress}
          delayLongPress={100}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={styles.actions}
          disabled={disabled}
        >
          <Ionicons
            name="menu-outline"
            size={24}
            color={Colors.dark.textSecondary}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    backgroundColor: "#1C1C1E",
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
  containerWatched: {},
  posterContainer: {
    width: 60,
    height: 90,
    borderRadius: Radius.md,
    overflow: "hidden",
    marginRight: Spacing.md,
    ...Shadow.sm,
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
    gap: 4,
    justifyContent: "center",
  },
  title: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.thaiBold,
    color: Colors.dark.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  type: {
    fontSize: FontSize.xs,
    color: Accent.primary,
    fontFamily: FontFamily.medium,
  },
  metaText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
  },
  actions: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: 30,
  },
  actionBtn: {
    padding: 2,
  },
});
