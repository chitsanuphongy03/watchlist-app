import { Colors, FontFamily, FontSize, Spacing } from "@/constants/theme";
import type { SearchResult } from "@/types";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { PosterCard } from "./poster-card";

interface DiscoverySectionProps {
  title: string;
  data: SearchResult[];
  onDetailPress: (item: SearchResult) => void;
}

export function DiscoverySection({
  title,
  data,
  onDetailPress,
}: DiscoverySectionProps) {
  if (data.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <PosterCard item={item} onPress={() => onDetailPress(item)} />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.thaiBold,
    color: Colors.dark.text,
    marginLeft: Spacing.md,
    marginBottom: Spacing.sm,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: Spacing.md,
  },
});
