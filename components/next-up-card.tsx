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
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NextUpCardProps {
  item: WatchlistItem;
  onPress?: () => void;
}

export function NextUpCard({ item, onPress }: NextUpCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Background with Blur */}
      {item.posterUrl && (
        <Image
          source={{ uri: item.posterUrl }}
          style={StyleSheet.absoluteFill}
          blurRadius={30}
          contentFit="cover"
        />
      )}
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)", "rgba(0,0,0,0.95)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.body}>
          {/* Main Poster */}
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
                  size={32}
                  color={Colors.dark.textMuted}
                />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.info}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="play" size={12} color="#FFF" />
                <Text style={styles.badgeText}>กำลังดู</Text>
              </View>
              <Text style={styles.rank}>#{item.rank}</Text>
            </View>

            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.type}>{ContentTypeLabel[item.type]}</Text>
              {item.year && <Text style={styles.metaText}> • {item.year}</Text>}
            </View>
            {item.overview && (
              <Text style={styles.overview} numberOfLines={2}>
                {item.overview}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: Radius.xl,
    overflow: "hidden",
    ...Shadow.glow,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Accent.primary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    color: "#FFF",
    letterSpacing: 1,
  },
  rank: {
    fontSize: 14,
    fontFamily: FontFamily.heavy,
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic",
  },
  body: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-end",
  },
  posterContainer: {
    width: 90,
    height: 135,
    borderRadius: Radius.md,
    overflow: "hidden",
    ...Shadow.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
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
    gap: 6,
    paddingBottom: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: "#FFF",
    lineHeight: 24,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  type: {
    fontSize: FontSize.xs,
    color: Accent.primary,
    fontFamily: FontFamily.bold,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  metaText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: "rgba(255,255,255,0.7)",
  },
  overview: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 16,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  playText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: "#FFF",
  },
});
