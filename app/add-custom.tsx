import { GradientButton } from "@/components/gradient-button";
import {
  Accent,
  Colors,
  ContentTypeLabel,
  FontFamily,
  FontSize,
  Radius,
  Spacing,
} from "@/constants/theme";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { ContentType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUIStore } from "@/stores/ui-store";

const TYPE_OPTIONS: ContentType[] = ["movie", "anime", "series", "tokusatsu"];

export default function AddCustomScreen() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ContentType>("movie");
  const [note, setNote] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addCustomItem } = useWatchlistStore();
  const { showToast } = useUIStore();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      showToast({ message: "กรุณาใส่ชื่อเรื่อง", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addCustomItem({
        title: title.trim(),
        type,
        note: note.trim() || undefined,
        posterUrl: image || undefined,
        status: "not_watched",
        source: "custom",
      });
      showToast({ message: "เพิ่มรายการแล้ว", type: "success" });
      router.back();
    } catch {
      showToast({ message: "ไม่สามารถเพิ่มรายการได้", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }, [title, type, note, image, addCustomItem, showToast]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>เพิ่มรายการเอง</Text>
          <Text style={styles.subtitle}>
            เพิ่มหนัง อนิเมะ ซีรีส์ หรือโทคุซัทสึ ที่ค้นหาไม่เจอ
          </Text>

          <View style={styles.imageSection}>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.selectedImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons
                    name="image-outline"
                    size={48}
                    color={Colors.dark.textMuted}
                  />
                  <Text style={styles.placeholderText}>เพิ่มรูปปก</Text>
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Ionicons
                  name={image ? "pencil" : "add"}
                  size={16}
                  color="#FFF"
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ชื่อเรื่อง *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="ชื่อเรื่อง (ไทยหรืออังกฤษ)"
              placeholderTextColor={Colors.dark.textMuted}
              selectionColor={Accent.primary}
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ประเภท</Text>
            <View style={styles.typeGrid}>
              {TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.typeOption,
                    type === option && styles.typeOptionActive,
                  ]}
                  onPress={() => setType(option)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      type === option && styles.typeOptionTextActive,
                    ]}
                  >
                    {ContentTypeLabel[option]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>หมายเหตุ (ไม่บังคับ)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={note}
              onChangeText={setNote}
              placeholder="เพิ่มหมายเหตุ..."
              placeholderTextColor={Colors.dark.textMuted}
              selectionColor={Accent.primary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <GradientButton
              title="เพิ่มเข้า Watchlist"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={!title.trim()}
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.dark.textMuted,
    marginBottom: Spacing.xl,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semibold,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    color: Colors.dark.text,
  },
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.md,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  typeOption: {
    flex: 1,
    minWidth: "40%",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: "center",
  },
  typeOptionActive: {
    borderColor: Accent.primary,
    backgroundColor: Accent.primary + "15",
  },
  typeOptionText: {
    fontSize: FontSize.sm,
    color: Colors.dark.textSecondary,
    fontFamily: FontFamily.medium,
  },
  typeOptionTextActive: {
    color: Accent.primary,
    fontFamily: FontFamily.bold,
  },
  buttonContainer: {
    marginTop: Spacing.md,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  imagePicker: {
    width: 120,
    height: 180,
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  placeholderText: {
    fontSize: FontSize.xs,
    color: Colors.dark.textMuted,
    fontFamily: FontFamily.medium,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
