import { Colors, FontFamily, FontSize, Radius } from "@/constants/theme";
import type { SearchResult } from "@/types";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PosterCardProps {
  item: SearchResult;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function PosterCard({ item, onPress, onLongPress }: PosterCardProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.posterWrapper}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
      >
        <View style={styles.posterContainer}>
          {item.posterUrl ? (
            <Image
              source={{ uri: item.posterUrl }}
              style={styles.poster}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 110,
    marginRight: 8,
  },
  posterWrapper: {
    width: "100%",
    height: 160,
    marginBottom: 4,
  },
  posterContainer: {
    flex: 1,
    borderRadius: Radius.sm,
    overflow: "hidden",
    backgroundColor: Colors.dark.surface,
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
  },
  title: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.medium,
    color: Colors.dark.text,
    textAlign: "center",
  },
});
