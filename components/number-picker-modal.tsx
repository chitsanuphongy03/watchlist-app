import { Accent, Colors, FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface NumberPickerModalProps {
  visible: boolean;
  initialValue: number;
  title: string;
  subtitle: string;
  min?: number;
  max?: number;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}

export function NumberPickerModal({
  visible,
  initialValue,
  title,
  subtitle,
  min = 1,
  max = 365,
  onConfirm,
  onCancel,
}: NumberPickerModalProps) {
  const [value, setValue] = useState(initialValue.toString());

  useEffect(() => {
    if (visible) {
      setValue(initialValue.toString());
    }
  }, [visible, initialValue]);

  const handleConfirm = () => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      onConfirm(num);
    }
  };

  const numValue = parseInt(value, 10);
  const isValid = !isNaN(numValue) && numValue >= min && numValue <= max;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9]/g, "");
                setValue(filtered);
              }}
              placeholder={min.toString()}
              placeholderTextColor={Colors.dark.textMuted}
              keyboardType="number-pad"
              maxLength={3}
              selectTextOnFocus
            />
            <Text style={styles.unit}>วัน</Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, !isValid && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!isValid}
          >
            <Text
              style={[
                styles.confirmButtonText,
                !isValid && styles.confirmButtonTextDisabled,
              ]}
            >
              ตกลง
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  container: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.semibold,
    color: Colors.dark.text,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  input: {
    width: 100,
    height: 70,
    backgroundColor: Colors.dark.background,
    borderRadius: Radius.md,
    textAlign: "center",
    fontSize: 32,
    fontFamily: FontFamily.bold,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  unit: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.medium,
    color: Colors.dark.text,
    marginLeft: Spacing.md,
  },
  confirmButton: {
    backgroundColor: Accent.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.dark.border,
  },
  confirmButtonText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.dark.text,
  },
  confirmButtonTextDisabled: {
    color: Colors.dark.textMuted,
  },
});
