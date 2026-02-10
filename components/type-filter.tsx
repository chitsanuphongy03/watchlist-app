import {
    Accent,
    Colors,
    ContentTypeLabel,
    FontFamily,
    FontSize,
    Radius,
    Spacing,
} from "@/constants/theme";
import type { ContentFilter } from "@/types";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

interface TypeFilterProps {
  activeFilter: ContentFilter;
  onFilterChange: (filter: ContentFilter) => void;
  showAll?: boolean;
}

const FILTERS: ContentFilter[] = [
  "all",
  "anime",
  "tokusatsu",
  "movie",
  "series",
];

export function TypeFilter({
  activeFilter,
  onFilterChange,
  showAll = true,
}: TypeFilterProps) {
  const filters = showAll ? FILTERS : FILTERS.filter((f) => f !== "all");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <TouchableOpacity
            key={filter}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onFilterChange(filter)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {ContentTypeLabel[filter]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  chipActive: {
    backgroundColor: Accent.primary,
    borderColor: Accent.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: Colors.dark.textSecondary,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontFamily: FontFamily.semibold,
  },
});
